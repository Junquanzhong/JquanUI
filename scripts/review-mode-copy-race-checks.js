(async () => {
    const api = review, root = document.getElementById('preview'), copy = JquanUIComponents.copyApi;
    const originalCopy = copy.copyText, fixed = window.expectCopyRaceFix;
    let checks = 0, queue = [];
    const check = (value, label) => { checks++; if (!value) throw Error(label); };
    const manual = () => document.querySelector('[data-review-plan]');
    const status = () => document.querySelector('[data-jq-review-ui] [role="status"]').textContent;
    const session = () => {
        api.destroy(); root.innerHTML = '<h1 id="title">Original</h1>';
        api.configure({ enabled: true, root }); api.open(); api.select('#title'); api.setText('Client title');
        queue = []; copy.copyText = text => new Promise((resolve, reject) => queue.push({ text, resolve, reject }));
    };
    try {
        session();
        const first = api.copyPlan(), latest = api.copyPlan();
        check(queue.length === 2 && queue[0].text === queue[1].text, 'Same-plan requests overlap');
        queue[1].resolve({ ok: true }); check(await latest, 'Latest success returns true');
        queue[0].resolve({ ok: false }); check(!(await first), 'Earlier failure returns its own false');
        const latestWins = !manual() && status().includes('已复制');
        check(latestWins === fixed, 'Earlier failure cannot overwrite latest success');
        if (!fixed) return { checks, version: JquanUIComponents.reviewMode.version, latestWins };

        session();
        const oldSuccess = api.copyPlan(), newFailure = api.copyPlan('json');
        queue[1].resolve({ ok: false }); check(!(await newFailure), 'Latest failure returns false');
        const output = manual();
        check(output?.value === queue[1].text && output.dataset.reviewPlan === 'json', 'Latest format supplies manual fallback');
        queue[0].resolve({ ok: true }); check(await oldSuccess, 'Earlier success returns its own true');
        check(manual() === output && status().includes('手动复制'), 'Earlier success cannot overwrite latest failure');
        check(document.activeElement === output && output.selectionEnd === output.value.length, 'Latest failure keeps selected fallback');

        const retry = api.copyPlan();
        check(!manual(), 'New request immediately clears previous manual snapshot');
        queue[2].resolve({ ok: true }); check(await retry, 'Retry success returns true');
        check(!manual() && status().includes('已复制'), 'Retry success returns to editor');

        session();
        const oldPending = api.copyPlan(), newPending = api.copyPlan('json');
        queue[0].reject(Error('clipboard failure')); check(!(await oldPending), 'Stale rejection returns false');
        check(!manual(), 'Stale rejection does not open fallback while latest request is pending');
        queue[1].resolve({ ok: false }); check(!(await newPending), 'Latest failure completes');
        check(manual()?.value === queue[1].text, 'Latest pending request owns fallback');
        check(!(await api.copyPlan('invalid')) && manual()?.value === queue[1].text, 'Invalid format does not discard valid fallback');
        check(api.changes().length === 1 && api.undo() && document.getElementById('title').textContent === 'Original', 'Copy requests preserve edit history');

        for (const action of ['close', 'configure', 'destroy']) {
            session(); const pending = api.copyPlan();
            if (action === 'configure') api.configure({ enabled: true, root }); else api[action]();
            api.open(); api.select('#title'); queue[0].resolve({ ok: false });
            check(!(await pending) && !manual(), action + ' invalidates pending copy result');
        }
        check(tokenErrors.length === 0, 'No runtime errors');
        return { checks, version: JquanUIComponents.reviewMode.version, latestWins, history: 'preserved', staleSessions: 'ignored' };
    } finally { copy.copyText = originalCopy; api.destroy(); root.replaceChildren(); }
})()
