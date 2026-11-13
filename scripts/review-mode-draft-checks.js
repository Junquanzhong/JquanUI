(async () => {
    const api = await reviewReady, failures = [];
    let assertions = 0;
    const check = (label, value) => { assertions++; if (!value) failures.push(label); };
    const prefix = 'jquanui-review-draft:', key = 'draft-check';
    const raw = () => localStorage.getItem(prefix + key);
    const title = document.getElementById('title'), original = title.textContent;
    api.clearDraft(key);
    check('disabled save', !api.saveDraft(key));
    api.configure({ enabled: true, root: '#review-root', allowURL: false }); api.open(); api.select(title);
    check('empty save', !api.saveDraft(key) && api.loadDraft(key) === null);
    api.setUtility('font-size', 'text-md'); api.setUtility('font-size', 'text-lg'); api.setText('Draft text');
    const state = JSON.stringify(api.state());
    check('save final plan', api.saveDraft(key));
    const initial = raw(), draft = api.loadDraft(key);
    check('snapshot has originals/final values', draft.changes.length === 2 && draft.changes[0].before[0] === 'text-2xl' && draft.changes[0].after[0] === 'text-lg');
    check('state/history unchanged', JSON.stringify(api.state()) === state && title.textContent === 'Draft text');
    draft.changes[0].after.push('mutated'); draft.changes[0].target.selector = '#wrong';
    check('reads are detached', api.loadDraft(key).changes[0].after.length === 1 && api.loadDraft(key).changes[0].target.selector !== '#wrong');
    api.undo(); api.redo(); check('history still works', title.textContent === 'Draft text');
    for (const invalid of ['', 'bad key', '../page', '中', '-bad', 'a'.repeat(81), null, 1, {}]) {
        check('invalid key ' + JSON.stringify(invalid), !api.saveDraft(invalid) && api.loadDraft(invalid) === null && !api.clearDraft(invalid));
    }
    check('80-char key', api.saveDraft('a'.repeat(80)) && api.clearDraft('a'.repeat(80)));
    check('default key', api.saveDraft() && api.loadDraft()?.changes.length === 2 && api.clearDraft());
    check('independent keys', api.saveDraft('other') && api.clearDraft('other') && raw() === initial);
    api.close(); check('closed save', api.saveDraft(key));
    api.destroy(); check('destroy restores DOM, preserves draft', title.textContent === original && api.loadDraft(key).changes.length === 2);
    check('disabled read', !api.state().enabled && api.loadDraft(key).schemaVersion === 1);
    const validRaw = raw();
    const invalidPackages = ['{', 'null', '[]', JSON.stringify({ format: 'unknown', version: 1 }), ...[
        saved => { saved.version = 2; }, saved => { saved.savedAt = null; },
        saved => { saved.plan.schemaVersion = 3; }, saved => { saved.plan.createdAt = 'invalid'; },
        saved => { saved.plan.page = false; }, saved => { saved.plan.changes = [null]; },
        saved => { saved.plan.changes = []; }, saved => { saved.plan.changes[0].target.stable = 'true'; },
        saved => { saved.plan.changes[0].status = 'approved'; }, saved => { saved.plan.changes[0].target.selector = null; },
        saved => { saved.plan.changes[0].field = 'utility:constructor'; }, saved => { saved.plan.changes[0].field = 'text:0:other'; },
        saved => { saved.plan.changes[0].field = 'text:-1'; }, saved => { saved.plan.changes[0].after = 3; },
        saved => { saved.plan.changes[0].label = null; }, saved => { saved.plan.changes[0].tag = false; }
    ].map(change => { const saved = JSON.parse(validRaw); change(saved); return JSON.stringify(saved); })];
    for (let i = 0; i < invalidPackages.length; i++) {
        localStorage.setItem(prefix + key, invalidPackages[i]);
        check('invalid package ' + i, api.loadDraft(key) === null && raw() === invalidPackages[i]);
    }
    localStorage.setItem(prefix + key, validRaw);
    const descriptor = Object.getOwnPropertyDescriptor(window, 'localStorage');
    try {
        Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw Error('unavailable'); } });
        check('unavailable reads and removal', api.loadDraft(key) === null && !api.clearDraft(key));
    } finally { Object.defineProperty(window, 'localStorage', descriptor); }
    api.configure({ enabled: true, root: '#review-root', allowURL: false }); api.open(); api.select(title); api.setText('Unsaved new value');
    for (const method of ['getItem', 'setItem', 'removeItem']) {
        const saved = Object.getOwnPropertyDescriptor(Storage.prototype, method);
        try {
            Object.defineProperty(Storage.prototype, method, { ...saved, value() { throw Error('storage failure'); } });
            check(method + ' failure', method === 'getItem' ? api.loadDraft(key) === null && !api.clearDraft(key) : method === 'setItem' ? !api.saveDraft(key) : !api.clearDraft(key));
        } finally { Object.defineProperty(Storage.prototype, method, saved); }
        check(method + ' preserves data', raw() === validRaw);
    }
    api.setText('x'.repeat(1048577)); check('oversized save preserves old draft', !api.saveDraft(key) && raw() === validRaw);
    api.reset(); check('empty save preserves old draft', !api.saveDraft(key) && raw() === validRaw);
    localStorage.setItem(prefix + key, ' '.repeat(1048577)); check('oversized read', api.loadDraft(key) === null);
    localStorage.setItem(prefix + key, '{'); check('clear corrupt draft', api.clearDraft(key) && api.loadDraft(key) === null);
    localStorage.setItem('unrelated-review-test', 'keep'); api.clearDraft(key);
    check('remove only own key', localStorage.getItem('unrelated-review-test') === 'keep'); localStorage.removeItem('unrelated-review-test');
    const select = document.createElement('select'); select.id = 'draft-select'; select.innerHTML = '<option>A</option>'; document.getElementById('review-root').append(select);
    const selects = await JquanUI.import('select', { install: false }), handle = selects.mount(select);
    api.select(select); api.setComponentOption('select', 'disabled', true);
    check('component schema/type preserved', api.saveDraft(key) && api.loadDraft(key).schemaVersion === 2 && api.loadDraft(key).changes[0].after === true);
    const componentDraft = JSON.parse(raw());
    componentDraft.plan.changes[0].field = 'component:carousel.interval';
    componentDraft.plan.changes[0].before = 800; componentDraft.plan.changes[0].after = 3000;
    localStorage.setItem(prefix + key, JSON.stringify(componentDraft));
    check('legacy interval originals retained', api.loadDraft(key)?.changes[0].before === 800);
    componentDraft.plan.changes[0].after = '3000';
    localStorage.setItem(prefix + key, JSON.stringify(componentDraft));
    check('component option types checked', api.loadDraft(key) === null);
    api.reset(); api.select(title); api.setAttribute('title', 'Hint');
    check('attribute draft', api.saveDraft(key) && api.loadDraft(key).changes[0].field === 'attribute:title');
    api.reset(); api.select('#empty'); api.setText('Added text');
    check('nullable text original', api.saveDraft(key) && api.loadDraft(key).changes[0].before === null);
    api.reset(); api.select(title); api.setText('Draft after reload');
    title.firstChild.data = 'External';
    check('conflict status preserved', api.saveDraft(key) && api.loadDraft(key).changes[0].status === 'conflict');
    title.firstChild.data = 'Draft after reload';
    api.saveDraft('reload'); api.destroy(); handle.destroy(); select.remove(); api.clearDraft(key);
    check('disabled save preserves persisted plan', !api.saveDraft('reload') && api.loadDraft('reload').changes[0].after === 'Draft after reload');
    return { assertions, failures };
})()
