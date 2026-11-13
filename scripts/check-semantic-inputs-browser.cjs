'use strict';
const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const http = require('http');
const vm = require('vm');
const {spawn} = require('child_process');
const root = path.resolve(__dirname, '..');
const snapshot = process.argv.includes('--snapshot') ? process.argv[process.argv.indexOf('--snapshot')+1] : null;
if (snapshot && !['baseline','modified','rollback-copy'].includes(snapshot)) throw Error('Invalid snapshot');
const migrated = !snapshot || snapshot === 'modified';
const entries = { core:'/dist/core/JquanUI@Core.js', min:'/js/JquanUI@core.min.js', full:'/dist/full/JquanUI@full.js', components:'/dist/core/JquanUI@Core.js' };
const doc = vm.runInNewContext('('+fs.readFileSync(path.join(root,'content/components/select.js'),'utf8').split('export default ')[1].replace(/;\s*$/,'')+')');
const template = doc.examples.find(e=>e.id==='semantic-minimum').code;
const numberDoc = vm.runInNewContext('('+fs.readFileSync(path.join(root,'content/components/numberInput.js'),'utf8').split('export default ')[1].replace(/;\s*$/,'')+')');
assert.equal(numberDoc.examples.find(e=>e.id==='semantic-minimum').code,template,'Keep both runnable combination examples synchronized');
const delay = ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function main() {
  const server = http.createServer((req,res)=>{
    const url = new URL(req.url,'http://localhost');
    res.setHeader('Cache-Control','no-store');
    if(url.pathname==='/') {
      const entry=url.searchParams.get('entry'), mode=url.searchParams.get('mode'), layers=url.searchParams.get('layers')==='true';
      if(!entries[entry]) {res.writeHead(400);res.end();return;}
      const scripts = snapshot ? ['select','numberInput'].map(name=>`<script src="/verification/semantic-inputs/${snapshot}/dist/components/${name}.js"></script>`).join('') : entry==='components' ? '<script src="/dist/components/JquanUI@components.js"></script>' : '';
      res.setHeader('Content-Type','text/html;charset=utf-8');
      res.end(template.replace('  componentPresets:',`  cascadeLayers: ${layers},\n  componentPresets:`).replace("{ ui: 'semantic' }",mode==='default'?'{}':JSON.stringify({ui:mode})).replace('<script src="./dist/core/JquanUI@Core.js"></script>',`<script src="${entries[entry]}"></script>${scripts}`));return;
    }
    const file=path.resolve(root,decodeURIComponent(url.pathname).slice(1)), relative=path.relative(root,file);
    if(relative.startsWith('..')||path.isAbsolute(relative)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
    res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':'text/plain');fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browserPath=process.env.JQUAN_BROWSER||['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
  assert(browserPath,'Set JQUAN_BROWSER');
  const port=11400+Math.floor(Math.random()*200);
  const browser=spawn(browserPath,['--headless=new','--disable-gpu','--no-sandbox',`--remote-debugging-port=${port}`,`--user-data-dir=${path.join(root,'.tmp','inputs-'+Date.now())}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
  let socket;const pending=new Map();
  try {
    let pages;
    for(let i=0;i<100&&!pages;i++){try{pages=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();}catch{}if(!pages)await delay(100);}
    assert(pages,'Browser timeout');socket=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
    await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});let sequence=0;
    socket.onmessage=event=>{const m=JSON.parse(event.data),p=pending.get(m.id);if(!p)return;clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);};
    const command=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence;const timer=setTimeout(()=>{pending.delete(id);reject(Error(method+' timeout'));},20000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params}));});
    const evaluate=async expression=>{const r=await command('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});assert(!r.exceptionDetails,JSON.stringify(r.exceptionDetails));return r.result.value;};
    await command('Runtime.enable');await command('Emulation.setFocusEmulationEnabled',{enabled:true});
    for(const entry of snapshot?['core']:Object.keys(entries))for(const mode of snapshot?['semantic']:['default','legacy','semantic'])for(const layers of snapshot?[false]:[false,true]){
      const semantic=migrated&&mode==='semantic',query=`?entry=${entry}&mode=${mode}&layers=${layers}`;
      await command('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'light'}]});
      await command('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/${query}`});
      let ready=false;for(let i=0;i<100&&!ready;i++){ready=await evaluate(`location.search===${JSON.stringify(query)}&&typeof inputsReady!=='undefined'`);if(!ready)await delay(100);}
      assert(ready,'Example timeout');await evaluate('inputsReady');
      for(let i=0;i<100&&await evaluate('document.readyState')!=='complete';i++)await delay(50);
      await delay(100);
      await evaluate(`(()=>{const s=document.createElement('style');s.textContent='*,::before,::after{transition:none!important;animation:none!important}';document.head.append(s);window.nativeNumber=document.querySelector('#quantity');window.nativeSelect=document.querySelector('#flavor');window.wrap=nativeNumber.parentElement;window.trigger=document.querySelector('[jq-select-trigger]');window.panel=document.querySelector('[jq-select-panel]');inputDemo.select.open();window.search=panel.querySelector('[jq-select-search]');})()`);
      const css=selector=>evaluate(`(()=>{const s=getComputedStyle(document.querySelector(${JSON.stringify(selector)}));return {bg:s.backgroundColor,text:s.color,border:s.borderTopColor,shadow:s.boxShadow,outline:s.outlineColor};})()`);
      const surface='rgb(15, 23, 42)', muted='rgb(30, 41, 59)',text='rgb(241, 245, 249)',border='rgb(51, 65, 85)',accent='rgb(96, 165, 250)';
      const light={trigger:await css('[jq-select-trigger]'),panel:await css('[jq-select-panel]'),number:await css('[jq-number-input-wrap]')};
      assert.equal(light.trigger.bg,semantic||layers?'rgb(255, 255, 255)':'rgba(0, 0, 0, 0)');assert.equal(light.number.bg,'rgb(255, 255, 255)');
      await evaluate(`document.documentElement.className='dark'`);
      const dark={trigger:await css('[jq-select-trigger]'),panel:await css('[jq-select-panel]'),number:await css('[jq-number-input-wrap]')};
      for(const k of ['trigger','panel','number'])assert.equal(dark[k].bg,semantic?surface:light[k].bg,k+' dark surface');
      assert.equal(dark.trigger.text,semantic?text:light.trigger.text);assert.equal(dark.number.text,semantic?text:light.number.text);
      if(semantic){
        assert.equal((await css('[jq-select-chip]')).bg,muted);assert.equal((await css('[jq-select-option][data-selected=true] [jq-select-check]')).bg,accent);
        assert.equal((await css('[jq-select-option][data-selected=true]')).border,'color(srgb 0.376471 0.647059 0.980392 / 0.3)');
        assert.equal((await css('[jq-select-search]')).border,accent);assert((await css('[jq-select-search]')).shadow.includes('59, 130, 246')||(await css('[jq-select-search]')).shadow.includes('0.231373'));
        assert.equal((await css('[jq-number-input-wrap]')).border,border);
      }
      assert(await evaluate(`document.activeElement===search&&panel===document.querySelector('[jq-select-panel]')&&wrap===nativeNumber.parentElement&&inputDemo.select.values().join()==='milk'&&nativeNumber.value==='2'`),'Theme changed focus/DOM/value');
      if(snapshot){console.log(`select=${dark.trigger.bg}; panel=${dark.panel.bg}; number=${dark.number.bg}; value=2; preserved=true`);continue;}
      if(semantic){
        await command('DOM.enable');await command('CSS.enable');
        const {root:domRoot}=await command('DOM.getDocument');
        const {nodeId}=await command('DOM.querySelector',{nodeId:domRoot.nodeId,selector:'[jq-number-input-button]:last-child'});
        await command('CSS.forcePseudoState',{nodeId,forcedPseudoClasses:['hover','focus-visible']});
        assert.equal((await css('[jq-number-input-button]:last-child')).text,accent,'Hover accent');
        assert.equal((await css('[jq-number-input-button]:last-child')).outline,'color(srgb 0.231373 0.509804 0.964706 / 0.35)','Focus role');
        await command('CSS.forcePseudoState',{nodeId,forcedPseudoClasses:[]});
        await evaluate(`nativeNumber.placeholder='Quantity';nativeNumber.value=''`);
        assert.equal(await evaluate(`getComputedStyle(nativeNumber,'::placeholder').color`),'rgb(148, 163, 184)');
        await evaluate(`nativeNumber.value='2'`);
      }
      // Exercise ordinary value/keyboard/events independently of the known overlay-stack work.
      assert(await evaluate(`(()=>{inputDemo.select.select('tea');inputDemo.select.select('coffee');return [...nativeSelect.selectedOptions].map(o=>o.value).join()==='milk,tea';})()`));
      await evaluate(`inputDemo.select.close();window.events=[];nativeNumber.addEventListener('jquan:number-input:change',e=>events.push(e.detail));nativeNumber.focus();nativeNumber.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',shiftKey:true,bubbles:true}));`);
      assert.equal(await evaluate('nativeNumber.value'),'7');assert.equal(await evaluate('events.length'),1);
      assert.equal(await evaluate('document.activeElement===nativeNumber'),true);
      if(semantic){assert.equal((await css('[jq-number-input-wrap]')).border,accent);assert((await css('[jq-number-input-wrap]')).shadow.includes('59, 130, 246')||(await css('[jq-number-input-wrap]')).shadow.includes('0.231373'));}
      await evaluate(`document.querySelector('[jq-number-input-quick-button][data-amount="5"]').click()`);assert.equal(await evaluate('nativeNumber.value'),'12');
      await evaluate(`inputDemo.number.update({disabled:true});inputDemo.select.update({disabled:true})`);
      assert.equal((await css('[jq-number-input-wrap]')).bg,semantic?muted:'rgb(248, 250, 252)');assert.equal((await css('[jq-select-trigger]')).bg,semantic?muted:'rgb(248, 250, 252)');
      assert(await evaluate(`document.querySelector('[jq-number-input-button]').disabled&&trigger.disabled&&!inputDemo.select.open()`));
      await evaluate(`inputDemo.number.update({disabled:false,readonly:true});inputDemo.select.update({disabled:false});inputDemo.number.step();`);
      assert.equal(await evaluate('nativeNumber.value'),'12');assert.equal((await css('[jq-number-input-wrap]')).bg,semantic?muted:'rgb(248, 250, 252)');
      await evaluate(`inputDemo.number.update({readonly:false});nativeNumber.blur();document.querySelector('#mode').click()`);
      assert.equal((await css('[jq-number-input-wrap]')).bg,light.number.bg,'Published toggle');
      await command('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'dark'}]});
      assert.equal((await css('[jq-number-input-wrap]')).bg,light.number.bg,'Explicit light');
      await evaluate(`document.documentElement.className=''`);assert.equal((await css('[jq-number-input-wrap]')).bg,dark.number.bg,'System dark');
      await evaluate(`document.documentElement.className='light';document.querySelector('#scope').className='dark'`);
      assert.equal((await css('[jq-number-input-wrap]')).bg,dark.number.bg,'Local dark');assert.equal((await css('[jq-select-trigger]')).bg,dark.trigger.bg,'Local trigger');assert.equal((await css('[jq-select-panel]')).bg,light.panel.bg,'Portal must use body theme');
      await evaluate(`document.querySelector('#scope').className='';document.documentElement.className='dark';JQUAN_CONFIG.themes={forest:{semantic:Object.assign({},JQUAN_CONFIG.theme.semantic,{surface:{light:'#ecfdf5',dark:'#064e3b'}})}};JquanUI.setTheme('forest')`);
      assert.equal((await css('[jq-number-input-wrap]')).bg,semantic?'rgb(6, 78, 59)':light.number.bg);assert.equal((await css('[jq-select-panel]')).bg,semantic?'rgb(6, 78, 59)':light.panel.bg);
      await evaluate(`JquanUI.setTheme('default');wrap.classList.add('!bg-red-100');JquanUI.scan()`);await delay(30);
      assert.equal((await css('[jq-number-input-wrap]')).bg,'rgb(254, 226, 226)','Important class override');
      await evaluate(`disposeInputs()`);
      assert(await evaluate(`!document.querySelector('[jq-select-wrap]')&&!document.querySelector('[jq-select-panel]')&&!document.querySelector('[jq-number-input-wrap]')&&!document.querySelector('[jq-number-input-quick]')&&!nativeSelect.hidden&&nativeNumber.value==='12'&&!nativeNumber.hasAttribute('jq-number-input-field')`),'Dispose failed');
      console.log(`[JquanUI] semantic inputs ${entry}/${mode}/layers=${layers} ok`);
    }
    if(!snapshot)console.log('[JquanUI] semantic inputs browser check ok (24 scenarios; Core/min/Full/Components)');
  }finally{for(const p of pending.values())clearTimeout(p.timer);socket?.close();browser.kill();server.close();}
}
main().catch(error=>{console.error(error.stack||error.message);process.exitCode=1;});
