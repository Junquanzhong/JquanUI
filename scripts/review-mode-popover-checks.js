(async () => {
    const api = JquanUIComponents.popoverApi, review = JquanUIComponents.reviewModeApi;
    const root = document.getElementById('fixture'), failures = [];
    let assertions = 0;
    const check = (value, message) => { assertions++; if (!value) failures.push(message); };
    const handles = [];
    const make = (id, options) => {
        const node = document.createElement('div'); node.id = id;
        node.innerHTML = '<button jq-popover-trigger>Open</button><section jq-popover-panel><b>Content</b></section>';
        root.append(node);
        if (options === false) return node;
        const handle = api.mount(node, { autoFocus: false, trapFocus: false, ...options }); handles.push(handle);
        return handle;
    };
    const session = node => { review.configure({enabled:true,root,allowURL:false}); review.open(); review.select(node); };
    try {
        const fake = make('fake', false); fake.setAttribute('data-popover-open', 'false'); session(fake);
        check(review.componentOptions().length === 0, 'Unregistered DOM markers are not mounted Popover evidence');
        check(!review.setComponentOption('popover','open',false), 'No-op false must not accept an unmounted element');
        check(!review.state().canUndo, 'Rejected fake does not create history');
        const first = make('real'); session(first.element());
        check(api.getHandle(first) === first && api.getHandle(first.element()) === first, 'Getter returns existing stable handle');
        check(api.getHandle('#real') === first && api.getHandle('real') === first, 'Getter supports existing selectors and ids');
        check(api.getHandle(first.element().querySelector('b')) === first, 'Getter follows public Popover target resolution');
        check(api.getHandle(fake) === null && api.getHandle('[') === null, 'Getter returns null without mounting or invalid-selector throw');
        check(api.mount(first.element()) === first, 'Read-only getter does not replace the instance');
        check(review.componentOptions()[0]?.value === false, 'Closed mounted Popover remains editable');
        review.select(first.element().querySelector('b'));
        check(review.componentOptions().length === 0, 'Selecting content never edits its ancestor Popover');
        review.select(first.element());
        check(!review.setComponentOption('popover','open','true'), 'Only a boolean is accepted');
        check(review.setComponentOption('popover','open',true) && first.state(), 'Open through the captured handle');
        check(review.setComponentOption('popover','open',false) && review.changes().length === 0, 'Returning to original omits net change');
        check(review.undo() && first.state() && review.redo() && !first.state(), 'Undo and redo preserve normal instance behavior');
        review.setComponentOption('popover','open',true);
        check(review.revert(first.element(),'component:popover.open') && !first.state(), 'Per-field revert uses the original instance');
        review.setComponentOption('popover','open',true);
        check(review.reset() && !first.state(), 'Reset restores live original instance');
        review.setComponentOption('popover','open',true);
        check(review.saveDraft('popover-lifecycle'), 'Popover field can be archived');
        const draft = review.loadDraft('popover-lifecycle');
        check(draft?.schemaVersion === 2 && draft.changes[0].field === 'component:popover.open', 'Draft retains schema 2 and boolean field');
        review.reset();
        check(review.applyPlan(draft).ok && !first.state(), 'Preflight does not open the Popover');
        const applied = review.applyPlan(draft,{dryRun:false});
        check(applied.ok && applied.applied === 1 && first.state(), 'Strict apply opens live existing instance');
        check(review.undo() && !first.state(), 'Applied Popover change is undoable');
        review.clearDraft('popover-lifecycle'); review.destroy();

        // The original recorded false equals a newly mounted false: identity must still conflict.
        first.open(); session(first.element()); review.setComponentOption('popover','open',false);
        const originalNode = first.element(); first.destroy();
        check(api.getHandle(first) === null && api.getHandle(originalNode) === null, 'Destroyed handle and root are not returned by getter');
        check(review.componentOptions().length === 0, 'Destroyed closed root retains markers but exposes no options');
        const replacement = api.mount(originalNode,{autoFocus:false,trapFocus:false}); handles.push(replacement);
        check(replacement !== first && !replacement.state(), 'Same-node remount has a new closed instance');
        check(review.changes()[0]?.status === 'conflict', 'Same-node remount conflicts even when its value matches');
        check(!review.undo() && !review.reset() && !review.revert(originalNode,'component:popover.open'), 'History cannot mutate replacement instance');
        check(!review.setComponentOption('popover','open',true) && !replacement.state(), 'Existing record never captures a replacement handle');
        review.destroy();
        check(!replacement.state(), 'Destroy leaves replacement state untouched');
        session(originalNode); review.setComponentOption('popover','open',true); review.destroy();
        check(!replacement.state(), 'Explicit new session may capture and restore the new instance');

        session(originalNode); review.setComponentOption('popover','open',true); replacement.close();
        check(review.changes()[0]?.status === 'conflict' && !review.undo(), 'External close is a field conflict');
        review.destroy(); check(!replacement.state(), 'Destroy preserves external close');

        const detached = make('detached'); session(detached.element()); review.setComponentOption('popover','open',true);
        const oldNode = detached.element(); oldNode.remove();
        check(review.changes()[0]?.status === 'detached', 'Detached original node remains detached');
        const sameId = make('detached');
        check(!review.undo() && !sameId.state(), 'Same-id replacement node cannot inherit old history');
        review.destroy(); check(!sameId.state(), 'Destroy does not alter same-id new node');

        let revived;
        const callback = make('callback',{onClose(){
            const node=callback.element(); if (!node) return;
            callback.destroy(); revived=api.mount(node,{autoFocus:false,trapFocus:false}); handles.push(revived);
        }});
        session(callback.element());
        check(review.setComponentOption('popover','open',true), 'Callback fixture opened');
        check(!review.setComponentOption('popover','open',false), 'Reentrant replacement aborts stale commit');
        check(review.changes()[0]?.status === 'conflict' && !revived.state(), 'Reentrant close keeps replacement outside session');
        review.destroy(); check(!revived.state(), 'Stale cleanup does not touch callback replacement');

        const applyNode = make('apply-gone',false);
        session(applyNode);
        const missing = {schemaVersion:2,createdAt:new Date().toISOString(),page:location.pathname+location.search+location.hash,changes:[{target:{selector:'#apply-gone',stable:true},label:'fixture',tag:'div',field:'component:popover.open',before:false,after:true,status:'ready'}]};
        const rejected = review.applyPlan(missing);
        check(!rejected.ok && rejected.issues.some(i=>i.code==='invalid-component'), 'Apply rejects an unmounted target');
        check(applyNode.getAttribute('data-popover-open') === null, 'Preflight never mounts a business Popover');
    } catch(error) { failures.push(error.stack || String(error)); }
    finally {
        review.destroy();
        for (const handle of handles) handle?.destroy();
        root.replaceChildren(); review.clearDraft('popover-lifecycle');
    }
    return {assertions,failures};
})()
