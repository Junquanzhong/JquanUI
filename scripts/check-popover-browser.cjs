'use strict';
const assert=require('assert/strict'),fs=require('fs'),http=require('http'),path=require('path');
const {spawn}=require('child_process');
const root=path.resolve(__dirname,'..');
const browserPath=process.env.JQUAN_BROWSER||['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
assert(browserPath,'Set JQUAN_BROWSER to Chromium.');
const snapshot=process.argv.includes('--snapshot')?process.argv[process.argv.indexOf('--snapshot')+1]:null;
const snapshotRoot=process.argv.includes('--snapshot-root')?process.argv[process.argv.indexOf('--snapshot-root')+1]:'verification/popover-lifecycle';
if(!['verification/popover-lifecycle','verification/parallel-integration'].includes(snapshotRoot))throw Error('Invalid snapshot root');
if(snapshot&&!['baseline','modified','rollback-copy'].includes(snapshot))throw Error('Invalid snapshot');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const entries={core:'/dist/core/JquanUI@Core.js',min:'/js/JquanUI@core.min.js',full:'/dist/full/JquanUI@full.js',components:'/dist/core/JquanUI@Core.js'};
const template=fs.readFileSync(path.join(root,'scripts/popover-browser-fixture.html'),'utf8');
async function main(){
  const server=http.createServer((request,response)=>{
    const url=new URL(request.url,'http://localhost');response.setHeader('Cache-Control','no-store');
    if(url.pathname==='/'){
      const entry=url.searchParams.get('entry');if(!entries[entry]){response.writeHead(400);response.end();return;}
      response.setHeader('Content-Type','text/html;charset=utf-8');
      const extra=entry==='components'?'<script src="/dist/components/JquanUI@components.js"></script>':'';
      response.end(template.replace('<!-- CORE_ENTRY -->',`<script src="${entries[entry]}"></script>${extra}`));return;
    }
    let relative=decodeURIComponent(url.pathname).slice(1);
    if(snapshot&&['dist/components/popover.js'].includes(relative))relative=`${snapshotRoot}/${snapshot}/${relative}`;
    const file=path.resolve(root,relative),fromRoot=path.relative(root,file);
    if(fromRoot.startsWith('..')||path.isAbsolute(fromRoot)||!fs.existsSync(file)||!fs.statSync(file).isFile()){response.writeHead(404);response.end();return;}
    response.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':'text/plain');fs.createReadStream(file).pipe(response);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const port=11600+Math.floor(Math.random()*200);
  const browser=spawn(browserPath,['--headless=new','--disable-gpu','--no-sandbox',`--remote-debugging-port=${port}`,`--user-data-dir=${path.join(root,'.tmp','popover-'+Date.now())}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
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
      let ready=false;for(let i=0;i<100&&!ready;i++){ready=await evaluate(`location.search===${JSON.stringify(query)}&&typeof popoverReady!=='undefined'`);if(!ready)await delay(100);}assert(ready,'Fixture timed out');await evaluate('popoverReady');
      if(snapshot){
        const output=await evaluate('popoverProbe()');
        assert.equal(output,snapshot==='modified'?'stable=true; stack=1':'stable=false; stack=0');console.log(output);continue;
      }
      const result=await evaluate('runPopoverChecks()');
      await evaluate('preparePopoverKeyboard()');
      await evaluate("document.getElementById('last').focus()");
      await key('Tab');
      assert.equal(await evaluate('document.activeElement.id'),'first','Native Tab wraps top panel');
      await key('Escape');
      assert.equal(await evaluate('pop.state()'),false,'Native Escape closes Popover');
      assert.equal(await evaluate('overlays.stack().length'),0);
      console.log('[JquanUI] popover browser '+entry+' ok ('+result.assertions+' fixture assertions; native Tab/Escape)');
    }
    if(!snapshot)console.log('[JquanUI] popover browser check ok (Core, minified, Full, Components)');
  }finally{for(const item of pending.values())clearTimeout(item.timer);socket?.close();browser.kill();server.close();}
}
main().catch(error=>{console.error(error.stack||error.message);process.exitCode=1;});
