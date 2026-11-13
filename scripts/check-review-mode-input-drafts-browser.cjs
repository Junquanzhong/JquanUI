'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),http=require('node:http');
const {spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),fixture=path.join(root,'verification/review-mode-input-drafts-2026-11-10');
const arg=k=>process.argv.includes(k)?process.argv[process.argv.indexOf(k)+1]:null;
const snapshot=arg('--snapshot'),probe=process.argv.includes('--probe');
assert(!snapshot||['baseline','modified','rollback-copy'].includes(snapshot));
const old=snapshot==='baseline'||snapshot==='rollback-copy';
const entries={core:'/dist/core/JquanUI@Core.js',min:'/js/JquanUI@core.min.js',full:'/dist/full/JquanUI@full.js',components:'/dist/core/JquanUI@Core.js'};
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function main(){
 const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/fixture'){
   const entry=url.searchParams.get('entry');assert(entries[entry]);
   res.setHeader('Content-Type','text/html;charset=utf-8');
   res.end(`<!doctype html><html lang="zh-CN"><head><meta name="viewport" content="width=device-width,initial-scale=1"><script>localStorage.clear();window.tokenErrors=[];addEventListener('error',e=>tokenErrors.push(e.message));addEventListener('unhandledrejection',e=>tokenErrors.push(String(e.reason)));</script><script src="${entries[entry]}"></script>${entry==='components'?'<script src="/dist/components/JquanUI@components.js"></script>':''}</head><body><main id="preview"></main><script>window.tokenReady=(async()=>{await JquanUI.import('tabs',{install:false});window.review=await JquanUI.import('reviewMode')})();</script></body></html>`);return;
  }
  let rel=decodeURIComponent(url.pathname).slice(1);
  if(snapshot){const saved=path.join(fixture,snapshot,rel);if(fs.existsSync(saved))rel=path.relative(root,saved)}
  const file=path.resolve(root,rel);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return}
  res.setHeader('Content-Type',file.endsWith('.js')||file.endsWith('.mjs')?'text/javascript':'text/html;charset=utf-8');fs.createReadStream(file).pipe(res);
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browserPath=process.env.JQUAN_BROWSER||['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);assert(browserPath);
 const port=17200+Math.floor(Math.random()*400),browser=spawn(browserPath,['--headless=new','--disable-gpu','--no-sandbox',`--remote-debugging-port=${port}`,`--user-data-dir=${path.join(root,'.tmp','review-input-drafts-'+Date.now())}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
 let socket,seq=0;const pending=new Map();
 try{
  let pages;for(let i=0;i<100&&!pages;i++){try{pages=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json()}catch{}if(!pages)await delay(100)}assert(pages);
  socket=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise((r,j)=>{socket.onopen=r;socket.onerror=j});
  socket.onmessage=e=>{const m=JSON.parse(e.data),p=pending.get(m.id);if(!p)return;clearTimeout(p.timer);pending.delete(m.id);m.error?p.j(Error(JSON.stringify(m.error))):p.r(m.result)};
  const command=(method,params={})=>new Promise((r,j)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);j(Error(method+' timeout'))},20000);pending.set(id,{r,j,timer});socket.send(JSON.stringify({id,method,params}))});
  const evaluate=async expression=>{const r=await command('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});assert(!r.exceptionDetails,JSON.stringify(r.exceptionDetails));return r.result.value};
  await command('Page.enable');
  for(const entry of Object.keys(entries)){
   await evaluate('window.previousTokenPage=true');await command('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/fixture?entry=${entry}`});
   let ready=false;for(let i=0;i<120&&!ready;i++){ready=await evaluate('!window.previousTokenPage&&typeof tokenReady!=="undefined"');if(!ready)await delay(30)}assert(ready);await evaluate('tokenReady');
   if(probe){
    const result=await evaluate(`(async()=>{const root=document.getElementById('preview');root.innerHTML='<h1 id="title">Original</h1>';review.configure({enabled:true,root});review.open();review.select('#title');const input=document.querySelector('[data-review-edit="text:0"]');input.focus();input.value='Client draft';input.setSelectionRange(2,6,'backward');input.dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('title').setAttribute('data-live','1');await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const next=document.querySelector('[data-review-edit="text:0"]'),result={version:JquanUIComponents.reviewMode.version,draft:next.value==='Client draft',caret:next.selectionStart===2&&next.selectionEnd===6&&next.selectionDirection==='backward',focused:document.activeElement===next,page:document.getElementById('title').textContent,changes:review.changes().length};review.destroy();return result})()`);
    assert.deepEqual(result,{version:old?'0.16.0':'0.18.1',draft:!old,caret:!old,focused:true,page:'Original',changes:0});
    console.log(`${old?snapshot==='baseline'?'BASELINE':'ROLLBACK':'MODIFIED'} ${entry} ${JSON.stringify(result)}`);
   }else{
    const result=await evaluate(fs.readFileSync(path.join(root,'scripts/review-mode-input-draft-checks.js'),'utf8'));
    console.log('MODIFIED '+entry+' '+JSON.stringify(result));
   }
  }
  if(!probe&&!snapshot){
   await command('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/examples/review-mode-input-drafts.html`});
   for(let i=0;i<120;i++){if(await evaluate('location.pathname.endsWith("review-mode-input-drafts.html")&&document.readyState==="complete"&&!!window.JquanUI'))break;await delay(30)}
   assert.equal(await evaluate('!!window.JquanUIComponents?.reviewMode'),false,'Example keeps Review on demand');
   await evaluate('document.getElementById("start-review").click()');
   for(let i=0;i<120;i++){if(await evaluate('!!window.JquanUIComponents?.reviewModeApi?.state().active'))break;await delay(30)}
   for(const width of [1280,390]){
    await command('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    await evaluate(`JquanUIComponents.reviewModeApi.select('#sample-title');document.querySelector('[data-review-edit="text:0"]').focus()`);
    for(const type of ['keyDown','keyUp'])await command('Input.dispatchKeyEvent',{type,key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers:2});
    await command('Input.insertText',{text:'客户正在输入的新标题'});
    await evaluate('document.getElementById("sample-title").setAttribute("data-live",String(Date.now()))');
    const observed=await evaluate(`(async()=>{await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const input=document.querySelector('[data-review-edit="text:0"]');return {value:input.value,focused:document.activeElement===input,source:document.getElementById('sample-title').textContent,changes:JquanUIComponents.reviewModeApi.changes().length,overflow:document.documentElement.scrollWidth>innerWidth}})()`);
    assert.deepEqual(observed,{value:'客户正在输入的新标题',focused:true,source:'欢迎审查这个页面',changes:0,overflow:false});
    await evaluate(`document.querySelector('[data-review-apply="text:0"]').click()`);
    assert.equal(await evaluate('document.getElementById("sample-title").textContent'),'客户正在输入的新标题');
    await evaluate('JquanUIComponents.reviewModeApi.reset()');
   }
   fs.writeFileSync(path.join(fixture,'example-390.png'),Buffer.from((await command('Page.captureScreenshot',{format:'png'})).data,'base64'));
   await evaluate('JquanUIComponents.reviewModeApi.destroy()');console.log('[JquanUI] input draft example ok (on-demand, native typing, passive refresh, apply, 1280/390px)');
  }
 }finally{for(const p of pending.values())clearTimeout(p.timer);socket?.close();browser.kill();await new Promise(r=>server.close(r))}
 console.log(probe ? `${old?snapshot==='baseline'?'BASELINE':'ROLLBACK':'MODIFIED'} entries=4; draft=${!old}; caret=${!old}; page=Original; changes=0` : 'MODIFIED entries=4; checks=49; version=0.18.1; example=1280/390px');
 console.log('[JquanUI] review input drafts ok');
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1});


