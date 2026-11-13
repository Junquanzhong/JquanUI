'use strict';
const assert = require('assert/strict'), fs = require('fs'), http = require('http'), path = require('path');
const { spawn } = require('child_process');
const root = path.resolve(__dirname, '..');
const browserPath = process.env.JQUAN_BROWSER || ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
assert(browserPath, 'Set JQUAN_BROWSER to Chromium.');
const argument = key => process.argv.includes(key) ? process.argv[process.argv.indexOf(key) + 1] : null;
const snapshot = argument('--snapshot'), onlyEntry = argument('--entry');
const navigationSnapshot = process.argv.includes('--navigation-snapshot');
const selectSnapshot = argument('--select-snapshot');
const pickingSnapshot = argument('--picking-snapshot');
const keyboardSnapshot = argument('--keyboard-snapshot');
const draftSnapshot = argument('--draft-snapshot');
const applySnapshot = argument('--apply-snapshot');
if (draftSnapshot && !['baseline', 'modified', 'rollback-copy'].includes(draftSnapshot)) throw Error('Invalid draft snapshot');
if (applySnapshot && !['baseline', 'modified', 'rollback-copy'].includes(applySnapshot)) throw Error('Invalid apply snapshot');
if (keyboardSnapshot && !['baseline', 'modified', 'rollback-copy'].includes(keyboardSnapshot)) throw Error('Invalid keyboard snapshot');
if (pickingSnapshot && !['baseline', 'modified', 'rollback-copy'].includes(pickingSnapshot)) throw Error('Invalid picking snapshot');
if (selectSnapshot && !['baseline', 'modified', 'rollback-copy'].includes(selectSnapshot)) throw Error('Invalid Select snapshot');
if (snapshot && !['baseline', 'modified', 'rollback-copy'].includes(snapshot)) throw Error('Invalid snapshot');
const entries = { core: '/dist/core/JquanUI@Core.js', min: '/js/JquanUI@core.min.js', full: '/dist/full/JquanUI@full.js', components: '/dist/core/JquanUI@Core.js' };
if (onlyEntry && !entries[onlyEntry]) throw Error('Invalid entry');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const template = fs.readFileSync(path.join(root, 'scripts/review-mode-editing-fixture.html'), 'utf8');
async function main() {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, 'http://localhost'); response.setHeader('Cache-Control', 'no-store');
    if (url.pathname === '/') {
      const entry = url.searchParams.get('entry');
      if (!entries[entry]) { response.writeHead(400); response.end(); return; }
      response.setHeader('Content-Type', 'text/html;charset=utf-8');
      const extra = entry === 'components' ? '<script src="/dist/components/JquanUI@components.js"></script>' : '';
      const head = url.searchParams.get('head') === '1' ? `${entry !== 'components' ? '<script src="/dist/components/copy.js"></script><script src="/dist/components/reviewMode.js"></script>' : '<script src="/dist/components/reviewMode.js"></script>'}<script>JquanUI.use(JquanUIComponents.copy);JquanUI.use(JquanUIComponents.reviewMode);${url.searchParams.get('cancel') === '1' ? 'JquanUIComponents.reviewModeApi.destroy();' : ''}</script>` : '';
      response.end(template.replace('<!-- CORE_ENTRY -->', `<script src="${entries[entry]}"></script>`).replace('<!-- COMPONENT_ENTRY -->', extra + head)); return;
    }
    let relative = decodeURIComponent(url.pathname).slice(1);
    if (selectSnapshot && ['dist/components/reviewMode.js', 'dist/components/select.js'].includes(relative)) relative = `verification/review-mode-select/${selectSnapshot}/${relative}`;
    if (pickingSnapshot && ['dist/components/reviewMode.js', 'dist/components/select.js'].includes(relative)) relative = `verification/review-mode-picking/${pickingSnapshot}/${relative}`;
    if (keyboardSnapshot && relative === 'dist/components/reviewMode.js') relative = `verification/review-mode-keyboard/${keyboardSnapshot}/${relative}`;
    if (draftSnapshot && relative === 'dist/components/reviewMode.js') relative = `verification/review-mode-drafts/${draftSnapshot}/${relative}`;
    if (applySnapshot && relative === 'dist/components/reviewMode.js') relative = `verification/review-mode-apply/${applySnapshot}/reviewMode.js`;
    if (snapshot && ['dist/core/JquanUI@Core.js', 'dist/components/reviewMode.js'].includes(relative)) relative = `verification/${navigationSnapshot ? 'review-mode-navigation' : 'review-mode-workflow'}/${snapshot}/${relative}`;
    const file = path.resolve(root, relative), fromRoot = path.relative(root, file);
    if (fromRoot.startsWith('..') || path.isAbsolute(fromRoot) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); response.end(); return; }
    response.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : file.endsWith('.html') ? 'text/html;charset=utf-8' : 'text/plain'); fs.createReadStream(file).pipe(response);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = 14300 + Math.floor(Math.random() * 200);
  const browser = spawn(browserPath, ['--headless=new', '--disable-gpu', '--no-sandbox', `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(root, '.tmp', 'review-' + Date.now())}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let socket; const pending = new Map();
  try {
    let pages; for (let i = 0; i < 100 && !pages; i++) { try { pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); } catch {} if (!pages) await delay(100); }
    assert(pages, 'Browser start timed out'); socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; }); let sequence = 0;
    socket.onmessage = event => { const message = JSON.parse(event.data), item = pending.get(message.id); if (!item) return; clearTimeout(item.timer); pending.delete(message.id); message.error ? item.reject(Error(JSON.stringify(message.error))) : item.resolve(message.result); };
    const command = (method, params = {}) => new Promise((resolve, reject) => { const id = ++sequence, timer = setTimeout(() => { pending.delete(id); reject(Error(method + ' timeout')); }, 20000); pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params })); });
    const evaluate = async expression => { try { const result = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); assert(!result.exceptionDetails, JSON.stringify(result.exceptionDetails)); return result.result.value; } catch (error) { throw Error(`${error.message} :: ${expression.slice(0, 180)}`); } };
    await command('Runtime.enable'); await command('Emulation.setFocusEmulationEnabled', { enabled: true });
    for (const entry of snapshot ? ['core'] : onlyEntry ? [onlyEntry] : Object.keys(entries)) {
      const baseline = snapshot && snapshot !== 'modified';
      const query = `?entry=${entry}&jqui-review=1${baseline ? '&baseline=1' : ''}`;
      await command('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/${query}` });
      let ready = false; for (let i = 0; i < 100 && !ready; i++) { ready = await evaluate(`location.search===${JSON.stringify(query)}&&typeof reviewReady!=='undefined'`); if (!ready) await delay(100); }
      assert(ready, 'Fixture timed out'); await evaluate('reviewReady');
      if (applySnapshot) {
        const result = await evaluate(`(()=>{const api=JquanUIComponents.reviewModeApi, title=document.getElementById('title');api.configure({enabled:true,root:'#review-root',allowURL:false});api.open();api.select('#title');api.setText('Apply snapshot title');const plan=JSON.parse(api.exportPlan('json'));api.reset();const available=typeof api.applyPlan==='function';let dry=false,applied=false,changed=false;if(available){const check=api.applyPlan(plan);dry=check.ok&&check.dryRun&&check.applied===0&&check.issues.length===0&&title.textContent==='审查标题';const done=api.applyPlan(plan,{dryRun:false});applied=done.ok&&!done.dryRun&&done.applied===1;changed=title.textContent==='Apply snapshot title';}api.destroy();return {version:JquanUIComponents.reviewMode.version,available,dry,applied,changed};})()`);
        const modified = applySnapshot === 'modified';
        assert.equal(result.version, modified ? '0.12.0' : '0.11.0');
        assert.equal(result.available, modified); assert.equal(result.dry, modified); assert.equal(result.applied, modified); assert.equal(result.changed, modified);
        console.log(`${modified ? 'MODIFIED' : applySnapshot === 'baseline' ? 'BASELINE' : 'ROLLBACK'} Review Mode ${result.version}; applyAPI=${result.available}; dryRun=${result.dry}; applied=${result.applied}; changed=${result.changed}`);
        continue;
      }
      if (draftSnapshot) {
        const result = await evaluate(`(()=>{const api=JquanUIComponents.reviewModeApi;api.configure({enabled:true,root:'#review-root',allowURL:false});api.open();api.select('#title');api.setText('Draft final title');const available=typeof api.saveDraft==='function';let saved=false,read=false;if(available){api.clearDraft('snapshot');saved=api.saveDraft('snapshot');api.destroy();const draft=api.loadDraft('snapshot');read=draft?.changes[0]?.after==='Draft final title';api.clearDraft('snapshot');}return {version:JquanUIComponents.reviewMode.version,available,saved,read};})()`);
        const modified = draftSnapshot === 'modified';
        assert.equal(result.version, modified ? '0.11.0' : '0.10.0');
        assert.equal(result.available, modified); assert.equal(result.saved, modified); assert.equal(result.read, modified);
        console.log(`${modified ? 'MODIFIED' : draftSnapshot === 'baseline' ? 'BASELINE' : 'ROLLBACK'} Review Mode ${result.version}; draftAPI=${result.available}; saved=${result.saved}; readAfterDestroy=${result.read}`);
        continue;
      }
      if (process.argv.includes('--draft-check')) {
        const checks = fs.readFileSync(path.join(root, 'scripts/review-mode-draft-checks.js'), 'utf8');
        const result = await evaluate(checks);
        assert.deepEqual(result.failures, [], JSON.stringify(result));
        assert.deepEqual(await evaluate('errors'), [], 'Draft checks must not produce page errors');
        await evaluate('window.draftPreviousDocument=true');
        await command('Page.reload');
        let reloaded = false;
        for (let i = 0; i < 100 && !reloaded; i++) {
          reloaded = await evaluate(`!window.draftPreviousDocument&&typeof reviewReady!=='undefined'&&!!window.JquanUIComponents?.reviewModeApi&&!JquanUIComponents.reviewModeApi.state().enabled`);
          if (!reloaded) await delay(100);
        }
        assert(reloaded, 'Draft reload timed out'); await evaluate('reviewReady');
        assert.equal(await evaluate(`(()=>{const api=JquanUIComponents.reviewModeApi,draft=api.loadDraft('reload');const ok=draft?.changes[0]?.after==='Draft after reload'&&document.getElementById('title').textContent==='审查标题'&&!api.state().canUndo&&!api.state().active;api.clearDraft('reload');return ok;})()`), true);
        console.log(`[JquanUI] review drafts ${entry} ok (${result.assertions + 1} assertions; reload, detached plans, validation, storage failures, no automatic replay)`);
        continue;
      }
      if (process.argv.includes('--apply-check')) {
        const checks = fs.readFileSync(path.join(root, 'scripts/review-mode-apply-checks.js'), 'utf8');
        const result = await evaluate(checks);
        assert.deepEqual(result.failures, [], JSON.stringify(result));
        assert.deepEqual(await evaluate('errors'), [], 'Apply checks must not produce page errors');
        console.log(`[JquanUI] review apply ${entry} ok (${result.assertions} assertions; dry-run, strict preflight, atomic apply, conflict blocking)`);
        continue;
      }
      if (keyboardSnapshot) {
        await evaluate(`window.review=JquanUIComponents.reviewModeApi;review.configure({enabled:true,root:'#review-root',allowURL:false});review.open();review.select('#title');window.originalKeyboardTitle=document.getElementById('title').textContent;review.setText('Keyboard edit');document.querySelector('[data-review-navigate="parent"]').focus()`);
        for(const type of ['keyDown','keyUp'])await command('Input.dispatchKeyEvent',{type,key:'z',code:'KeyZ',windowsVirtualKeyCode:90,modifiers:2});
        const result=await evaluate(`({version:JquanUIComponents.reviewMode.version,undone:document.getElementById('title').textContent===originalKeyboardTitle,canRedo:review.state().canRedo})`);
        const label=keyboardSnapshot==='modified'?'MODIFIED':keyboardSnapshot==='baseline'?'BASELINE':'ROLLBACK';
        assert.equal(result.version,keyboardSnapshot==='modified'?'0.10.0':'0.9.0');
        assert.equal(result.undone,keyboardSnapshot==='modified');assert.equal(result.canRedo,keyboardSnapshot==='modified');
        console.log(`${label} Review Mode ${result.version}; Ctrl+Z undo=${result.undone}; canRedo=${result.canRedo}`);
        continue;
      }
      if (pickingSnapshot) {
        const point=await evaluate(`(async()=>{
          const select=await JquanUI.import('select',{install:false});
          const source=document.createElement('select');source.id='picking-probe';source.innerHTML='<option value="a">A</option><option value="b" selected>B</option>';document.getElementById('review-root').prepend(source);
          window.pickingHandle=select.mount(source);window.pickingControl=source.nextElementSibling.querySelector('[jq-select-trigger]');
          window.pickingReview=JquanUIComponents.reviewModeApi;pickingReview.configure({enabled:true,root:'#review-root',allowURL:false});pickingReview.open();
          const r=pickingControl.getBoundingClientRect();return {x:r.left+20,y:r.top+r.height/2};
        })()`);
        for(const type of ['mousePressed','mouseReleased'])await command('Input.dispatchMouseEvent',{type,...point,button:'left',clickCount:1});
        const result=await evaluate(`({version:JquanUIComponents.reviewMode.version,tag:pickingReview.state().selection.tag,fields:pickingReview.componentOptions().length,open:pickingHandle.state().open,value:pickingHandle.value()})`);
        assert(!result.open);assert.equal(result.value,'b');
        if(pickingSnapshot==='modified'){
          assert.equal(result.version,'0.9.0');assert.equal(result.tag,'select');assert.equal(result.fields,3);
          console.log('MODIFIED Review Mode 0.9.0 / Select 1.5.0; native click=select; fields=3; open=false; value=b');
        }else{
          assert.equal(result.version,'0.8.0');assert.equal(result.tag,'span');assert.equal(result.fields,0);
          console.log(`${pickingSnapshot==='baseline'?'BASELINE':'ROLLBACK'} Review Mode 0.8.0 / Select 1.4.0; native click=span; fields=0; open=false; value=b`);
        }
        continue;
      }
      if (selectSnapshot) {
        const result = await evaluate(`(async()=>{
          const select=await JquanUI.import('select',{install:false}),review=JquanUIComponents.reviewModeApi;
          const source=document.createElement('select');source.id='select-probe';source.innerHTML='<option value="a">A</option><option value="b" selected>B</option>';document.getElementById('review-root').append(source);
          const handle=select.mount(source);review.configure({enabled:true,root:'#review-root',allowURL:false});review.open();review.select(source);
          const options=review.componentOptions(),edited=review.setComponentOption('select','clearable',false);
          const after=handle.state(),value=source.value,undo=edited?review.undo():false,restored=handle.state();review.destroy();handle.destroy();
          return {review:JquanUIComponents.reviewMode.version,select:JquanUIComponents.select.version,fields:options.map(item=>item.option),edited,clearable:after.clearable,undo,restored:restored.clearable,value};
        })()`);
        const label = selectSnapshot === 'modified' ? 'MODIFIED' : selectSnapshot === 'baseline' ? 'BASELINE' : 'ROLLBACK';
        if (selectSnapshot === 'modified') {
          assert.equal(result.review,'0.8.0');assert.equal(result.select,'1.4.0');assert.deepEqual(result.fields,['disabled','searchable','clearable']);assert(result.edited&&result.clearable===false&&result.undo&&result.restored===true);assert.equal(result.value,'b');
          console.log('MODIFIED Review Mode 0.8.0 / Select 1.4.0; clearable=false; undo=true; value=b');
        } else {
          assert.equal(result.review,'0.7.0');assert.equal(result.select,'1.3.0');assert.deepEqual(result.fields,[]);assert.equal(result.edited,false);assert.equal(result.value,'b');
          console.log(`${label} Review Mode 0.7.0 / Select 1.3.0; adapter=absent; value=b`);
        }
        continue;
      }
      if (baseline) {
        assert.equal(await evaluate(`typeof JquanUIComponents.reviewModeApi.${navigationSnapshot ? 'navigate' : 'revert'}`), 'undefined');
        assert.equal(await evaluate(`JquanUIComponents.reviewMode.version`), navigationSnapshot ? '0.4.0' : '0.3.0');
        if (navigationSnapshot) assert.equal(await evaluate(`typeof JquanUIComponents.reviewModeApi.revert==='function'&&JquanUIComponents.reviewModeApi.utilities('brand').some(field=>field.options.some(option=>option.token==='text-brand'))`),true);
        assert.equal(await evaluate(`JquanUIComponents.reviewModeApi.configure({enabled:true,root:'#review-root',allowURL:false})&&JquanUIComponents.reviewModeApi.open()`),true);
        assert.equal(await evaluate(`JquanUIComponents.reviewModeApi.utilities('no-such-token').length`), navigationSnapshot ? 0 : 32);
        console.log(`${snapshot === 'baseline' ? 'BASELINE' : 'ROLLBACK'} ${navigationSnapshot ? 'reviewMode=0.4.0; navigate=absent; search/revert=available' : 'reviewMode=0.3.0; search=absent; revert=absent'}`);
      } else if (process.argv.includes('--probe-navigation')) {
        assert.equal(await evaluate('JquanUIComponents.reviewMode.version'),'0.5.0');
        assert.equal(await evaluate(`(()=>{const review=JquanUIComponents.reviewModeApi;review.configure({enabled:true,root:'#review-root',allowURL:false});review.open();review.select('#bold');return review.navigate('parent')&&review.state().selection.target.selector==='#nested'&&review.navigate('first-child')&&review.state().selection.target.selector==='#bold';})()`),true);
        assert.equal(await evaluate(`(()=>{const review=JquanUIComponents.reviewModeApi;review.select('#review-root');return !review.navigate('parent')&&!review.navigate('next-sibling')&&!review.state().canUndo&&review.changes().length===0;})()`),true);
        console.log('MODIFIED reviewMode=0.5.0; navigate=available; root-boundary=passed; history=unchanged');
      } else {
        const result = await evaluate('runReviewChecks()');
        const failures = Object.entries(result.results).filter(([, value]) => !value).map(([key]) => key);
        assert.equal(failures.length, 0, JSON.stringify({ failures, details: result.details, errors: result.errors }));
        await evaluate(`window.review = JquanUIComponents.reviewModeApi; review.configure({enabled:true, root:'#review-root',allowURL:false});document.getElementById('entry').focus();review.open();document.getElementById('action').focus()`);
        const clickTarget = await evaluate(`(() => {const r=document.getElementById('action').getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2,clicks:pageClicks}})()`);
        for (const type of ['mousePressed', 'mouseReleased']) await command('Input.dispatchMouseEvent', {type,x:clickTarget.x,y:clickTarget.y,button:'left',clickCount:1});
        assert.equal(await evaluate('review.state().selection.tag+":"+pageClicks'), 'a:'+clickTarget.clicks, 'Native pointer must select without running the page action');
        await evaluate(`document.getElementById('action').focus()`);
        for (const type of ['keyDown', 'keyUp']) await command('Input.dispatchKeyEvent', { type, key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
        assert.equal(await evaluate('review.state().selection.tag'), 'a');
        await evaluate(`review.select('#title');review.setText('Applied keyboard preview');document.querySelector('[data-review-navigate="parent"]').focus()`);
        const nativeHistoryKey=async(key,modifiers)=>{for(const type of ['keyDown','keyUp'])await command('Input.dispatchKeyEvent',{type,key,code:key.toLowerCase()==='y'?'KeyY':'KeyZ',windowsVirtualKeyCode:key.toLowerCase()==='y'?89:90,modifiers});};
        await nativeHistoryKey('z',2);
        assert.equal(await evaluate('document.getElementById("title").textContent'),'审查标题','Native Ctrl+Z undoes applied preview');
        await nativeHistoryKey('Z',10);
        assert.equal(await evaluate('document.getElementById("title").textContent'),'Applied keyboard preview','Native Ctrl+Shift+Z redoes preview');
        await evaluate(`document.querySelector('[data-review-edit="text:0"]').focus();document.querySelector('[data-review-edit="text:0"]').select()`);
        await command('Input.insertText',{text:'Unapplied input draft'});
        await nativeHistoryKey('z',2);
        assert.equal(await evaluate('document.querySelector("[data-review-edit=\\"text:0\\"]").value'),'Applied keyboard preview','Native text editing owns undo');
        assert.equal(await evaluate('document.getElementById("title").textContent'),'Applied keyboard preview','Input undo preserves applied preview');
        assert.equal(await evaluate('review.state().canUndo&&!review.state().canRedo'),true,'Input undo preserves review history');
        await evaluate('review.reset()');
        await evaluate(`review.select('#title');document.querySelector('[data-review-navigate="parent"]').scrollIntoView({block:'nearest'});new Promise(resolve=>requestAnimationFrame(resolve))`);
        const parentPoint = await evaluate(`(()=>{const r=document.querySelector('[data-review-navigate="parent"]').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()`);
        for(const type of ['mousePressed','mouseReleased'])await command('Input.dispatchMouseEvent',{type,...parentPoint,button:'left',clickCount:1});
        assert.equal(await evaluate(`review.state().selection.target.selector`),'#review-root','Native navigation must select container');
        assert.equal(await evaluate(`document.activeElement.getAttribute('data-review-navigate')`),'first-child','Boundary focus moves to available child control');
        for (const type of ['keyDown','keyUp']) await command('Input.dispatchKeyEvent',{type,key:'Enter',code:'Enter',windowsVirtualKeyCode:13,...(type==='keyDown'?{text:'\r'}:{})});
        assert.equal(await evaluate(`review.state().selection.target.selector`),'[data-jq-review-key="hero-title"]','Native keyboard navigation must select first child: '+await evaluate(`document.activeElement.outerHTML.slice(0,1200)`));
        assert.equal(await evaluate(`document.activeElement.getAttribute('data-review-navigate')`),'parent');
        await evaluate(`review.select('#title'); document.querySelector('[data-review-edit="text:0"]').focus();document.querySelector('[data-review-edit="text:0"]').select()`);
        await command('Input.insertText',{text:'原生输入标题'});
        await evaluate(`document.querySelector('[data-review-apply="text:0"]').scrollIntoView({block:'nearest'});new Promise(resolve=>requestAnimationFrame(resolve))`);
        const apply = await evaluate(`(()=>{const r=document.querySelector('[data-review-apply="text:0"]').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()`);
        for(const type of ['mousePressed','mouseReleased'])await command('Input.dispatchMouseEvent',{type,x:apply.x,y:apply.y,button:'left',clickCount:1});
        assert.equal(await evaluate('document.getElementById("title").textContent'),'原生输入标题');
        await evaluate(`document.querySelector('[data-review-edit="search"]').focus()`);
        await command('Input.insertText',{text:'brand'});
        assert.equal(await evaluate(`document.activeElement.getAttribute('data-review-edit')`),'search');
        assert.equal(await evaluate(`document.querySelectorAll('[data-review-group]').length`),2);
        await evaluate(`document.querySelector('[data-review-swatch="text-brand"][data-review-field="color"]').scrollIntoView({block:'nearest'});new Promise(resolve=>requestAnimationFrame(resolve))`);
        const swatchPoint=await evaluate(`(()=>{const r=document.querySelector('[data-review-swatch="text-brand"][data-review-field="color"]').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()`);
        for(const type of ['mousePressed','mouseReleased'])await command('Input.dispatchMouseEvent',{type,...swatchPoint,button:'left',clickCount:1});
        assert.equal(await evaluate('document.getElementById("title").classList.contains("text-brand")'),true);
        assert.equal(await evaluate('review.changes().length'),2);
        await command('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
        assert.equal(await evaluate('review.state().active'), false);
        await evaluate(`review.open()`);
        await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
        // Resize and the scheduled geometry frame are asynchronous. Wait for the
        // observable layout rather than assuming a frame ran within 150 ms.
        let layout;
        for (let attempt = 0; attempt < 50; attempt++) {
          layout = await evaluate(`(() => { const r = document.querySelector('[aria-label="审查元素信息"]').getBoundingClientRect(); const b=document.querySelector('[aria-label="页面审查"]').getBoundingClientRect();return {left:r.left,right:r.right,bottom:r.bottom,barTop:b.top,width:innerWidth,position:getComputedStyle(document.querySelector('[aria-label="页面审查"]')).position};})()`);
          if (layout.left >= 0 && layout.right <= layout.width && layout.position === 'fixed' && layout.bottom <= layout.barTop - 4) break;
          await delay(100);
        }
        assert(layout.left >= 0 && layout.right <= layout.width && layout.position === 'fixed' && layout.bottom <= layout.barTop - 4, JSON.stringify(layout));
        await evaluate(`review.select('#title')`);
        await delay(150);
        const screenshot = await command('Page.captureScreenshot', { format: 'png' });
        const output = path.join(root, 'verification/review-mode-workflow'); fs.mkdirSync(output, {recursive:true});
        fs.writeFileSync(path.join(output, `editing-${entry}-390.png`), Buffer.from(screenshot.data, 'base64'));
        await evaluate('review.destroy()');
        await command('Emulation.clearDeviceMetricsOverride');
        // Configuration before Core is supported, including scripts in <head> before body exists.
        await command('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/?entry=${entry}&jqui-review=1&config=1&head=1` });
        let auto = false;
        for (let i = 0; i < 100 && !auto; i++) { auto = await evaluate(`!!(window.JquanUIComponents?.reviewModeApi?.state().active && document.querySelector('[data-jq-review-ui]'))`); if (!auto) await delay(100); }
        assert(auto, 'Configured URL did not open');
        await evaluate('JquanUI.destroy()');
        const teardownState = await evaluate(`({ui:!!document.querySelector('[data-jq-review-ui]'),api:window.JquanUIComponents.reviewModeApi?.state(),plugins:typeof JquanUI.getInstalledPlugins==='function'?JquanUI.getInstalledPlugins():null})`);
        assert.equal(teardownState.ui, false, 'Core teardown must dispose plugin: ' + JSON.stringify(teardownState));
        await command('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/?entry=${entry}&jqui-review=1&config=1&head=1&cancel=1` });
        let cancelled = false;
        for (let i=0;i<100&&!cancelled;i++) {cancelled=await evaluate(`location.search.includes('cancel=1')&&document.readyState==='complete'&&typeof reviewReady!=='undefined'`); if(!cancelled)await delay(100);}
        assert(cancelled,'Cancelled readiness fixture timed out');
        await evaluate('reviewReady');
        assert.equal(await evaluate('JquanUIComponents.reviewModeApi.state().enabled'),false,'Destroy before DOM ready must retire scheduled configure');
        console.log(`[JquanUI] review editing ${entry} ok (${result.assertions + 17} assertions; final values, text structure, undo, conflicts, clipboard, native editing, teardown)`);
      }
    }
    if (!draftSnapshot && !keyboardSnapshot && !pickingSnapshot && !selectSnapshot && (!snapshot || snapshot === 'modified') && !process.argv.includes('--probe-navigation')) {
      await command('Emulation.setDeviceMetricsOverride', {width:1280,height:850,deviceScaleFactor:1,mobile:false});
      await command('Page.navigate', {url:`http://127.0.0.1:${server.address().port}/examples/review-mode.html?jqui-review=1`});
      let demo = false;
      for(let i=0;i<100&&!demo;i++){ demo=await evaluate(`location.pathname==='/examples/review-mode.html'&&!!window.JquanUIComponents?.reviewModeApi?.state().active`);if(!demo)await delay(100); }
      assert(demo,'Runnable sample did not open review mode');
      assert.equal(await evaluate(`JquanUIComponents.reviewModeApi.select('#hero-title')&&JquanUIComponents.reviewModeApi.state().selection.computed.fontSize`),'30px');
      await evaluate(`JquanUIComponents.reviewModeApi.setText('客户确认的新标题');JquanUIComponents.reviewModeApi.setUtility('font-size','text-md');JquanUIComponents.reviewModeApi.setUtility('font-size','text-lg');JquanUIComponents.reviewModeApi.setUtility('color','text-blue-600')`);
      assert.equal(await evaluate(`JquanUIComponents.reviewModeApi.changes().length`),3,'Runnable sample must export text/size/color final values');
      await delay(150);
      const screenshot=await command('Page.captureScreenshot',{format:'png'});
      fs.writeFileSync(path.join(root,'verification/review-mode-workflow/review-demo-1280.png'),Buffer.from(screenshot.data,'base64'));
      await evaluate(`document.querySelector('[data-review-edit="search"]').value='brand';document.querySelector('[data-review-edit="search"]').dispatchEvent(new Event('input',{bubbles:true}))`);
      await delay(150);
      fs.writeFileSync(path.join(root,'verification/review-mode-workflow/review-search-1280.png'),Buffer.from((await command('Page.captureScreenshot',{format:'png'})).data,'base64'));
      await evaluate(`document.querySelector('[data-review-view="changes"]').click()`);await delay(150);
      fs.writeFileSync(path.join(root,'verification/review-mode-workflow/review-changes-1280.png'),Buffer.from((await command('Page.captureScreenshot',{format:'png'})).data,'base64'));
      if (process.argv.includes('--draft-check')) {
        await evaluate(`JquanUIComponents.reviewModeApi.close();document.getElementById('save-draft').click()`);
        assert.equal(await evaluate(`document.getElementById('review-load-status').textContent.includes('已保存')`), true);
        await command('Page.navigate', {url:`http://127.0.0.1:${server.address().port}/examples/review-mode.html`});
        let draftDemo = false;
        for (let i=0; i<100&&!draftDemo; i++) { draftDemo = await evaluate(`location.search===''&&!!document.getElementById('load-draft')&&!window.JquanUIComponents?.reviewModeApi`); if(!draftDemo) await delay(100); }
        assert(draftDemo, 'Draft sample should reload without Review implementation');
        await evaluate(`document.getElementById('load-draft').click()`);
        let displayed = false;
        for (let i=0; i<100&&!displayed; i++) { displayed=await evaluate(`!!window.JquanUIComponents?.reviewModeApi&&!document.getElementById('draft-output').hidden`); if(!displayed) await delay(100); }
        assert(displayed, 'Draft sample should display saved plan');
        assert.equal(await evaluate(`JSON.parse(document.getElementById('draft-output').textContent).changes.length`),3);
        assert.equal(await evaluate(`document.getElementById('hero-title').textContent`),'客户预览标题');
        assert.equal(await evaluate(`JquanUIComponents.reviewModeApi.state().active`),false);
        await evaluate(`document.getElementById('clear-draft').click()`);
        assert.equal(await evaluate(`document.getElementById('draft-output').hidden&&JquanUIComponents.reviewModeApi.loadDraft('review-demo-client-home')===null`),true);
        console.log('[JquanUI] draft sample ok (save, reload, lazy read, display, clear; 7 assertions)');
      }
      await evaluate('JquanUIComponents.reviewModeApi.destroy()');
      console.log('[JquanUI] review mode runnable sample ok (URL entry, Core styles, selection)');
      await command('Page.navigate', {url:`http://127.0.0.1:${server.address().port}/examples/review-mode-select.html`});
      let selectDemo = false;
      for(let i=0;i<100&&!selectDemo;i++){selectDemo=await evaluate(`location.pathname==='/examples/review-mode-select.html'&&!!window.JquanUIComponents?.selectApi?.get('#sample-select')`);if(!selectDemo)await delay(100);}
      assert(selectDemo,'Select runnable sample did not mount');
      assert.equal(await evaluate('!!window.JquanUIComponents.reviewModeApi'),false,'Review must remain absent before entry');
      await evaluate(`document.getElementById('start-review').click()`);
      let selectReview = false;
      for(let i=0;i<100&&!selectReview;i++){selectReview=await evaluate(`!!window.JquanUIComponents?.reviewModeApi?.state().active`);if(!selectReview)await delay(100);}
      assert(selectReview,'Select runnable sample did not open review');
      const selectPoint=await evaluate(`(()=>{const r=JquanUIComponents.selectApi.get('#sample-select').control().getBoundingClientRect();return {x:r.left+20,y:r.top+r.height/2};})()`);
      for(const type of ['mousePressed','mouseReleased'])await command('Input.dispatchMouseEvent',{type,...selectPoint,button:'left',clickCount:1});
      assert.equal(await evaluate('JquanUIComponents.reviewModeApi.state().selection.tag'),'select','Native trigger click selects source');
      assert.equal(await evaluate('JquanUIComponents.selectApi.get("#sample-select").state().open'),false,'Picking must not open business Select');
      await evaluate(`JquanUIComponents.reviewModeApi.select('#preview');JquanUIComponents.selectApi.get('#sample-select').control().focus()`);
      for(const type of ['keyDown','keyUp'])await command('Input.dispatchKeyEvent',{type,key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
      assert.equal(await evaluate('JquanUIComponents.reviewModeApi.state().selection.tag'),'select','Native Enter on trigger selects source');
      await evaluate(`JquanUIComponents.reviewModeApi.setComponentOption('select','disabled',true);JquanUIComponents.reviewModeApi.select('#preview')`);
      for(const type of ['mousePressed','mouseReleased'])await command('Input.dispatchMouseEvent',{type,...selectPoint,button:'left',clickCount:1});
      assert.equal(await evaluate('JquanUIComponents.reviewModeApi.state().selection.tag'),'select','Disabled Select remains selectable through pointerdown');
      assert.equal(await evaluate(`JquanUIComponents.reviewModeApi.setComponentOption('select','disabled',false)`),true);
      assert.equal(await evaluate('JquanUIComponents.reviewModeApi.componentOptions().length'),3);
      assert.equal(await evaluate(`JquanUIComponents.reviewModeApi.setComponentOption('select','clearable',false)&&JquanUIComponents.selectApi.get('#sample-select').value()==='online'`),true);
      const selectOutput=path.join(root,'verification/review-mode-picking');fs.mkdirSync(selectOutput,{recursive:true});
      for(const width of [1280,390]){
        await command('Emulation.setDeviceMetricsOverride',{width,height:850,deviceScaleFactor:1,mobile:false});await delay(150);
        const point=await evaluate(`(()=>{const r=document.querySelector('[aria-label="审查元素信息"]').getBoundingClientRect();return {left:r.left,right:r.right,width:innerWidth};})()`);
        assert(point.left>=0&&point.right<=point.width,'Select review panel must fit viewport');
        fs.writeFileSync(path.join(selectOutput,`select-review-${width}.png`),Buffer.from((await command('Page.captureScreenshot',{format:'png'})).data,'base64'));
      }
      await evaluate('JquanUIComponents.reviewModeApi.destroy()');
      console.log('[JquanUI] Select review sample ok (native click/Enter select source, 3 fields, native value, desktop/mobile layout)');
      if (process.argv.includes('--apply-check')) {
        await command('Page.enable');
        await command('Page.addScriptToEvaluateOnNewDocument', { source: `window.applyDemoErrors=[];addEventListener('error',e=>applyDemoErrors.push(e.message));addEventListener('unhandledrejection',e=>applyDemoErrors.push(String(e.reason)));` });
        const waitFor = async expression => { for(let i=0;i<100;i++){if(await evaluate(expression))return;await delay(100);}throw Error('Apply sample timed out: '+expression); };
        const click = async id => {
          const point = await evaluate(`(()=>{const n=document.getElementById(${JSON.stringify(id)});n.scrollIntoView({block:'center'});const r=n.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()`);
          for (const type of ['mousePressed','mouseReleased']) await command('Input.dispatchMouseEvent',{type,...point,button:'left',clickCount:1});
        };
        for (const width of [1280,390]) {
          await command('Emulation.setDeviceMetricsOverride',{width,height:850,deviceScaleFactor:1,mobile:false});
          await command('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/examples/review-mode-apply.html`});
          await waitFor(`location.pathname==='/examples/review-mode-apply.html'&&document.readyState==='complete'&&!!document.getElementById('prepare')`);
          assert.equal(await evaluate('!!window.JquanUIComponents?.reviewModeApi'),false,'Apply demo stays lazy');
          await click('prepare'); await waitFor(`!document.getElementById('preflight').disabled`);
          assert.equal(await evaluate(`document.getElementById('client-title').textContent`),'原始页面标题');
          await click('preflight'); await waitFor(`!document.getElementById('apply').disabled`);
          assert.equal(await evaluate(`JSON.parse(document.getElementById('report').textContent).dryRun&&document.getElementById('client-title').textContent==='原始页面标题'`),true);
          await click('apply'); await waitFor(`!document.getElementById('restore').disabled`);
          assert.equal(await evaluate(`document.getElementById('client-title').textContent==='客户确认的新标题'&&JquanUIComponents.reviewModeApi.state().canUndo`),true);
          await click('restore'); await waitFor(`document.getElementById('status').textContent.includes('页面已还原')`);
          assert.equal(await evaluate(`document.getElementById('client-title').textContent==='原始页面标题'&&!JquanUIComponents.reviewModeApi.changes().length`),true);
          assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),true,'Apply demo fits viewport');
          assert.deepEqual(await evaluate('applyDemoErrors'),[]);
          const destination=path.join(root,'verification/review-mode-apply');fs.mkdirSync(destination,{recursive:true});
          await evaluate('scrollTo(0,0)');
          fs.writeFileSync(path.join(destination,`apply-demo-${width}.png`),Buffer.from((await command('Page.captureScreenshot',{format:'png'})).data,'base64'));
        }
        console.log('[JquanUI] apply sample ok (2 viewports x 7 assertions; lazy import, native controls, dry-run, apply, restore, no overflow/errors)');
      }
    }
  } finally { for (const item of pending.values()) clearTimeout(item.timer); socket?.close(); browser.kill(); server.close(); }
}
main().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
