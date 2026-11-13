'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),http=require('node:http');
const {spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),fixture=path.join(root,'verification/review-mode-carousel-controls-2026-11-11');
const arg=k=>process.argv.includes(k)?process.argv[process.argv.indexOf(k)+1]:null;
const snapshot=arg('--snapshot'),probe=process.argv.includes('--probe');
assert(!snapshot||['baseline','modified','rollback-copy'].includes(snapshot));
const old=snapshot==='baseline'||snapshot==='rollback-copy';
const entries={core:'/dist/core/JquanUI@Core.js',min:'/js/JquanUI@core.min.js',full:'/dist/full/JquanUI@full.js',components:'/dist/core/JquanUI@Core.js'};
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function main(){
 const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/fixture'){
   const entry=url.searchParams.get('entry');assert(entries[entry]);
   res.setHeader('Content-Type','text/html;charset=utf-8');
   res.end(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><script src="${entries[entry]}"></script>${entry==='components'?'<script src="/dist/components/JquanUI@components.js"></script>':''}</head><body><main id="preview"></main><script>window.ready=(async()=>{await JquanUI.import('carousel');window.review=await JquanUI.import('reviewMode')})();</script></body></html>`);return;
  }
  let rel=decodeURIComponent(url.pathname).slice(1);
  if(snapshot&&['dist/components/carousel.js','dist/components/reviewMode.js','dist/components/JquanUI@components.js','dist/full/JquanUI@full.js'].includes(rel)) rel=path.join('verification/review-mode-carousel-controls-2026-11-11',snapshot,rel);
  const file=path.resolve(root,rel),inside=path.relative(root,file);if(inside.startsWith('..')||path.isAbsolute(inside)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return}
  res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':'text/html;charset=utf-8');fs.createReadStream(file).pipe(res);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browserPath=process.env.JQUAN_BROWSER||['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);assert(browserPath);
 const port=17400+Math.floor(Math.random()*300),browser=spawn(browserPath,['--headless=new','--disable-gpu','--no-sandbox',`--remote-debugging-port=${port}`,`--user-data-dir=${path.join(root,'.tmp','review-carousel-controls-'+Date.now())}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
 let socket,seq=0;const pending=new Map();
 try{
  let pages;for(let i=0;i<100&&!pages;i++){try{pages=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json()}catch{}if(!pages)await delay(100)}assert(pages);
  socket=new WebSocket(pages.find(page=>page.type==='page').webSocketDebuggerUrl);await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject});
  socket.onmessage=event=>{const message=JSON.parse(event.data),item=pending.get(message.id);if(!item)return;clearTimeout(item.timer);pending.delete(message.id);message.error?item.reject(Error(JSON.stringify(message.error))):item.resolve(message.result)};
  const command=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error(method+' timeout'))},20000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params}))});
  const evaluate=async expression=>{const result=await command('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});assert(!result.exceptionDetails,JSON.stringify(result.exceptionDetails));return result.result.value};
  await command('Page.enable');
  for(const entry of Object.keys(entries)){
   await evaluate('window.previousPage=true');await command('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/fixture?entry=${entry}`});
   let ready=false;for(let i=0;i<120&&!ready;i++){ready=await evaluate('!window.previousPage&&typeof ready!=="undefined"');if(!ready)await delay(30)}assert(ready);await evaluate('ready');
   const result=await evaluate(`(()=>{const root=document.getElementById('preview');root.innerHTML='<section id="carousel" data-jq-review-key="carousel"><article jq-carousel-item><span id="kept">第一张</span></article><article jq-carousel-item>第二张</article></section>';const api=JquanUIComponents.carouselApi,h=api.mount('#carousel',{autoplay:false,indicators:true,progress:false});h.goTo(1,false);const before={version:JquanUIComponents.carousel.version,review:JquanUIComponents.reviewMode.version,methods:typeof h.setIndicators==='function'&&typeof h.setProgress==='function',index:h.state().currentIndex,kept:!!document.getElementById('kept'),fields:review.configure({enabled:true,root}).valueOf()};review.open();review.select('#carousel');const options=review.componentOptions().map(item=>item.option);const changed=[review.setComponentOption('carousel','indicators',false),review.setComponentOption('carousel','progress',true)];const after=h.state();const fields=review.changes().map(item=>item.field);const controls={indicator:!!root.querySelector('[jq-carousel-indicators]'),progress:!!root.querySelector('[jq-carousel-progress]')};const preserved={index:after.currentIndex,kept:!!document.getElementById('kept'),sameHandle:h===api.getHandle('#carousel')};const undo=review.undo();const undoState=h.state();review.reset();const resetState=h.state();review.destroy();h.destroy();return {before,options,changed,after:{index:after.currentIndex,indicators:after.indicators,progress:after.progress},fields,controls,preserved,undo,undoState:{indicators:undoState.indicators,progress:undoState.progress},reset:{indicators:resetState.indicators,progress:resetState.progress}}})()`);
   if(old){assert.deepEqual(result,{before:{version:'1.7.0',review:'0.17.0',methods:false,index:1,kept:true,fields:true},options:['autoplay','interval'],changed:[false,false],after:{index:1,indicators:true,progress:false},fields:[],controls:{indicator:true,progress:false},preserved:{index:1,kept:true,sameHandle:true},undo:false,undoState:{indicators:true,progress:false},reset:{indicators:true,progress:false}})}
   else {assert.deepEqual(result,{before:{version:'1.8.0',review:'0.18.1',methods:true,index:1,kept:true,fields:true},options:['autoplay','interval','indicators','progress'],changed:[true,true],after:{index:1,indicators:false,progress:true},fields:['component:carousel.indicators','component:carousel.progress'],controls:{indicator:false,progress:true},preserved:{index:1,kept:true,sameHandle:true},undo:true,undoState:{indicators:false,progress:false},reset:{indicators:true,progress:false}})}
   console.log(`${old?(snapshot==='baseline'?'BASELINE':'ROLLBACK'):'MODIFIED'} ${entry} ${JSON.stringify(result)}`);
  }
 }finally{for(const item of pending.values())clearTimeout(item.timer);socket?.close();browser.kill();await new Promise(resolve=>server.close(resolve))}
 console.log(`${old?(snapshot==='baseline'?'BASELINE':'ROLLBACK'):'MODIFIED'} entries=4; controls=${old?'absent':'indicators/progress'}; preserved=true`);console.log('[JquanUI] review carousel controls ok');
}
main().catch(error=>{console.error(error.stack||error);process.exitCode=1});
