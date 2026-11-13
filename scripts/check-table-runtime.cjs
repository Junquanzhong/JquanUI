'use strict';
const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function fixture(file = 'dist/components/table.js', options = {}) {
    const elements = new Map();
    class Element {
        constructor(id) { this.id = id; this.innerHTML = ''; this.onclick = null; elements.set(id, this); }
        querySelector() { return null; }
        querySelectorAll() { return []; }
        contains() { return false; }
    }
    const document = { querySelector: selector => elements.get(selector.replace(/^#/, '')) || null, getElementById: id => elements.get(id), activeElement: null };
    const context = { document, HTMLElement: Element, console, AbortController: options.abort === false ? undefined : AbortController, JquanUIComponents: {} };
    context.window = context;
    vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8'), context);
    return { element: id => new Element(id), api: context.JquanUIComponents.tableApi };
}
function deferred() {
    let resolve, reject;
    const promise = new Promise((ok, fail) => { resolve = ok; reject = fail; });
    return { promise, resolve, reject };
}

async function main() {
    let count = 0;
    const verify = (value, message) => { assert(value, message); count++; };
    for (const abort of [true, false]) {
        const f = fixture(undefined, { abort });
        const element = f.element(`race-${abort}`);
        const requests = [];
        const handle = await f.api.mount(element, {
            columns: [{ key: 'name', title: 'Name' }],
            remote: { enabled: true, load(payload) { if (payload.reason === 'init') return [{ id: 0, name: 'initial' }]; const task = deferred(); requests.push({ payload, ...task }); return task.promise; } }
        });
        const old = handle.reload('old');
        const fresh = handle.reload('fresh');
        verify(requests[1].payload.requestId > requests[0].payload.requestId, 'Request IDs increase');
        verify(abort ? requests[0].payload.signal.aborted : requests[0].payload.signal === null, 'Superseded requests abort when supported');
        requests[1].resolve({ data: [{ id: 2, name: 'new' }], total: 0 }); await fresh;
        requests[0].resolve([{ id: 1, name: 'old' }]); await old;
        verify(element.innerHTML.includes('>new<') && !element.innerHTML.includes('>old<'), 'Slow old results never overwrite newer data');
        verify(handle.state().loading === false && handle.state().error === null, 'Success resets loading and error');
        const first = handle.reload('first');
        const last = handle.reload('last');
        requests[2].reject(new Error('stale failure')); await first;
        verify(handle.state().loading === true && handle.state().error === null, 'Stale rejection cannot clear current loading or set error');
        requests[3].resolve([{ id: 3, name: 'latest' }]); await last;
        const pending = handle.reload('destroy');
        const pendingRequest = requests[4];
        verify(handle.destroy() === true && handle.destroy() === false, 'Destroy is idempotent');
        verify(abort ? pendingRequest.payload.signal.aborted : true, 'Destroy aborts active requests');
        pendingRequest.resolve([{ id: 4, name: 'late' }]); await pending;
        verify(element.innerHTML === '' && f.api.get(element) === null, 'Destroyed tables cannot be resurrected by late results');
        verify(handle.state().destroyed === true && await handle.reload() === null, 'Destroyed handle reports state and reload is inert');
    }
    const errors = fixture();
    const element = errors.element('error');
    let failing = false, seenError;
    const error = new Error('network down');
    const handle = await errors.api.mount(element, { columns: [{ key: 'name' }], errorText: '<b>Retry</b>', onError(value) { seenError = value; }, remote: { enabled: true, load() { if (failing) throw error; return [{ id: 1, name: 'recovered' }]; } } });
    failing = true;
    await assert.rejects(handle.reload(), value => value === error); count++;
    verify(handle.state().error === error && handle.state().loading === false && seenError === error, 'Current errors are observable and loading ends');
    verify(element.innerHTML.includes('role="alert"') && element.innerHTML.includes('&lt;b&gt;Retry&lt;/b&gt;'), 'Error status renders escaped text');
    failing = false; await handle.reload();
    verify(handle.state().error === null && element.innerHTML.includes('>recovered<'), 'Reload recovers after failure');
    const awaiting = deferred();
    const init = fixture(); const initElement = init.element('init');
    const mounting = init.api.mount(initElement, { remote: { enabled: true, load() { return awaiting.promise; } } });
    const initialHandle = init.api.get(initElement); initialHandle.destroy();
    awaiting.resolve([]);
    verify(await mounting === null && initElement.innerHTML === '', 'Destroy while initial mount is pending returns null');
    const remount = fixture(); const remountElement = remount.element('same');
    const oldTask = deferred();
    const prior = await remount.api.mount(remountElement, { columns: [{ key: 'name' }], remote: { enabled: true, load(payload) { return payload.reason === 'init' ? [] : oldTask.promise; } } });
    const oldPending = prior.reload();
    const replacement = await remount.api.mount(remountElement, { columns: [{ key: 'name' }], data: [{ id: 1, name: 'replacement' }] });
    oldTask.resolve([{ id: 0, name: 'obsolete' }]); await oldPending;
    verify(prior.state().destroyed && remountElement.innerHTML.includes('>replacement<'), 'Remount retires the prior instance');
    verify(prior.update({ data: [] }) === null && prior.setFilter('name', 'bad') === null && prior.destroy() === false, 'Stale handles cannot mutate replacement');
    verify(remount.api.update(prior, { data: [] }) === null, 'API update also rejects a stale handle target');
    verify(remount.api.get(remountElement) === replacement, 'Get reuses the mounted handle');
    replacement.update({ remote: { enabled: false }, data: [{ id: 2, name: 'changed' }] });
    verify(remountElement.innerHTML.includes('>changed<'), 'Local update stays compatible');
    const update = fixture(); const updateElement = update.element('update'); const updateTask = deferred();
    const updated = await update.api.mount(updateElement, { columns: [{ key: 'name' }], remote: { enabled: true, load(payload) { return payload.reason === 'init' ? [] : updateTask.promise; } } });
    const outdated = updated.reload();
    updated.update({ remote: null, data: [{ name: 'manual' }] }); updateTask.resolve([{ name: 'obsolete' }]); await outdated;
    verify(updateElement.innerHTML.includes('>manual<'), 'Explicit update invalidates pending remote data');
    console.log(`[JquanUI] table runtime check ok (${count} assertions)`);
}

if (require.main === module) main().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
module.exports = { fixture, deferred };
