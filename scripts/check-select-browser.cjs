'use strict';
const assert=require('assert/strict'),fs=require('fs'),http=require('http'),path=require('path');
const {spawn}=require('child_process');
const root=path.resolve(__dirname,'..');
const browserPath=process.env.JQUAN_BROWSER||['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
assert(browserPath,'Set JQUAN_BROWSER to Chromium.');
const snapshot=process.argv.includes('--snapshot')?process.argv[process.argv.indexOf('--snapshot')+1]:null;
if(snapshot&&!['baseline','modified','rollback-copy'].includes(snapshot))throw Error('Invalid snapshot');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const entries={core:'/dist/core/JquanUI@Core.js',min:'/js/JquanUI@core.min.js',full:'/dist/full/JquanUI@full.js',components:'/dist/core/JquanUI@Core.js'};
const template=fs.readFileSync(path.join(root,'scripts/select-browser-fixture.html'),'utf8');
async function main(){
  const server=http.createServer((request,response)=>{
    const url=new URL(request.url,'http://localhost');response.setHeader('Cache-Control','no-store');
    if(url.pathname==='/'){
      const entry=url.searchParams.get('entry');if(!entries[entry]){response.writeHead(400);response.end();return;}
      response.setHeader('Content-Type','text/html;charset=utf-8');
      const extra=entry==='components'?'<script src="/dist/components/JquanUI@components.js"></script>':'';
      response.end(template.replace('<!-- CORE_ENTRY -->',`<script src="${entries[entry]}"></script>${extra}`).replace('<!-- PROBE_SCRIPTS -->',''));return;
    }
    let relative=decodeURIComponent(url.pathname).slice(1);
    if(snapshot&&['dist/components/select.js','dist/components/modal.js'].includes(relative))relative=`verification/select-lifecycle/${snapshot}/${relative}`;
    const file=path.resolve(root,relative),fromRoot=path.relative(root,file);
    if(fromRoot.startsWith('..')||path.isAbsolute(fromRoot)||!fs.existsSync(file)||!fs.statSync(file).isFile()){response.writeHead(404);response.end();return;}
    response.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':'text/plain');fs.createReadStream(file).pipe(response);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const port=11600+Math.floor(Math.random()*200);
  const browser=spawn(browserPath,['--headless=new','--disable-gpu','--no-sandbox',`--remote-debugging-port=${port}`,`--user-data-dir=${path.join(root,'.tmp','select-'+Date.now())}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
  let socket;const pending=new Map();
  try{
    let pages;for(let i=0;i<100&&!pages;i++){try{pages=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();}catch{}if(!pages)await delay(100);}
    assert(pages,'Browser start timed out');socket=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
    await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});let seq=0;
    socket.onmessage=event=>{const m=JSON.parse(event.data),item=pending.get(m.id);if(!item)return;clearTimeout(item.timer);pending.delete(m.id);m.error?item.reject(Error(JSON.stringify(m.error))):item.resolve(m.result);};
    const command=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error(method+' timeout'));},20000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params}));});
    const evaluate=async expression=>{const r=await command('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});assert(!r.exceptionDetails,JSON.stringify(r.exceptionDetails));return r.result.value;};
    const key=async key=>{for(const type of ['keyDown','keyUp'])await command('Input.dispatchKeyEvent',{type,key,code:key,windowsVirtualKeyCode:key==='Tab'?9:27});};
    await command('Runtime.enable');await command('Emulation.setFocusEmulationEnabled',{enabled:true});
    for(const entry of snapshot?['core']:Object.keys(entries)){
      const query=`?entry=${entry}`;await command('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/${query}`});
      let ready=false;for(let i=0;i<100&&!ready;i++){ready=await evaluate(`location.search===${JSON.stringify(query)}&&typeof selectReady!=='undefined'`);if(!ready)await delay(100);}assert(ready,'Fixture timed out');await evaluate('selectReady');
      if(snapshot){
        const output=await evaluate(`(async()=>{const api=JquanUIComponents.selectApi,h=api.get('#single');let context;h.update({remoteMethod:(q,handle,c)=>{context=c;return []}});h.open();const input=document.querySelector('[jq-select-search]');input.value='probe';input.dispatchEvent(new Event('input',{bubbles:true}));await pause(150);return 'stable='+(api.get('#single')===h)+'; context='+!!context?.signal+'; stack='+JquanUIComponents.overlayManagerApi.stack().length;})()`);
        assert.equal(output,snapshot==='modified'?'stable=true; context=true; stack=1':'stable=false; context=false; stack=0');console.log(output);continue;
      }
      const result=await evaluate('runSelectChecks()');
      const added=await evaluate('runSelectLifecycleChecks()');
      await evaluate('prepareSelectKeyboard()');await key('Escape');await delay(260);
      assert.equal(await evaluate('selectState()'),'modal=open select=closed stack=1','Native Escape dismisses one layer');
      await evaluate('selectModal.destroy()');assert.equal(await evaluate('document.body.style.overflow'),'scroll');
      // Non-searchable Select keeps keyboard navigation on the listbox.
      await evaluate(`JquanUIComponents.selectApi.get('#single').update({searchable:false});JquanUIComponents.selectApi.get('#single').open()`);
      await command('Input.dispatchKeyEvent',{type:'keyDown',key:'End',code:'End',windowsVirtualKeyCode:35});
      assert.equal(await evaluate(`document.querySelector('[jq-select-option][data-active=true]').dataset.value`),'beta');
      await command('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
      assert.equal(await evaluate(`document.querySelector('#single').value`),'beta');
      console.log(`[JquanUI] select browser ${entry} ok (${result.assertions+added.assertions} fixture assertions; native Escape/keyboard, remote, ARIA, stack)`);
    }
    if(!snapshot)console.log('[JquanUI] select browser check ok (Core, minified, Full, Components)');
  }finally{for(const item of pending.values())clearTimeout(item.timer);socket?.close();browser.kill();server.close();}
}
main().catch(error=>{console.error(error.stack||error.message);process.exitCode=1;});
