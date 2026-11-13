(async () => {
    const api=review,root=document.getElementById('preview');
    root.innerHTML='<h1 id="title" data-jq-review-key="title">Original title</h1><p id="other">Other</p>';
    let checks=0;const check=(v,label)=>{checks++;if(!v)throw Error(label)};
    const settle=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    const session=()=>{api.configure({enabled:true,root,allowURL:false});api.open();api.select('#title')};
    try {
        session();
        check(api.setText('Client title'),'Applied change prepares a plan');
        const originalCopy=JquanUIComponents.copyApi.copyText;
        let calls=0,received='';
        JquanUIComponents.copyApi.copyText=async text=>{calls++;received=text;return {ok:false}};
        check(!(await api.copyPlan())&&calls===1,'Copy failure is returned');
        const plan=document.querySelector('[data-review-plan]');
        check(plan&&plan.readOnly&&plan.value===received&&plan.getAttribute('aria-label')==='手动复制方案','Failed copy exposes readonly plan');
        check(document.activeElement===plan&&plan.selectionStart===0&&plan.selectionEnd===plan.value.length,'Failed copy focuses and selects complete plan '+JSON.stringify({active:document.activeElement?.getAttribute('data-review-plan'),start:plan?.selectionStart,end:plan?.selectionEnd,len:plan?.value.length}));
        check(document.querySelector('[data-review-plan]').value.includes('Client title'),'Manual plan includes final value');
        const current=plan.value;
        document.getElementById('other').setAttribute('data-live','1');await settle();
        check(document.querySelector('[data-review-plan]')?.value===current,'Unrelated mutation keeps valid manual plan');
        document.getElementById('title').firstChild.data='Server title';await settle();
        check(!document.querySelector('[data-review-plan]')&&document.querySelector('[role="status"]').textContent==='方案已变化，请重新复制','Tracked mutation invalidates stale manual plan');
        api.select('#other');check(!document.querySelector('[data-review-plan]'),'Selection clears manual plan');api.destroy();session();api.setText('Again');
        check(!(await api.copyPlan('json')),'JSON copy failure returns false');
        const json=document.querySelector('[data-review-plan]');check(json&&json.getAttribute('data-review-plan')==='json'&&JSON.parse(json.value).changes[0].after==='Again','JSON manual plan is valid');
        document.querySelector('[data-review-plan]').dispatchEvent(new Event('focus'));check(document.activeElement===json&&json.selectionStart===0&&json.selectionEnd===json.value.length,'Focus reselects JSON plan');
        document.querySelector('[data-review-plan]').parentElement.querySelector('button').click();check(document.activeElement===json&&json.selectionEnd===json.value.length,'Select button keeps complete selection');
        const back=Array.from(document.querySelectorAll('button')).find(button=>button.textContent==='返回编辑');back.click();check(!document.querySelector('[data-review-plan]')&&document.querySelector('[data-review-edit="text:0"]'),'Back to editor clears manual panel');
        let resolveCopy;JquanUIComponents.copyApi.copyText=()=>new Promise(resolve=>{resolveCopy=resolve});
        const pending=api.copyPlan();api.select('#other');resolveCopy({ok:false});check(!(await pending)&&!document.querySelector('[data-review-plan]'),'Stale async failure cannot reopen manual plan');
        api.select('#title');api.setText('Final');JquanUIComponents.copyApi.copyText=async()=>({ok:true});check(await api.copyPlan()&&!document.querySelector('[data-review-plan]')&&document.querySelector('[role="status"]').textContent.includes('已复制'),'Successful copy keeps normal editor');
        JquanUIComponents.copyApi.copyText=originalCopy;api.destroy();
        check(tokenErrors.length===0,'No page errors');
        return {checks,version:JquanUIComponents.reviewMode.version,manualFailure:'readonly selected plan',staleAsync:'ignored'};
    } finally {api.destroy();root.replaceChildren()}
})()
