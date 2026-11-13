'use strict';

const DATA_VERSION = '0.2.0';
const PERSISTENCE_FORMAT = 'jquanui-data-state';
const PERSISTENCE_VERSION = 1;

class DataSyncError extends Error {
  constructor(message, code = 'SYNC_FAILED', cause = null) {
    super(message);
    this.name = 'DataSyncError';
    this.code = code;
    this.cause = cause;
  }
}

class DataStorageError extends Error {
  constructor(message, code = 'STORAGE_FAILED', cause = null) { super(message); this.name = 'DataStorageError'; this.code = code; this.cause = cause; }
}
class DataValidationError extends Error {
  constructor(message, field, expected, value) { super(message); this.name = 'DataValidationError'; this.code = 'VALIDATION_FAILED'; this.field = field; this.expected = expected; this.value = value; }
}

function wait(milliseconds, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DataSyncError('Sync operation was cancelled.', 'SYNC_ABORTED'));
    const timer = setTimeout(resolve, milliseconds);
    signal?.addEventListener('abort', () => { clearTimeout(timer); reject(new DataSyncError('Sync operation was cancelled.', 'SYNC_ABORTED')); }, { once: true });
  });
}

async function runSyncOperation(operation, payload, options = {}) {
  const timeout = Math.max(0, Number(options.timeout) || 0);
  const retries = Math.max(0, Number(options.retries) || 0);
  const retryDelay = Math.max(0, Number(options.retryDelay) || 250);
  const retryOn = typeof options.retryOn === 'function' ? options.retryOn : () => true;
  let attempt = 0;
  while (true) {
    if (options.signal?.aborted) throw new DataSyncError('Sync operation was cancelled.', 'SYNC_ABORTED');
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const signal = options.signal || controller?.signal;
    let timer;
    try {
      const request = operation({ ...payload, signal });
      const timeoutPromise = timeout && controller ? new Promise((_, reject) => {
        timer = setTimeout(() => { controller.abort(); reject(new DataSyncError('Sync operation timed out.', 'SYNC_TIMEOUT')); }, timeout);
      }) : null;
      return await (timeoutPromise ? Promise.race([request, timeoutPromise]) : request);
    } catch (error) {
      if (options.signal?.aborted || error?.code === 'SYNC_ABORTED') throw new DataSyncError('Sync operation was cancelled.', 'SYNC_ABORTED', error);
      if (error?.code === 'SYNC_TIMEOUT') {
        if (attempt >= retries) throw error;
        attempt += 1;
        await wait(retryDelay * Math.pow(2, attempt - 1), options.signal);
        continue;
      }
      if (attempt >= retries || !retryOn(error, attempt + 1)) throw new DataSyncError('Sync operation failed.', 'SYNC_FAILED', error);
      attempt += 1;
      await wait(retryDelay * Math.pow(2, attempt - 1), options.signal);
    } finally { if (timer) clearTimeout(timer); }
  }
}

function clone(value) {
  if (value == null || typeof value !== 'object') return value;
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function pathGet(object, path) {
  if (!path) return object;
  return String(path).split('.').reduce((value, key) => value == null ? undefined : value[key], object);
}

function equal(a, b) {
  return Object.is(a, b) || (a !== a && b !== b);
}

function testValue(actual, expected) {
  if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
    return Object.entries(expected).every(([operator, value]) => {
      if (operator === '$eq') return equal(actual, value);
      if (operator === '$ne') return !equal(actual, value);
      if (operator === '$gt') return actual > value;
      if (operator === '$gte') return actual >= value;
      if (operator === '$lt') return actual < value;
      if (operator === '$lte') return actual <= value;
      if (operator === '$in') return Array.isArray(value) && value.some(item => equal(actual, item));
      if (operator === '$nin') return Array.isArray(value) && !value.some(item => equal(actual, item));
      if (operator === '$contains') return Array.isArray(actual) ? actual.some(item => equal(item, value)) : String(actual ?? '').includes(String(value));
      if (operator === '$exists') return value ? actual !== undefined : actual === undefined;
      if (operator === '$regex') return new RegExp(value).test(String(actual ?? ''));
      return false;
    });
  }
  return equal(actual, expected);
}

function matches(record, matcher) {
  if (typeof matcher === 'function') return !!matcher(record);
  if (matcher == null) return true;
  if (typeof matcher !== 'object') return false;
  return Object.entries(matcher).every(([key, expected]) => key === '$or'
    ? expected.some(item => matches(record, item))
    : key === '$and'
      ? expected.every(item => matches(record, item))
      : testValue(pathGet(record, key), expected));
}

function normalizeSort(sort) {
  if (typeof sort === 'string') return [[sort, 'asc']];
  if (Array.isArray(sort)) return sort.map(item => Array.isArray(item) ? item : [item, 'asc']);
  if (sort && typeof sort === 'object') return Object.entries(sort);
  return [];
}

function createMemoryAdapter(initial = null) {
  let snapshot = clone(initial);
  let backup = null;
  return {
    async load() { return clone(snapshot); },
    async save(value) { snapshot = clone(value); return true; },
    async loadBackup() { return clone(backup); },
    async saveBackup(value) { backup = clone(value); return true; },
    async clear() { snapshot = null; backup = null; return true; }
  };
}

function createStorageAdapter(options = {}) {
  const storage = options.storage || globalThis.JquanUIComponents?.storageApi;
  if (!storage || typeof storage.get !== 'function' || typeof storage.set !== 'function') throw new Error('[JquanUI data] storageApi with get() and set() is required.');
  const key = options.key || 'jquanui-data';
  const backupKey = options.backupKey || `${key}:backup`;
  const driver = options.driver;
  const driverOptions = driver ? { driver } : {};
  return {
    async load() { return clone(storage.get(key, null, driverOptions)); },
    async save(value) { storage.set(key, clone(value), driverOptions); return true; },
    async loadBackup() { return clone(storage.get(backupKey, null, driverOptions)); },
    async saveBackup(value) { storage.set(backupKey, clone(value), driverOptions); return true; },
    async clear() { if (typeof storage.remove === 'function') { storage.remove(key, driverOptions); storage.remove(backupKey, driverOptions); } return true; }
  };
}

function createIndexedDBAdapter(options = {}) {
  const indexedDB = options.indexedDB || globalThis.indexedDB;
  if (!indexedDB) throw new Error('[JquanUI data] IndexedDB is unavailable in this environment.');
  const databaseName = options.name || 'jquanui-data';
  const storeName = options.store || 'snapshots';
  const storeNames = Array.from(new Set([storeName, ...(Array.isArray(options.stores) ? options.stores : [])]));
  const key = options.key || 'default';
  const backupKey = options.backupKey || (typeof key === 'string' ? `${key}:backup` : ['jquanui-backup', key]);
  const requestedVersion = Number(options.version);
  const hasRequestedVersion = Number.isInteger(requestedVersion) && requestedVersion > 0;
  let writeQueue = Promise.resolve();
  function storageError(message, error) {
    if (error instanceof DataStorageError) return error;
    const code = error?.name === 'QuotaExceededError' ? 'STORAGE_QUOTA' : 'STORAGE_FAILED';
    return new DataStorageError(message, code, error);
  }
  function openRaw(version) {
    return new Promise((resolve, reject) => {
      let request;
      let settled = false;
      const fail = error => { if (!settled) { settled = true; reject(storageError('IndexedDB open failed.', error)); } };
      try { request = version ? indexedDB.open(databaseName, version) : indexedDB.open(databaseName); } catch (error) { fail(error); return; }
      request.onupgradeneeded = () => {
        const db = request.result;
        storeNames.forEach(store => { if (!db.objectStoreNames.contains(store)) db.createObjectStore(store); });
      };
      request.onblocked = () => fail(new Error('IndexedDB upgrade is blocked by another open connection.'));
      request.onsuccess = () => {
        if (settled) { request.result.close(); return; }
        const db = request.result;
        db.onversionchange = () => db.close();
        settled = true;
        resolve(db);
      };
      request.onerror = () => fail(request.error);
    });
  }
  async function open() {
    let db;
    try {
      db = await openRaw(hasRequestedVersion ? requestedVersion : undefined);
    } catch (error) {
      if (!hasRequestedVersion || error?.cause?.name !== 'VersionError') throw error;
      db = await openRaw();
    }
    const missingStores = storeNames.filter(store => !db.objectStoreNames.contains(store));
    if (!missingStores.length) return db;
    const nextVersion = Math.max(db.version + 1, hasRequestedVersion ? requestedVersion + 1 : 1);
    db.close();
    return openRaw(nextVersion);
  }
  function transact(mode, action) {
    return open().then(db => new Promise((resolve, reject) => {
      let settled = false;
      let request;
      let transaction;
      const finish = (error, value) => {
        if (settled) return;
        settled = true;
        db.close();
        if (error) reject(storageError('IndexedDB transaction failed.', error));
        else resolve(value);
      };
      try {
        transaction = db.transaction(storeName, mode);
        transaction.oncomplete = () => finish(null, request?.result);
        transaction.onerror = () => finish(transaction.error || new Error('IndexedDB transaction failed.'));
        transaction.onabort = () => finish(transaction.error || new Error('IndexedDB transaction aborted.'));
        request = action(transaction.objectStore(storeName));
        if (!request || typeof request !== 'object') throw new TypeError('IndexedDB action must return an IDBRequest.');
        request.onerror = () => finish(request.error || new Error('IndexedDB request failed.'));
      } catch (error) {
        try { transaction?.abort(); } catch {}
        finish(error);
      }
    }));
  }
  function enqueueWrite(operation) {
    const result = writeQueue.then(operation, operation);
    writeQueue = result.catch(() => {});
    return result;
  }
  return {
    async load() { await writeQueue; return clone(await transact('readonly', store => store.get(key))); },
    async save(value) { return enqueueWrite(async () => { await transact('readwrite', store => store.put(clone(value), key)); return true; }); },
    async loadBackup() { await writeQueue; return clone(await transact('readonly', store => store.get(backupKey))); },
    async saveBackup(value) { return enqueueWrite(async () => { await transact('readwrite', store => store.put(clone(value), backupKey)); return true; }); },
    async clear() { return enqueueWrite(async () => { await transact('readwrite', store => store.delete(key)); await transact('readwrite', store => store.delete(backupKey)); return true; }); },
    async estimate() { const storage = globalThis.navigator?.storage; return storage?.estimate ? storage.estimate() : null; },
    async deleteDatabase() { await writeQueue; return new Promise((resolve, reject) => { let request; try { request = indexedDB.deleteDatabase(databaseName); } catch (error) { reject(storageError('IndexedDB delete failed.', error)); return; } request.onblocked = () => reject(new DataStorageError('IndexedDB delete is blocked by another open connection.', 'STORAGE_FAILED')); request.onsuccess = () => resolve(true); request.onerror = () => reject(storageError('IndexedDB delete failed.', request.error)); }); },
    stores: storeNames.slice()
  };
}

function createHttpSyncAdapter(options = {}) {
  const http = options.http || globalThis.JquanUIComponents?.httpApi;
  if (!http || typeof http.get !== 'function' || typeof http.post !== 'function') throw new Error('[JquanUI data] httpApi with get() and post() is required.');
  const pullUrl = options.pull || options.pullUrl;
  const pushUrl = options.push || options.pushUrl;
  if (!pullUrl || !pushUrl) throw new Error('[JquanUI data] Sync adapter needs pull and push URLs.');
  return {
    async pull(payload) { const { signal, ...params } = payload || {}; const response = await http.get(pullUrl, { params, signal }); return response?.data || {}; },
    async push(payload) { const { signal, ...body } = payload || {}; const response = await http.post(pushUrl, body, { signal }); return response?.data || {}; }
  };
}

function createBroadcastAdapter(options = {}) {
  const Broadcast = options.BroadcastChannel || globalThis.BroadcastChannel;
  if (typeof Broadcast !== 'function') throw new Error('[JquanUI data] BroadcastChannel is unavailable in this environment.');
  const channel = options.channel || options.name || 'jquanui-data';
  const instance = new Broadcast(channel);
  return {
    publish(message) { instance.postMessage(clone(message)); },
    subscribe(listener) {
      if (typeof listener !== 'function') return () => {};
      const handler = event => listener(clone(event.data));
      if (instance.addEventListener) instance.addEventListener('message', handler); else instance.onmessage = handler;
      return () => { if (instance.removeEventListener) instance.removeEventListener('message', handler); else instance.onmessage = null; };
    },
    close() { if (typeof instance.close === 'function') instance.close(); }
  };
}

function createDataInspector(collection) {
  if (!collection || typeof collection.diagnose !== 'function') throw new TypeError('[JquanUI data] createDataInspector() needs a collection.');
  return {
    snapshot(matcher) { return { diagnose: collection.diagnose(), sync: collection.syncStatus(), explain: matcher === undefined ? null : collection.explain(matcher) }; },
    render(target, matcher) {
      const node = typeof target === 'string' ? globalThis.document?.querySelector(target) : target;
      if (!node) throw new TypeError('[JquanUI data] Inspector target was not found.');
      const data = this.snapshot(matcher);
      node.innerHTML = `<div class="grid gap-2 text-sm font-mono"><div>collection: ${data.diagnose.name}</div><div>records: ${data.diagnose.size}</div><div>revision: ${data.diagnose.revision}</div><div>queries: ${data.diagnose.operations.queries}</div><div>sync: ${data.sync.status}</div></div>`;
      return data;
    }
  };
}

function createTableDataSource(collection, options = {}) {
  if (!collection || typeof collection.query !== 'function') throw new TypeError('[JquanUI data] createTableDataSource() needs a collection.');
  const filter = typeof options.filter === 'function' ? options.filter : null;
  return {
    async load(payload = {}) {
      const filters = payload.filters || {};
      const matcher = record => Object.entries(filters).every(([field, value]) => {
        const text = String(value ?? '').trim().toLowerCase();
        if (!text) return true;
        if (filter) return filter(field, text, record);
        return String(pathGet(record, field) ?? '').toLowerCase().includes(text);
      });
      let query = collection.query(matcher);
      if (payload.sort?.key) query = query.orderBy({ [payload.sort.key]: payload.sort.order === 'desc' ? 'desc' : 'asc' });
      const page = query.paginate(payload.page || 1, payload.pageSize || 10);
      return { data: page.data, total: page.total };
    }
  };
}

function createCrudDataSource(collection, options = {}) {
  if (!collection || typeof collection.insert !== 'function' || typeof collection.update !== 'function') throw new TypeError('[JquanUI data] createCrudDataSource() needs a collection.');
  const key = options.primaryKey || collection.primaryKey || 'id';
  const table = createTableDataSource(collection, options);
  return {
    list: table.load,
    async create(values) { return collection.insert(values); },
    async update(row, values) {
      const id = row?.[key] ?? values?.[key];
      if (id == null) throw new Error(`[JquanUI data] Missing primary key: ${key}.`);
      const changed = collection.update({ [key]: id }, values);
      return changed[0] || null;
    },
    async remove(row) {
      const id = row?.[key];
      if (id == null) throw new Error(`[JquanUI data] Missing primary key: ${key}.`);
      return collection.remove(id)[0] || null;
    }
  };
}

function createFilterBuilderMatcher(payload = {}) {
  const rules = Array.isArray(payload.rules) ? payload.rules : [];
  const matchers = rules.filter(rule => rule && rule.field).map(rule => {
    const value = rule.value;
    switch (rule.operator) {
      case 'equals': return { [rule.field]: value };
      case 'notEquals': return { [rule.field]: { $ne: value } };
      case 'contains': return { [rule.field]: { $contains: value } };
      case 'startsWith': return record => String(pathGet(record, rule.field) ?? '').startsWith(String(value));
      case 'endsWith': return record => String(pathGet(record, rule.field) ?? '').endsWith(String(value));
      case 'gt': return { [rule.field]: { $gt: value } };
      case 'gte': return { [rule.field]: { $gte: value } };
      case 'lt': return { [rule.field]: { $lt: value } };
      case 'lte': return { [rule.field]: { $lte: value } };
      case 'in': return { [rule.field]: { $in: String(value ?? '').split(',').map(item => item.trim()) } };
      default: return null;
    }
  }).filter(Boolean);
  if (!matchers.length) return () => true;
  if (String(payload.logic).toUpperCase() === 'OR') return record => matchers.some(matcher => matches(record, matcher));
  return record => matchers.every(matcher => matches(record, matcher));
}

function createQuery(collection, matcher, options = {}) {
  const state = { filters: matcher ? [matcher] : [], sort: [], offset: 0, limit: Infinity, projection: null, joins: [] };
  let cachedRevision = -1;
  let cachedSignature = '';
  let cachedRows = null;
  const query = {
    where(next) { state.filters.push(next); return query; },
    orderBy(sort) { state.sort = normalizeSort(sort); return query; },
    offset(value) { state.offset = Math.max(0, Number(value) || 0); return query; },
    limit(value) { state.limit = Math.max(0, Number(value) || 0); return query; },
    select(fields) { state.projection = Array.isArray(fields) ? fields : String(fields).split(',').map(item => item.trim()); return query; },
    all() {
      collection._stats.queries += 1;
      const signature = options.cache ? JSON.stringify({ filters: state.filters, sort: state.sort, offset: state.offset, limit: state.limit, projection: state.projection, joins: state.joins.map(join => ({ local: join.local, foreign: join.foreign, as: join.as, many: join.many, name: join.collection.name })) }) : '';
      if (options.cache && cachedRows && cachedRevision === collection.revision && cachedSignature === signature) return clone(cachedRows);
      let rows = collection._recordsForMatcher(state.filters[0]).filter(record => state.filters.every(filter => matches(record, filter)));
      if (state.sort.length) rows.sort((a, b) => {
        for (const [field, direction] of state.sort) {
          const av = pathGet(a, field), bv = pathGet(b, field);
          if (equal(av, bv)) continue;
          const result = av > bv ? 1 : -1;
          return String(direction).toLowerCase() === 'desc' ? -result : result;
        }
        return 0;
      });
      rows = rows.slice(state.offset, state.limit === Infinity ? undefined : state.offset + state.limit);
      const joinLookups = state.joins.map(join => {
        const map = new Map();
        join.collection._records().forEach(item => {
          const value = pathGet(item, join.foreign);
          if (!map.has(value)) map.set(value, []);
          map.get(value).push(item);
        });
        return { join, map };
      });
      rows = rows.map(record => {
        const joined = clone(record);
        joinLookups.forEach(({ join, map }) => {
          const matches = map.get(pathGet(record, join.local)) || [];
          joined[join.as] = join.many ? clone(matches) : clone(matches[0] || null);
        });
        return joined;
      });
      const result = rows.map(record => state.projection ? state.projection.reduce((out, field) => { out[field] = clone(pathGet(record, field)); return out; }, {}) : clone(record));
      if (options.cache) { cachedRevision = collection.revision; cachedSignature = signature; cachedRows = clone(result); }
      return result;
    },
    first() { return query.all()[0] || null; },
    count() { return query.all().length; },
    exists() { return !!query.first(); },
    sum(field) { return query.all().reduce((total, row) => total + (Number(pathGet(row, field)) || 0), 0); },
    average(field) { const rows = query.all(); return rows.length ? query.sum(field) / rows.length : 0; },
    min(field) { return query.all().reduce((value, row) => { const next = pathGet(row, field); return value === undefined || next < value ? next : value; }, undefined); },
    max(field) { return query.all().reduce((value, row) => { const next = pathGet(row, field); return value === undefined || next > value ? next : value; }, undefined); },
    join(target, options = {}) {
      if (!target || typeof target.find !== 'function') throw new TypeError('[JquanUI data] Query.join() needs another collection.');
      state.joins.push({ collection: target, local: options.local || `${target.name}Id`, foreign: options.foreign || target.primaryKey || 'id', as: options.as || target.name, many: options.many === true });
      return query;
    },
    pluck(field) { return query.all().map(row => clone(pathGet(row, field))); },
    distinct(field) { return Array.from(new Set(query.pluck(field).map(value => JSON.stringify(value)))).map(value => JSON.parse(value)); },
    paginate(page = 1, pageSize = 20) {
      const safePageSize = Math.max(1, Number(pageSize) || 20);
      const safePage = Math.max(1, Number(page) || 1);
      const previousOffset = state.offset, previousLimit = state.limit;
      state.offset = 0; state.limit = Infinity;
      const total = query.all().length;
      state.offset = (safePage - 1) * safePageSize; state.limit = safePageSize;
      const data = query.all();
      state.offset = previousOffset; state.limit = previousLimit;
      return { data, page: safePage, pageSize: safePageSize, total, pages: Math.ceil(total / safePageSize) };
    },
    groupBy(field) { return query.all().reduce((groups, row) => { const key = pathGet(row, field); (groups[key] ||= []).push(row); return groups; }, {}); },
    toArray() { return query.all(); }
  };
  return query;
}

function createCollection(name, options = {}) {
  const key = options.primaryKey || 'id';
  const records = new Map();
  const listeners = new Set();
  const indexes = new Map();
  const indexedFields = new Set(options.indexes || []);
  const compositeIndexes = (options.compositeIndexes || []).filter(fields => Array.isArray(fields) && fields.length > 1).map(fields => fields.map(String));
  const compositeMaps = new Map();
  const uniqueFields = new Set(options.unique || []);
  const validator = typeof options.validate === 'function' ? options.validate : null;
  const schema = options.schema && typeof options.schema === 'object' ? options.schema : {};
  const schemaVersion = Math.max(1, Number(options.schemaVersion) || 1);
  const migrations = options.migrations && typeof options.migrations === 'object' ? options.migrations : {};
  let sequence = 0;
  let revision = 0;
  let historyEnabled = true;
  let outboxEnabled = true;
  const conflictResolver = typeof options.resolveConflict === 'function' ? options.resolveConflict : null;
  const conflictListener = typeof options.onConflict === 'function' ? options.onConflict : null;
  const changeLog = [];
  const outbox = [];
  const historyLimit = Math.max(0, Number(options.historyLimit ?? 500));
  let batching = false;
  let pending = [];
  const stats = { queries: 0, mutations: 0 };
  const seenEvents = new Set();
  const acknowledgedEvents = new Set();
  const persistenceListeners = new Set();
  let syncState = { status: 'idle', startedAt: null, finishedAt: null, error: null };

  function idFor(record) { return record[key] == null ? `${name}-${++sequence}` : record[key]; }
  function emit(type, rows, meta = {}) {
    const event = { type, collection: name, eventId: `${name}-${revision + 1}-${Math.random().toString(36).slice(2)}`, records: clone(rows), meta, revision: ++revision, at: Date.now() };
    seenEvents.add(event.eventId);
    if (historyEnabled && historyLimit > 0) { changeLog.push(event); while (changeLog.length > historyLimit) changeLog.shift(); }
    if (outboxEnabled) outbox.push(event);
    if (batching) pending.push(event); else listeners.forEach(listener => listener(event));
    persistenceListeners.forEach(listener => listener());
  }
  function notifyPersistence() { persistenceListeners.forEach(listener => listener()); }
  function buildPersistenceState() {
    return {
      format: PERSISTENCE_FORMAT,
      version: PERSISTENCE_VERSION,
      collection: name,
      schemaVersion,
      sequence,
      revision,
      records: api.export(),
      changeLog: clone(changeLog),
      pendingChanges: clone(outbox.filter(event => !acknowledgedEvents.has(event.eventId))),
      seenEventIds: Array.from(seenEvents),
      acknowledgedEventIds: Array.from(acknowledgedEvents)
    };
  }
  function restorePersistedState(saved) {
    const legacy = Array.isArray(saved);
    if (!legacy) {
      if (!saved || typeof saved !== 'object' || saved.format !== PERSISTENCE_FORMAT || Number(saved.version) !== PERSISTENCE_VERSION) {
        throw new TypeError(`[JquanUI data] Invalid persisted state for collection "${name}".`);
      }
      if (saved.collection !== name) throw new TypeError(`[JquanUI data] Persisted state belongs to collection "${saved.collection || 'unknown'}".`);
      if (!Array.isArray(saved.records) || !Array.isArray(saved.changeLog) || !Array.isArray(saved.pendingChanges) || !Array.isArray(saved.seenEventIds) || !Array.isArray(saved.acknowledgedEventIds)) {
        throw new TypeError(`[JquanUI data] Persisted state for collection "${name}" is incomplete.`);
      }
      if (!Number.isInteger(saved.revision) || saved.revision < 0 || !Number.isInteger(saved.sequence) || saved.sequence < 0) {
        throw new TypeError(`[JquanUI data] Persisted state counters for collection "${name}" are invalid.`);
      }
      if (!Number.isInteger(saved.schemaVersion) || saved.schemaVersion < 1) throw new TypeError(`[JquanUI data] Persisted schema version for collection "${name}" is invalid.`);
      if (!saved.changeLog.every(event => event && typeof event === 'object') || !saved.pendingChanges.every(event => event && typeof event === 'object') || !saved.seenEventIds.every(eventId => typeof eventId === 'string') || !saved.acknowledgedEventIds.every(eventId => typeof eventId === 'string')) {
        throw new TypeError(`[JquanUI data] Persisted sync state for collection "${name}" is invalid.`);
      }
    }
    const rows = migrateRecords(legacy ? saved : saved.records, legacy ? 1 : saved.schemaVersion || 1);
    const previousRecords = Array.from(records.values());
    const previousSequence = sequence;
    records.clear();
    try {
      const ids = new Set();
      let nextSequence = legacy ? 0 : saved.sequence;
      rows.forEach(row => {
        const record = clone(row);
        const id = record[key] == null ? `${name}-${++nextSequence}` : record[key];
        if (ids.has(id)) throw new Error(`[JquanUI data] Duplicate primary key in persisted state: ${id}.`);
        ids.add(id);
        record[key] = id;
        validateRecord(record, undefined);
        records.set(id, record);
      });
    } catch (error) {
      records.clear(); previousRecords.forEach(record => records.set(record[key], record)); sequence = previousSequence; rebuildIndexes();
      throw error;
    }
    const derivedSequence = Array.from(records.values()).reduce((maximum, row) => {
      const value = row?.[key];
      const prefix = `${name}-`;
      if (typeof value !== 'string' || !value.startsWith(prefix)) return maximum;
      const candidate = Number(value.slice(prefix.length));
      return Number.isInteger(candidate) ? Math.max(maximum, candidate) : maximum;
    }, 0);
    sequence = Math.max(derivedSequence, legacy ? 0 : saved.sequence);
    revision = legacy ? 0 : saved.revision;
    changeLog.splice(0, changeLog.length, ...(legacy ? [] : clone(saved.changeLog)));
    if (historyLimit >= 0 && changeLog.length > historyLimit) changeLog.splice(0, changeLog.length - historyLimit);
    outbox.splice(0, outbox.length, ...(legacy ? [] : clone(saved.pendingChanges)));
    seenEvents.clear();
    const restoredPending = legacy ? [] : outbox;
    [...(legacy ? [] : saved.seenEventIds), ...changeLog, ...restoredPending].forEach(event => {
      const eventId = typeof event === 'string' ? event : event?.eventId;
      if (eventId) seenEvents.add(eventId);
    });
    acknowledgedEvents.clear();
    (legacy ? [] : saved.acknowledgedEventIds).filter(eventId => typeof eventId === 'string').forEach(eventId => acknowledgedEvents.add(eventId));
    pending = [];
    batching = false;
    syncState = { status: 'idle', startedAt: null, finishedAt: null, error: null };
    rebuildIndexes();
  }
  function rebuildIndexes() {
    indexes.clear();
    compositeMaps.clear();
    indexedFields.forEach(field => indexes.set(field, new Map()));
    records.forEach(record => indexedFields.forEach(field => {
      const value = pathGet(record, field); const map = indexes.get(field);
      if (!map.has(value)) map.set(value, new Set());
      map.get(value).add(record[key]);
    }));
    compositeIndexes.forEach(fields => {
      const id = fields.join('|');
      const map = new Map();
      compositeMaps.set(id, map);
      records.forEach(record => {
        const values = fields.map(field => pathGet(record, field));
        if (values.some(value => value === undefined)) return;
        const lookup = JSON.stringify(values);
        if (!map.has(lookup)) map.set(lookup, new Set());
        map.get(lookup).add(record[key]);
      });
    });
  }
  function addIndexedRecord(record) {
    indexedFields.forEach(field => {
      const value = pathGet(record, field); const map = indexes.get(field);
      if (!map.has(value)) map.set(value, new Set());
      map.get(value).add(record[key]);
    });
    compositeIndexes.forEach(fields => {
      const values = fields.map(field => pathGet(record, field));
      if (values.some(value => value === undefined)) return;
      const map = compositeMaps.get(fields.join('|')); const lookup = JSON.stringify(values);
      if (!map.has(lookup)) map.set(lookup, new Set());
      map.get(lookup).add(record[key]);
    });
  }
  function removeIndexedRecord(record) {
    indexedFields.forEach(field => {
      const map = indexes.get(field); const bucket = map?.get(pathGet(record, field));
      if (bucket) { bucket.delete(record[key]); if (!bucket.size) map.delete(pathGet(record, field)); }
    });
    compositeIndexes.forEach(fields => {
      const map = compositeMaps.get(fields.join('|')); const values = fields.map(field => pathGet(record, field));
      const bucket = map?.get(JSON.stringify(values));
      if (bucket) { bucket.delete(record[key]); if (!bucket.size) map.delete(JSON.stringify(values)); }
    });
  }
  function validateRecord(record, existingId) {
    if (!record || typeof record !== 'object' || Array.isArray(record)) throw new TypeError(`[JquanUI data] ${name} records must be plain objects.`);
    if (validator && validator(record) === false) throw new Error(`[JquanUI data] Validation failed in collection "${name}".`);
    for (const field of uniqueFields) {
      const value = pathGet(record, field);
      if (value === undefined) continue;
      for (const [id, current] of records) {
        if (!equal(id, existingId) && equal(pathGet(current, field), value)) throw new Error(`[JquanUI data] Unique constraint failed: ${field}.`);
      }
    }
    return record;
  }
  function applySchema(record) {
    const next = clone(record || {});
    Object.entries(schema).forEach(([field, definition]) => {
      const config = definition && typeof definition === 'object' ? definition : { type: definition };
      if (next[field] === undefined && Object.prototype.hasOwnProperty.call(config, 'default')) next[field] = typeof config.default === 'function' ? config.default(next) : clone(config.default);
      if (next[field] !== undefined && config.type) {
        const type = String(config.type).toLowerCase();
        const valid = type === 'array' ? Array.isArray(next[field]) : type === 'object' ? next[field] && typeof next[field] === 'object' && !Array.isArray(next[field]) : type === 'null' ? next[field] === null : typeof next[field] === type;
        if (!valid) throw new DataValidationError(`[JquanUI data] Invalid schema type for ${name}.${field}.`, field, type, next[field]);
      }
      if (config.required && next[field] === undefined) throw new DataValidationError(`[JquanUI data] Missing required field: ${name}.${field}.`, field, 'required', undefined);
      if (typeof config.validate === 'function' && !config.validate(next[field], next)) throw new DataValidationError(`[JquanUI data] Schema validation failed for ${name}.${field}.`, field, 'custom', next[field]);
    });
    return next;
  }
  function migrateRecords(records, fromVersion = 1) {
    let next = clone(records || []);
    for (let current = Math.max(1, Number(fromVersion) || 1); current < schemaVersion; current += 1) {
      const migrate = migrations[current + 1] || migrations[String(current + 1)];
      if (typeof migrate === 'function') next = next.map(record => migrate(clone(record), current, current + 1));
    }
    return next.map(applySchema);
  }
  function recordsForMatcher(matcher) {
    if (!matcher || typeof matcher !== 'object' || Array.isArray(matcher) || Object.keys(matcher).some(key => key.startsWith('$'))) return api._records();
    const candidates = [];
    compositeIndexes.forEach(fields => {
      const values = fields.map(field => pathGet(matcher, field));
      if (values.some(value => value === undefined || (value && typeof value === 'object'))) return;
      const ids = compositeMaps.get(fields.join('|'))?.get(JSON.stringify(values));
      if (ids) candidates.push(ids);
    });
    indexedFields.forEach(field => {
      const expected = pathGet(matcher, field);
      if (expected === undefined || (expected && typeof expected === 'object')) return;
      const ids = indexes.get(field)?.get(expected);
      if (ids) candidates.push(ids);
    });
    if (!candidates.length) return api._records();
    const ids = candidates.reduce((smallest, current) => current.size < smallest.size ? current : smallest);
    return Array.from(ids, id => records.get(id)).filter(Boolean);
  }
  const api = {
    name,
    primaryKey: key,
    get size() { return records.size; },
    get revision() { return revision; },
    _records: () => Array.from(records.values()),
    _recordsForMatcher: recordsForMatcher,
    _stats: stats,
    diagnose() {
      const firstRevision = changeLog.length ? changeLog[0].revision : revision + 1;
      return {
        name,
        size: records.size,
        revision,
        indexes: Array.from(indexedFields),
        history: { size: changeLog.length, limit: historyLimit, firstRevision, gapFrom: firstRevision > 1 ? firstRevision - 1 : null },
        outbox: { pending: outbox.filter(event => !acknowledgedEvents.has(event.eventId)).length, acknowledged: acknowledgedEvents.size },
        operations: { queries: stats.queries, mutations: stats.mutations }
      };
    },
    syncStatus() { return clone(syncState); },
    explain(matcher) {
      const fields = Array.from(indexedFields).filter(field => {
        const value = pathGet(matcher, field);
        return value !== undefined && !(value && typeof value === 'object');
      });
      const composite = compositeIndexes.find(index => index.every(field => { const value = pathGet(matcher, field); return value !== undefined && !(value && typeof value === 'object'); }));
      return { strategy: fields.length || composite ? 'index' : 'scan', fields: composite ? composite.slice() : Array.from(fields), candidateCount: fields.length || composite ? recordsForMatcher(matcher).length : records.size };
    },
    changes(since = 0) { return clone(changeLog.filter(event => event.revision > (Number(since) || 0))); },
    changesSince(since = 0) {
      const cursor = Number(since) || 0;
      const firstRevision = changeLog.length ? changeLog[0].revision : revision + 1;
      return { changes: api.changes(cursor), since: cursor, revision, firstRevision, gap: cursor < firstRevision - 1 };
    },
    pendingChanges(since = 0) { const cursor = Number(since) || 0; return clone(outbox.filter(event => (event.revision || 0) > cursor && !acknowledgedEvents.has(event.eventId))); },
    applyChanges(events, options = {}) {
      const list = Array.isArray(events) ? events : [];
      const previousHistory = historyEnabled;
      const previousOutbox = outboxEnabled;
      historyEnabled = options.recordHistory !== false;
      outboxEnabled = false;
      try {
        return api.transaction(() => {
          list.forEach(event => {
            if (event?.eventId && seenEvents.has(event.eventId)) return;
            if (event?.eventId) seenEvents.add(event.eventId);
            if (event.type === 'batch') api.applyChanges(event.events, options);
            else if (event.type === 'insert' || event.type === 'upsert' || event.type === 'update') {
              const rows = (event.records || []).map(incoming => {
                const current = records.get(incoming[key]);
                if (!current) return incoming;
                const resolver = options.resolveConflict || conflictResolver;
                if (!resolver) return incoming;
                const resolved = resolver({ local: clone(current), incoming: clone(incoming), event: clone(event), collection: name });
                if (resolved === null || resolved === false) {
                  if (conflictListener || options.onConflict) (options.onConflict || conflictListener)({ local: clone(current), incoming: clone(incoming), event: clone(event), resolution: 'rejected', collection: name });
                  return current;
                }
                if (conflictListener || options.onConflict) (options.onConflict || conflictListener)({ local: clone(current), incoming: clone(incoming), event: clone(event), resolution: 'merged', collection: name });
                return resolved === true ? incoming : resolved;
              });
              api.upsert(rows);
            }
            else if (event.type === 'remove') (event.records || []).forEach(record => api.remove(record[key]));
            else if (event.type === 'clear') api.clear();
          });
          return api;
        });
      } finally { historyEnabled = previousHistory; outboxEnabled = previousOutbox; }
    },
    async sync(transport, options = {}) {
      if (!transport || typeof transport.pull !== 'function') throw new TypeError('[JquanUI data] sync() needs a transport with pull().');
      const cursor = Number(options.cursor) || 0;
      const syncOptions = { timeout: options.timeout, retries: options.retries, retryDelay: options.retryDelay, retryOn: options.retryOn, signal: options.signal };
      syncState = { status: 'syncing', startedAt: Date.now(), finishedAt: null, error: null };
      try {
      const remote = await runSyncOperation(transport.pull, { collection: name, since: cursor }, syncOptions);
      const incoming = Array.isArray(remote?.changes) ? remote.changes : [];
      if (incoming.length) api.applyChanges(incoming, { recordHistory: false });
      let outboxChanged = false;
      if (cursor > 0) {
        for (let index = outbox.length - 1; index >= 0; index -= 1) {
          if ((outbox[index].revision || 0) <= cursor) { if (outbox[index].eventId) acknowledgedEvents.add(outbox[index].eventId); outbox.splice(index, 1); outboxChanged = true; }
        }
      }
      let outgoingState = api.changesSince(cursor);
      let outgoing = api.pendingChanges(cursor);
      let recovered = false;
      if (outgoingState.gap && options.recoverOnGap === true && typeof transport.pullSnapshot === 'function') {
        const snapshot = await runSyncOperation(transport.pullSnapshot, { collection: name, since: cursor }, syncOptions);
        if (snapshot?.format === 'jquanui-data' && Array.isArray(snapshot.records)) {
          api.importSnapshot(snapshot, { recordHistory: false, queueChanges: false });
          outbox.splice(0, outbox.length);
          outboxChanged = true;
          recovered = true;
          outgoingState = { ...api.changesSince(api.revision), gap: false };
          outgoing = [];
        }
      }
      let pushed = null;
      let pushedCount = 0;
      if (outgoing.length && typeof transport.push === 'function') {
        pushed = await runSyncOperation(transport.push, { collection: name, since: cursor, changes: outgoing }, syncOptions);
        pushedCount = outgoing.length;
        const acceptedIds = Array.isArray(pushed?.acceptedEventIds) ? pushed.acceptedEventIds : pushed?.accepted === outgoing.length ? outgoing.map(event => event.eventId) : [];
        acceptedIds.filter(Boolean).forEach(eventId => acknowledgedEvents.add(eventId));
        if (acceptedIds.length) {
          const accepted = new Set(acceptedIds);
          for (let index = outbox.length - 1; index >= 0; index -= 1) if (accepted.has(outbox[index].eventId)) { outbox.splice(index, 1); outboxChanged = true; }
        }
      }
      if (outboxChanged) notifyPersistence();
      const result = { collection: name, cursor: remote?.cursor ?? api.revision, revision: api.revision, pulled: incoming.length, pushed: pushedCount, response: pushed, gap: outgoingState.gap, recovered };
      syncState = { status: 'success', startedAt: syncState.startedAt, finishedAt: Date.now(), error: null };
      return result;
      } catch (error) {
        syncState = { status: 'failed', startedAt: syncState.startedAt, finishedAt: Date.now(), error: { name: error.name, code: error.code, message: error.message } };
        throw error;
      }
    },
    connect(adapter) {
      if (!adapter || typeof adapter.publish !== 'function' || typeof adapter.subscribe !== 'function') throw new TypeError('[JquanUI data] connect() needs a publish/subscribe adapter.');
      const source = `${name}-${Math.random().toString(36).slice(2)}`;
      let applying = false;
      const unsubscribe = adapter.subscribe(message => {
        if (!message || message.collection !== name || message.source === source || !Array.isArray(message.events)) return;
        applying = true;
        try { api.applyChanges(message.events, { recordHistory: false }); } finally { applying = false; }
      });
      const stopEvents = api.subscribe(event => { if (!applying) adapter.publish({ collection: name, source, events: event.type === 'batch' ? event.events : [event] }); });
      return () => { stopEvents(); unsubscribe(); };
    },
    validate(record) { validateRecord(record, record && record[key]); return true; },
    insert(input) {
      stats.mutations += 1;
      const rows = Array.isArray(input) ? input : [input];
      const batchIds = new Set();
      const batchUnique = new Map();
      const prepared = rows.map(item => { const record = applySchema(item); const id = idFor(record); if (records.has(id) || batchIds.has(id)) throw new Error(`[JquanUI data] Duplicate primary key: ${id}.`); batchIds.add(id); record[key] = id; for (const field of uniqueFields) { const value = pathGet(record, field); if (value !== undefined) { const seen = batchUnique.get(field) || new Set(); if (seen.has(value)) throw new Error(`[JquanUI data] Unique constraint failed: ${field}.`); seen.add(value); batchUnique.set(field, seen); } } return validateRecord(record, undefined); });
      const added = prepared.map(record => { records.set(record[key], record); return record; });
      if (added.length > 32) rebuildIndexes(); else added.forEach(addIndexedRecord);
      emit('insert', added); return Array.isArray(input) ? clone(added) : clone(added[0]);
    },
    upsert(input) {
      stats.mutations += 1;
      const rows = Array.isArray(input) ? input : [input]; const changed = [];
      rows.forEach(item => { const record = applySchema(item); const id = idFor(record); record[key] = id; changed.push(validateRecord(record, id)); });
      const batchUnique = new Map(); changed.forEach(record => uniqueFields.forEach(field => { const value = pathGet(record, field); if (value !== undefined) { const seen = batchUnique.get(field) || new Set(); if (seen.has(value)) throw new Error(`[JquanUI data] Unique constraint failed: ${field}.`); seen.add(value); batchUnique.set(field, seen); } }));
      changed.forEach(record => { const previous = records.get(record[key]); if (previous) removeIndexedRecord(previous); records.set(record[key], record); });
      if (changed.length > 32) rebuildIndexes(); else changed.forEach(addIndexedRecord);
      emit('upsert', changed); return Array.isArray(input) ? clone(changed) : clone(changed[0]);
    },
    get(id) { return clone(records.get(id) || null); },
    has(id) { return records.has(id); },
    find(matcher) { return createQuery(api, matcher).all(); },
    query(matcher, options = {}) { return createQuery(api, matcher, options); },
    update(matcher, patch) {
      stats.mutations += 1;
      const changed = []; records.forEach((record, id) => { if (matches(record, matcher)) { const next = typeof patch === 'function' ? patch(clone(record)) : Object.assign({}, record, clone(patch)); next[key] = id; changed.push(validateRecord(next, id)); } });
      changed.forEach(next => { const previous = records.get(next[key]); removeIndexedRecord(previous); records.set(next[key], next); addIndexedRecord(next); });
      if (changed.length) emit('update', changed); return clone(changed);
    },
    remove(matcher) {
      stats.mutations += 1;
      const removed = []; records.forEach((record, id) => { if (matches(record, matcher) || equal(id, matcher)) { removeIndexedRecord(record); records.delete(id); removed.push(record); } });
      if (removed.length) emit('remove', removed); return clone(removed);
    },
    clear() { stats.mutations += 1; const removed = api._records(); records.clear(); rebuildIndexes(); if (removed.length) emit('clear', removed); return removed.length; },
    index(field) { indexedFields.add(field); rebuildIndexes(); return api; },
    indexComposite(fields) { if (Array.isArray(fields) && fields.length > 1) { const normalized = fields.map(String); if (!compositeIndexes.some(index => JSON.stringify(index) === JSON.stringify(normalized))) compositeIndexes.push(normalized); rebuildIndexes(); } return api; },
    transaction(callback) {
      const snapshot = clone(api._records());
      const previousSequence = sequence;
      const previousRevision = revision;
      const previousHistory = changeLog.slice();
      const previousOutbox = outbox.slice();
      const previousSeenEvents = new Set(seenEvents);
      const previousAcknowledgedEvents = new Set(acknowledgedEvents);
      const previousBatching = batching;
      const previousPending = pending;
      batching = true;
      pending = [];
      try {
        const result = callback(api);
        batching = false;
        if (pending.length) { const events = pending; pending = []; listeners.forEach(listener => listener({ type: 'batch', collection: name, events, at: Date.now() })); }
        pending = previousPending;
        batching = previousBatching;
        return result;
      } catch (error) {
        records.clear(); snapshot.forEach(record => records.set(record[key], record));
        sequence = previousSequence;
        revision = previousRevision;
        changeLog.splice(0, changeLog.length, ...previousHistory);
        outbox.splice(0, outbox.length, ...previousOutbox);
        seenEvents.clear(); previousSeenEvents.forEach(eventId => seenEvents.add(eventId));
        acknowledgedEvents.clear(); previousAcknowledgedEvents.forEach(eventId => acknowledgedEvents.add(eventId));
        rebuildIndexes();
        batching = previousBatching;
        pending = previousPending;
        throw error;
      }
    },
    subscribe(listener) { if (typeof listener !== 'function') return () => {}; listeners.add(listener); return () => listeners.delete(listener); },
    liveQuery(matcher, listener, options = {}) {
      if (typeof listener !== 'function') return () => {};
      const query = () => createQuery(api, matcher, { cache: options.cache === true }).all();
      let current = query();
      if (options.immediate !== false) listener(clone(current), { type: 'init', collection: name, at: Date.now() });
      let timer = null;
      const run = event => { const next = query(); if (options.equals ? !options.equals(current, next) : JSON.stringify(current) !== JSON.stringify(next)) { const previous = current; current = next; listener(clone(next), Object.assign({}, event, { previous: clone(previous) })); } };
      const unsubscribe = api.subscribe(event => { if (options.debounce > 0) { clearTimeout(timer); timer = setTimeout(() => run(event), Number(options.debounce)); } else run(event); });
      return () => { clearTimeout(timer); unsubscribe(); };
    },
    async persist(adapter, options = {}) {
      if (!adapter || typeof adapter.load !== 'function' || typeof adapter.save !== 'function') throw new TypeError('[JquanUI data] persist() needs load() and save() methods.');
      let lastSavedState = null;
      if (options.load !== false) {
        const saved = await adapter.load();
        if (saved != null) {
          try { restorePersistedState(saved); lastSavedState = clone(saved); }
          catch (error) {
            let recovered = false;
            let backupError = null;
            if (options.backup !== false && typeof adapter.loadBackup === 'function') {
              try {
                const backup = await adapter.loadBackup();
                if (backup != null) { restorePersistedState(backup); lastSavedState = clone(backup); recovered = true; }
              } catch (failure) { backupError = failure; }
            }
            if (typeof options.onCorrupt === 'function') options.onCorrupt({ collection: name, error, recovered, backupError });
            if (!recovered) throw error;
          }
        }
      }
      let timer = null;
      let saveQueue = Promise.resolve();
      let dirty = false;
      let closed = false;
      let saving = 0;
      let lastError = null;
      const writeState = async state => {
        if (options.backup !== false && lastSavedState != null && typeof adapter.saveBackup === 'function') await adapter.saveBackup(lastSavedState);
        await adapter.save(state);
        lastSavedState = clone(state);
        return true;
      };
      const save = state => {
        saving += 1;
        const operation = saveQueue.then(() => writeState(state));
        saveQueue = operation.then(
          result => { saving -= 1; lastError = null; return result; },
          error => {
            saving -= 1;
            lastError = error;
            if (typeof options.onError === 'function') { try { options.onError(error); } catch {} }
            return false;
          }
        );
        return operation;
      };
      const scheduleSave = () => {
        if (closed) return;
        dirty = true;
        clearTimeout(timer);
        timer = setTimeout(() => { timer = null; dirty = false; save(buildPersistenceState()).catch(() => {}); }, Number(options.debounce) || 0);
      };
      persistenceListeners.add(scheduleSave);
      try { if (options.save !== false) await save(buildPersistenceState()); }
      catch (error) { persistenceListeners.delete(scheduleSave); throw error; }
      const handle = function stopPersistence() { return handle.close(); };
      handle.flush = async () => {
        if (timer) { clearTimeout(timer); timer = null; }
        if (dirty) { dirty = false; await save(buildPersistenceState()); }
        else await saveQueue;
        if (lastError) throw lastError;
        return true;
      };
      handle.close = async () => {
        if (!closed) { closed = true; persistenceListeners.delete(scheduleSave); }
        return handle.flush();
      };
      handle.status = () => ({ state: closed ? 'closed' : lastError ? 'failed' : timer ? 'scheduled' : saving ? 'saving' : 'idle', error: lastError });
      return handle;
    },
    export() { return clone(api._records()); },
    exportSnapshot() { return { format: 'jquanui-data', version: 1, schemaVersion, collection: name, records: api.export() }; },
    importSnapshot(snapshot, options = {}) {
      if (!snapshot || snapshot.format !== 'jquanui-data') throw new TypeError(`[JquanUI data] Invalid snapshot for collection "${name}".`);
      return api.import(snapshot.records, { ...options, version: snapshot.schemaVersion || options.version || 1 });
    },
    import(data, options = {}) {
      const rows = migrateRecords(Array.isArray(data) ? data : [], options.version || 1);
      const previousHistory = historyEnabled;
      const previousOutbox = outboxEnabled;
      historyEnabled = options.recordHistory !== false;
      outboxEnabled = options.queueChanges !== false;
      try {
        if (options.replace !== false) { records.clear(); rebuildIndexes(); }
        api.insert(rows);
        return api;
      } finally { historyEnabled = previousHistory; outboxEnabled = previousOutbox; }
    }
  };
  rebuildIndexes();
  if (options.data) api.insert(options.data);
  return api;
}

function createDatabase(options = {}) {
  const collections = new Map();
  return {
    version: DATA_VERSION,
    collection(name, config = {}) { if (!collections.has(name)) collections.set(name, createCollection(name, config)); return collections.get(name); },
    has(name) { return collections.has(name); },
    drop(name) { return collections.delete(name); },
    collections() { return Array.from(collections.keys()); },
    export() { return Object.fromEntries(Array.from(collections, ([name, collection]) => [name, collection.export()])); },
    import(snapshot, config = {}) { Object.entries(snapshot || {}).forEach(([name, rows]) => this.collection(name, config[name]).import(rows)); return this; }
  };
}

function liveQuery(collection, matcher, listener, options = {}) { return collection.liveQuery(matcher, listener, options); }

const api = { version: DATA_VERSION, DataSyncError, DataStorageError, DataValidationError, createCollection, createDatabase, createMemoryAdapter, createStorageAdapter, createIndexedDBAdapter, createHttpSyncAdapter, createBroadcastAdapter, createDataInspector, createTableDataSource, createCrudDataSource, createFilterBuilderMatcher, liveQuery, matches, clone };
module.exports = api;
