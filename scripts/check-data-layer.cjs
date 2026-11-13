'use strict';

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const { createCollection, createDatabase, createMemoryAdapter, createStorageAdapter, createTableDataSource, createCrudDataSource, createFilterBuilderMatcher, createBroadcastAdapter, createDataInspector, DataSyncError, DataValidationError, version } = require('../dist/data/jquan-data.cjs');
const fs = require('fs');
const vm = require('vm');
const { indexedDB } = require('fake-indexeddb');

(async () => {

assert(version === '0.2.0', 'data layer version should be 0.2.0');
const events = [];
const contacts = createCollection('contacts', { indexes: ['status'], compositeIndexes: [['status', 'score']] });
const unsubscribe = contacts.subscribe(event => events.push(event.type));
contacts.insert([
  { id: 1, name: 'Ada', status: 'active', score: 8, tags: ['vip'] },
  { id: 2, name: 'Lin', status: 'paused', score: 4, tags: [] },
  { id: 3, name: 'Bo', status: 'active', score: 10, tags: ['vip', 'new'] }
]);
assert(contacts.query({ status: 'active' }).orderBy({ score: 'desc' }).first().name === 'Bo', 'query ordering failed');
const cachedQuery = contacts.query({ status: 'active' }, { cache: true });
assert(cachedQuery.all().length === cachedQuery.all().length, 'query cache failed');
const diagnosis = contacts.diagnose();
assert(diagnosis.indexes.includes('status') && diagnosis.operations.queries > 0, 'diagnose failed');
assert(createDataInspector(contacts).snapshot().diagnose.size === contacts.size, 'data inspector failed');
const stableQuery = contacts.query({ status: 'active' });
assert(stableQuery.first().name === 'Ada' && stableQuery.count() === 2, 'first() mutated query state');
assert(contacts.explain({ status: 'active' }).strategy === 'index', 'indexed query strategy failed');
assert(contacts.explain({ status: 'active', score: 10 }).fields.join(',') === 'status,score', 'composite index strategy failed');
assert(contacts.explain({ score: { $gte: 8 } }).strategy === 'scan', 'complex query should use scan strategy');
assert(contacts.query({ score: { $gte: 8 }, tags: { $contains: 'vip' } }).count() === 2, 'operator query failed');
assert(contacts.query().groupBy('status').active.length === 2, 'groupBy failed');
const page = contacts.query().orderBy({ score: 'desc' }).paginate(1, 2);
assert(page.total === 3 && page.pages === 2 && page.data[0].name === 'Bo', 'pagination failed');
assert(contacts.query().average('score') === 22 / 3, 'average failed');
assert(contacts.query().min('score') === 4 && contacts.query().max('score') === 10, 'min/max failed');
assert(contacts.query().distinct('status').length === 2, 'distinct failed');
const unique = createCollection('unique', { unique: ['email'], validate: record => typeof record.email === 'string' });
unique.insert({ id: 1, email: 'a@example.com' });
let duplicateRejected = false;
try { unique.insert({ id: 2, email: 'a@example.com' }); } catch { duplicateRejected = true; }
assert(duplicateRejected && unique.size === 1, 'unique constraint failed');
let invalidRejected = false;
try { unique.insert({ id: 2, email: 42 }); } catch { invalidRejected = true; }
assert(invalidRejected, 'record validation failed');
let fieldError = null;
try { createCollection('field-error', { schema: { email: { type: 'string', required: true } }, data: [{ id: 1, email: 42 }] }); } catch (error) { fieldError = error; }
assert(fieldError instanceof DataValidationError && fieldError.field === 'email', 'field validation error failed');
const versioned = createCollection('versioned', {
  schemaVersion: 2,
  schema: { name: { type: 'string', required: true }, active: { type: 'boolean', default: true } },
  migrations: { 2(record) { return { ...record, name: String(record.label || record.name || '') }; } }
});
versioned.import([{ id: 1, label: 'Migrated' }], { version: 1 });
assert(versioned.get(1).name === 'Migrated' && versioned.get(1).active === true, 'schema migration/default failed');
const snapshotData = versioned.exportSnapshot();
const restoredSnapshot = createCollection('restored-snapshot', { schemaVersion: 2, schema: { name: { type: 'string', required: true }, active: { type: 'boolean', default: true } } });
restoredSnapshot.importSnapshot({ ...snapshotData, collection: 'restored-snapshot' });
assert(restoredSnapshot.get(1).name === 'Migrated' && restoredSnapshot.get(1).active === true, 'snapshot metadata roundtrip failed');
const companies = createCollection('companies', { data: [{ id: 7, title: 'Jquan' }] });
const joined = createCollection('joined', { data: [{ id: 1, companyId: 7, name: 'Ada' }] });
assert(joined.query().join(companies, { local: 'companyId', foreign: 'id', as: 'company' }).first().company.title === 'Jquan', 'relation join failed');
const syncSource = createCollection('sync-source', { historyLimit: 10, data: [{ id: 1, status: 'new' }] });
const syncRevision = syncSource.revision;
syncSource.update({ id: 1 }, { status: 'sent' });
const changes = syncSource.changes(syncRevision);
const syncTarget = createCollection('sync-target');
syncTarget.applyChanges(changes);
assert(syncTarget.get(1).status === 'sent' && changes[0].revision > syncRevision && syncTarget.pendingChanges().length === 0, 'change log apply/outbox isolation failed');
let pushedPayload = null;
const syncResult = await syncSource.sync({
  async pull(payload) { return { cursor: payload.since, changes: [] }; },
  async push(payload) { pushedPayload = payload; return { accepted: payload.changes.length }; }
}, { cursor: syncRevision });
assert(syncResult.pushed === 1 && pushedPayload.collection === 'sync-source', 'sync transport failed');
assert(syncSource.syncStatus().status === 'success' && changes[0].eventId, 'sync status/event id failed');
const syncAgain = await syncSource.sync({ async pull() { return { changes: [] }; }, async push() { throw new Error('should not resend acknowledged event'); } }, { cursor: syncRevision });
assert(syncAgain.pushed === 0 && syncSource.pendingChanges(syncRevision).length === 0, 'acknowledged event queue failed');
assert(syncSource.pendingChanges().length === 0, 'cursor acknowledgement did not prune outbox');
const offlineSource = createCollection('offline-source');
offlineSource.insert({ id: 1 });
try { await offlineSource.sync({ async pull() { throw new Error('offline'); } }, { retries: 0 }); } catch {}
assert(offlineSource.pendingChanges().length === 1 && offlineSource.syncStatus().status === 'failed', 'offline pending queue failed');
const dedupeTarget = createCollection('dedupe-target');
dedupeTarget.applyChanges(changes); dedupeTarget.applyChanges(changes);
assert(dedupeTarget.size === 1, 'duplicate event dedupe failed');
let retryCount = 0;
const retrySource = createCollection('retry-source');
const retryResult = await retrySource.sync({ async pull() { retryCount += 1; if (retryCount < 2) throw new Error('temporary'); return { changes: [] }; } }, { retries: 1, retryDelay: 1 });
assert(retryResult.pulled === 0 && retryCount === 2, 'sync retry failed');
let timeoutError = null;
try { await retrySource.sync({ async pull() { return new Promise(() => {}); } }, { timeout: 5 }); } catch (error) { timeoutError = error; }
assert(timeoutError instanceof DataSyncError && timeoutError.code === 'SYNC_TIMEOUT', 'sync timeout failed');
let timeoutRetries = 0;
const timeoutRetrySource = createCollection('timeout-retry');
const timeoutRetryResult = await timeoutRetrySource.sync({ async pull() { timeoutRetries += 1; if (timeoutRetries === 1) return new Promise(() => {}); return { changes: [] }; } }, { timeout: 5, retries: 1, retryDelay: 1 });
assert(timeoutRetryResult.pulled === 0 && timeoutRetries === 2, 'timeout retry failed');
const channelMessages = [];
const channel = { publish(message) { channelMessages.push(message); }, subscribe(listener) { this.listener = listener; return () => { this.listener = null; }; } };
const tab = createCollection('tabs');
const stopTab = tab.connect(channel);
channel.listener({ collection: 'tabs', source: 'other-tab', events: [{ type: 'insert', collection: 'tabs', records: [{ id: 2, value: 'b' }], revision: 1, at: Date.now() }] });
tab.insert({ id: 3, value: 'local' });
assert(tab.get(2).value === 'b' && channelMessages.length === 1, 'cross-tab connection failed');
tab.transaction(collection => { collection.insert({ id: 4, value: 'batch-a' }); collection.insert({ id: 5, value: 'batch-b' }); });
assert(channelMessages.length === 2 && channelMessages[1].events.length === 2, 'cross-tab batch connection failed');
stopTab();
const boundedHistory = createCollection('bounded-history', { historyLimit: 2 });
boundedHistory.insert({ id: 1 }); boundedHistory.insert({ id: 2 }); boundedHistory.insert({ id: 3 });
assert(boundedHistory.changesSince(0).gap === true && boundedHistory.changesSince(1).gap === false && boundedHistory.pendingChanges().length === 3, 'history gap/outbox independence failed');
const boundedSync = await boundedHistory.sync({ async pull() { return { changes: [] }; }, async push(payload) { return { accepted: payload.changes.length }; } });
assert(boundedSync.pushed === 3 && boundedHistory.pendingChanges().length === 0, 'bounded history outbox sync failed');
const recoverSource = createCollection('recover-source', { historyLimit: 1, data: [{ id: 1, value: 'local' }] });
recoverSource.insert({ id: 2, value: 'newer' });
let recoveryPushes = 0;
const recoverResult = await recoverSource.sync({
  async pull() { return { changes: [] }; },
  async pullSnapshot() { return { format: 'jquanui-data', version: 1, schemaVersion: 1, collection: 'recover-source', records: [{ id: 9, value: 'snapshot' }] }; },
  async push() { recoveryPushes += 1; return {}; }
}, { cursor: 0, recoverOnGap: true });
assert(recoverResult.recovered === true && recoveryPushes === 0 && recoverSource.get(9).value === 'snapshot', 'snapshot recovery failed');
const conflicts = [];
const conflictSource = createCollection('conflicts', {
  data: [{ id: 1, value: 'local' }],
  resolveConflict({ local, incoming }) { return { ...local, value: `${local.value}+${incoming.value}` }; },
  onConflict(event) { conflicts.push(event.resolution); }
});
conflictSource.applyChanges([{ type: 'update', collection: 'conflicts', records: [{ id: 1, value: 'remote' }], revision: 1, at: Date.now() }]);
assert(conflictSource.get(1).value === 'local+remote' && conflicts[0] === 'merged', 'conflict resolver failed');
const browserContext = { window: {}, globalThis: {} };
browserContext.window = browserContext;
browserContext.globalThis = browserContext;
vm.runInNewContext(fs.readFileSync('dist/data/JquanUI@Data.js', 'utf8'), browserContext);
assert(browserContext.JquanUIData?.version === version && typeof browserContext.JquanUIData.createCollection === 'function', 'browser data entry failed');
contacts.update({ id: 2 }, { status: 'active' });
contacts.upsert({ id: 4, name: 'Mei', status: 'active', score: 6 });
assert(contacts.size === 4 && contacts.get(2).status === 'active', 'update/upsert failed');
contacts.transaction(collection => { collection.update({ id: 1 }, { score: 9 }); collection.remove(3); });
assert(events.includes('batch'), 'transaction event failed');
const rollbackSize = contacts.size;
const rollbackRevision = contacts.revision;
const rollbackHistory = contacts.changes();
const rollbackOutbox = contacts.pendingChanges();
let rolledBack = false;
try { contacts.transaction(collection => { collection.insert({ id: 99, name: 'Temporary' }); throw new Error('rollback'); }); } catch { rolledBack = true; }
assert(rolledBack && contacts.size === rollbackSize && !contacts.has(99) && contacts.revision === rollbackRevision && JSON.stringify(contacts.changes()) === JSON.stringify(rollbackHistory) && JSON.stringify(contacts.pendingChanges()) === JSON.stringify(rollbackOutbox), 'transaction rollback failed');
const snapshot = contacts.export();
const database = createDatabase().import({ contacts: snapshot });
assert(database.collection('contacts').size === 3, 'database snapshot failed');
unsubscribe();
const liveRows = [];
const stopLive = contacts.liveQuery({ status: 'active' }, rows => liveRows.push(rows.length));
contacts.insert({ id: 5, name: 'Yu', status: 'paused' });
contacts.update({ id: 5 }, { status: 'active' });
assert(liveRows.join(',') === '3,4', 'live query failed');
stopLive();
const debouncedRows = [];
const stopDebounced = contacts.liveQuery({ status: 'active' }, rows => debouncedRows.push(rows.length), { immediate: false, debounce: 5 });
contacts.update({ id: 1 }, { status: 'paused' });
contacts.update({ id: 2 }, { status: 'active' });
await new Promise(resolve => setTimeout(resolve, 15));
assert(debouncedRows.length === 1, 'live query debounce failed');
stopDebounced();
contacts.update({ id: 1 }, { status: 'active' });
const adapter = createMemoryAdapter([{ id: 9, name: 'Persisted' }]);
const restored = createCollection('restored');
const stopPersist = await Promise.resolve(restored.persist(adapter));
assert(restored.get(9).name === 'Persisted', 'memory persistence load failed');
restored.insert({ id: 10, name: 'Saved' });
await new Promise(resolve => setTimeout(resolve, 5));
const persistedRows = await adapter.load();
assert(persistedRows.format === 'jquanui-data-state' && persistedRows.records.length === 2, 'memory persistence save failed');
await stopPersist.close();
const durableAdapter = createMemoryAdapter();
const durable = createCollection('durable', { historyLimit: 10 });
const stopDurable = await durable.persist(durableAdapter, { debounce: 1 });
durable.insert({ name: 'Ada' });
durable.update({ name: 'Ada' }, { status: 'active' });
const durableRevision = durable.revision;
const durableChanges = durable.changes();
const durableSync = await durable.sync({ async pull() { return { changes: [] }; }, async push(payload) { return { accepted: payload.changes.length }; } });
assert(durableSync.pushed === durableChanges.length, 'durable persistence sync setup failed');
await new Promise(resolve => setTimeout(resolve, 5));
await stopDurable.close();
const durableState = await durableAdapter.load();
assert(durableState.format === 'jquanui-data-state' && durableState.revision === durableRevision && durableState.changeLog.length === durableChanges.length, 'durable state metadata was not saved');
const restoredEvents = [];
const restoredDurable = createCollection('durable', { historyLimit: 10 });
restoredDurable.subscribe(event => restoredEvents.push(event.type));
const stopRestoredDurable = await restoredDurable.persist(durableAdapter);
assert(restoredDurable.size === 1 && restoredDurable.revision === durableRevision && restoredDurable.changes().length === durableChanges.length, 'durable state metadata was not restored');
assert(restoredDurable.pendingChanges().length === 0 && restoredEvents.length === 0, 'restored sync state emitted or requeued changes');
const generatedAfterRestore = restoredDurable.insert({ name: 'Lin' });
assert(generatedAfterRestore.id === 'durable-2', 'persisted sequence was not restored');
await stopRestoredDurable.close();
const legacyAdapter = createMemoryAdapter([{ id: 1, name: 'Legacy' }]);
const legacyCollection = createCollection('legacy');
await legacyCollection.persist(legacyAdapter);
assert(legacyCollection.get(1).name === 'Legacy' && legacyCollection.revision === 0, 'legacy array persistence compatibility failed');
const legacyGeneratedAdapter = createMemoryAdapter([{ name: 'Legacy generated' }]);
const legacyGenerated = createCollection('legacy-generated');
await legacyGenerated.persist(legacyGeneratedAdapter);
assert(legacyGenerated.insert({ name: 'Next' }).id === 'legacy-generated-2', 'legacy generated sequence recovery failed');
let invalidPersistedStateRejected = false;
try {
  await createCollection('invalid-state').persist(createMemoryAdapter({ format: 'jquanui-data-state', version: 1, collection: 'invalid-state', schemaVersion: 1, sequence: 0, revision: -1, records: [], changeLog: [], pendingChanges: [], seenEventIds: [], acknowledgedEventIds: [] }));
} catch (error) { invalidPersistedStateRejected = error instanceof TypeError; }
assert(invalidPersistedStateRejected, 'invalid persisted state validation failed');
const recoveryAdapter = createMemoryAdapter();
const recoverySeed = createCollection('backup-recovery');
const recoverySeedHandle = await recoverySeed.persist(recoveryAdapter);
recoverySeed.insert({ id: 1, value: 'valid' });
await recoverySeedHandle.flush();
const validRecoveryState = await recoveryAdapter.load();
await recoveryAdapter.saveBackup(validRecoveryState);
await recoveryAdapter.save({ ...validRecoveryState, revision: -1 });
await recoverySeedHandle.close();
let corruptContext = null;
const recoveredCollection = createCollection('backup-recovery');
const recoveredHandle = await recoveredCollection.persist(recoveryAdapter, { onCorrupt(context) { corruptContext = context; } });
assert(recoveredCollection.get(1).value === 'valid' && corruptContext?.recovered === true, 'backup corruption recovery failed');
await recoveredHandle.close();
assert((await recoveryAdapter.load()).revision >= 1, 'recovered primary state was not repaired');
const flushAdapter = createMemoryAdapter();
const flushCollection = createCollection('flush-close');
const flushHandle = await flushCollection.persist(flushAdapter, { debounce: 100 });
flushCollection.insert({ id: 1 });
assert(flushHandle.status().state === 'scheduled', 'persistence scheduled status failed');
await flushHandle.flush();
assert((await flushAdapter.load()).records.length === 1 && flushHandle.status().state === 'idle', 'persistence flush failed');
flushCollection.insert({ id: 2 });
await flushHandle.close();
assert((await flushAdapter.load()).records.length === 2 && flushHandle.status().state === 'closed', 'persistence close failed');
let orderedPersistedState = null;
const orderedPersistence = createCollection('ordered-persistence');
const stopOrderedPersistence = await orderedPersistence.persist({
  async load() { return null; },
  async save(state) {
    const delay = state.revision === 1 ? 15 : 1;
    await new Promise(resolve => setTimeout(resolve, delay));
    orderedPersistedState = JSON.parse(JSON.stringify(state));
    return true;
  }
});
orderedPersistence.insert({ id: 1 });
await new Promise(resolve => setTimeout(resolve, 3));
orderedPersistence.insert({ id: 2 });
await new Promise(resolve => setTimeout(resolve, 30));
assert(orderedPersistedState.revision === 2 && orderedPersistedState.records.length === 2, 'ordered automatic persistence failed');
await stopOrderedPersistence.close();
let persistenceError = null;
let persistenceSaveCount = 0;
const persistenceFailure = createCollection('persistence-failure');
const stopPersistenceFailure = await persistenceFailure.persist({
  async load() { return null; },
  async save() { persistenceSaveCount += 1; if (persistenceSaveCount > 1) throw new Error('write failed'); return true; }
}, { onError(error) { persistenceError = error; } });
persistenceFailure.insert({ id: 1 });
await new Promise(resolve => setTimeout(resolve, 5));
assert(persistenceError?.message === 'write failed', 'automatic persistence error callback failed');
let failedFlush = false;
try { await stopPersistenceFailure.flush(); } catch { failedFlush = true; }
assert(failedFlush && stopPersistenceFailure.status().state === 'failed', 'persistence failure status failed');
try { await stopPersistenceFailure.close(); } catch {}
const indexedDatabaseName = `jquanui-check-${Date.now()}`;
const indexedAdapter = require('../dist/data/jquan-data.cjs').createIndexedDBAdapter({ indexedDB, name: indexedDatabaseName, store: 'snapshots', key: 'contacts', version: 1 });
await indexedAdapter.save([{ id: 1, value: 'first' }]);
assert((await indexedAdapter.load())[0].value === 'first', 'IndexedDB save/load failed');
assert(indexedAdapter.stores.includes('snapshots') && typeof indexedAdapter.estimate === 'function', 'IndexedDB production API failed');
await Promise.all([
  indexedAdapter.save([{ id: 2, value: 'parallel-a' }]),
  indexedAdapter.save([{ id: 3, value: 'parallel-b' }])
]);
assert((await indexedAdapter.load())[0].id === 3, 'IndexedDB ordered concurrent save failed');
await indexedAdapter.saveBackup([{ id: 8, value: 'backup' }]);
assert((await indexedAdapter.loadBackup())[0].id === 8, 'IndexedDB backup slot failed');
const upgradedAdapter = require('../dist/data/jquan-data.cjs').createIndexedDBAdapter({ indexedDB, name: indexedDatabaseName, store: 'upgraded', key: 'snapshot', version: 2 });
await upgradedAdapter.save([{ id: 4, value: 'upgraded' }]);
assert((await upgradedAdapter.load())[0].value === 'upgraded', 'IndexedDB upgrade failed');
const autoUpgradeAdapter = require('../dist/data/jquan-data.cjs').createIndexedDBAdapter({ indexedDB, name: indexedDatabaseName, store: 'auto-upgraded', key: 'snapshot' });
await autoUpgradeAdapter.save([{ id: 5, value: 'auto-upgraded' }]);
assert((await autoUpgradeAdapter.load())[0].value === 'auto-upgraded' && autoUpgradeAdapter.stores.includes('auto-upgraded'), 'IndexedDB automatic store upgrade failed');
await upgradedAdapter.clear();
assert((await upgradedAdapter.load()) == null, 'IndexedDB clear failed');
await indexedAdapter.deleteDatabase();
assert((await indexedAdapter.load()) == null, 'IndexedDB database delete failed');
const storageValues = new Map();
const storageAdapter = createStorageAdapter({
  key: 'contacts',
  storage: {
    get(key, fallback) { return storageValues.has(key) ? storageValues.get(key) : fallback; },
    set(key, value) { storageValues.set(key, value); },
    remove(key) { storageValues.delete(key); }
  }
});
await storageAdapter.save([{ id: 1 }]);
assert((await storageAdapter.load())[0].id === 1, 'storage adapter failed');
await storageAdapter.saveBackup([{ id: 2 }]);
assert((await storageAdapter.loadBackup())[0].id === 2, 'storage adapter backup failed');
await storageAdapter.clear();
assert((await storageAdapter.load()) === null && (await storageAdapter.loadBackup()) === null, 'storage adapter clear failed');
const tableSource = createTableDataSource(contacts);
const tablePage = await tableSource.load({ page: 1, pageSize: 2, sort: { key: 'score', order: 'desc' }, filters: { name: 'a' } });
assert(tablePage.total === 1 && tablePage.data[0].name === 'Ada', 'table data source failed');
const crudSource = createCrudDataSource(contacts);
const created = await crudSource.create({ id: 6, name: 'JQ', status: 'active', score: 7 });
assert(created.name === 'JQ', 'crud create failed');
const updated = await crudSource.update(created, { score: 11 });
assert(updated.score === 11 && contacts.get(6).score === 11, 'crud update failed');
const removed = await crudSource.remove(updated);
assert(removed.id === 6 && !contacts.has(6), 'crud remove failed');
const filterMatcher = createFilterBuilderMatcher({ logic: 'AND', rules: [{ field: 'status', operator: 'equals', value: 'active' }, { field: 'score', operator: 'gte', value: 8 }] });
assert(contacts.find(filterMatcher).length === 1, 'filter builder matcher failed');
console.log('[JquanUI] data layer check ok');
})().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
