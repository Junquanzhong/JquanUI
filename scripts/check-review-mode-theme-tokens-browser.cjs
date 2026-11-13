'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),http=require('node:http');
const {spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),fixture=path.join(root,'verification/review-mode-theme-tokens-2026-11-09');
const arg=k=>process.argv.includes(k)?process.argv[process.argv.indexOf(k)+1]:null;
const snapshot=arg('--snapshot'),probe=process.argv.includes('--probe');
assert(!snapshot||['baseline','modified','rollback-copy'].includes(snapshot));
const old=snapshot==='baseline'||snapshot==='rollback-copy';
const entries={core:'/dist/core/JquanUI@Core.js',min:'/js/JquanUI@core.min.js',full:'/dist/full/JquanUI@full.js',components:'/dist/core/JquanUI@Core.js'};
const config={theme:{fontSize:{reviewbase:'21px',reviewpair:['27px','1.4'],reviewoptions:['29px',{lineHeight:'1.25'}],reviewweight:['31px',{fontWeight:700}],reviewtracking:['32px',{letterSpacing:'.1em'}],reviewinvalid:null,bad_name:'19px'},radius:{reviewalias:'13px'},borderRadius:{reviewbase:'11px'},boxShadow:{reviewbase:'0 2px 7px rgb(20 30 40 / .2)'},fluid:{fontSize:{reviewbase:{min:'16px',preferred:'3vw',max:'28px'}}},extend:{fontSize:{reviewtitle:'35px',reviewpair:['33px','1.3'],reviewoverridden:'22px'},borderRadius:{reviewcard:'19px',DEFAULT:'9px'},radius:{reviewalias:'17px'},boxShadow:{reviewsoft:'0 8px 23px rgb(40 50 60 / .3)',DEFAULT:'0 1px 4px rgb(1 2 3 / .2)'},fluid:{fontSize:{reviewdisplay:{min:'24px',preferred:'4vw',max:'48px',lineHeight:'1.1'}}}}},customUtilities:{'text-reviewoverridden':{css:'color',val:'#abcdef'}}};
config.theme.extend.fontSize.reviewerror='23px';
for(let i=0;i<70;i++)config.theme.fontSize['limit'+String(i).padStart(3,'0')]='20px';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function main(){
 const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/fixture'){
   const entry=url.searchParams.get('entry');assert(entries[entry]);
   res.setHeader('Content-Type','text/html;charset=utf-8');
   res.end(`<!doctype html><html lang="zh-CN"><head><meta name="viewport" content="width=device-width,initial-scale=1"><script>localStorage.clear();window.tokenErrors=[];addEventListener('error',e=>tokenErrors.push(e.message));addEventListener('unhandledrejection',e=>tokenErrors.push(String(e.reason)));window.JQUAN_CONFIG=${JSON.stringify(config)};</script><script src="${entries[entry]}"></script>${entry==='components'?'<script src="/dist/components/JquanUI@components.js"></script>':''}</head><body><main id="preview"><h1 id="title" data-jq-review-key="title" class="text-md md:text-xl font-semibold tracking-wide">客户审查标题</h1><article id="card" data-jq-review-key="card" class="rounded-lg shadow-sm p-4">卡片</article></main><script>JquanUI.addUtility('text-reviewerror',{raw(){throw Error('fixture resolver error')}});window.tokenReady=JquanUI.import('reviewMode').then(api=>window.review=api);</script></body></html>`);return;
  }
  let rel=decodeURIComponent(url.pathname).slice(1);
  if(snapshot){const saved=path.join(fixture,snapshot,rel);if(fs.existsSync(saved))rel=path.relative(root,saved)}
  const file=path.resolve(root,rel);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return}
  res.setHeader('Content-Type',file.endsWith('.js')||file.endsWith('.mjs')?'text/javascript':'text/html;charset=utf-8');fs.createReadStream(file).pipe(res);
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browserPath=process.env.JQUAN_BROWSER||['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);assert(browserPath);
 const port=17200+Math.floor(Math.random()*400),browser=spawn(browserPath,['--headless=new','--disable-gpu','--no-sandbox',`--remote-debugging-port=${port}`,`--user-data-dir=${path.join(root,'.tmp','review-tokens-'+Date.now())}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
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
    const result=await evaluate(`(()=>{const has=(field,token)=>review.utilities().find(x=>x.field===field)?.options.some(x=>x.token===token)||false;const found={version:JquanUIComponents.reviewMode.version,font:has('font-size','text-reviewtitle'),radius:has('border-radius','rounded-reviewcard'),shadow:has('box-shadow','shadow-reviewsoft'),fluid:has('font-size','text-fluid-reviewdisplay')};review.configure({enabled:true,root:'#preview'});review.open();review.select('#title');found.directEdit=review.setUtility('font-size','text-reviewtitle');found.undo=review.undo();review.destroy();return found})()`);
    assert.deepEqual(result,{version:old?'0.13.1':snapshot?'0.14.0':'0.18.1',font:!old,radius:!old,shadow:!old,fluid:!old,directEdit:true,undo:true});
    console.log(`${old?snapshot==='baseline'?'BASELINE':'ROLLBACK':'MODIFIED'} ${entry} ${JSON.stringify(result)}`);
   }else{
    const result=await evaluate(fs.readFileSync(path.join(root,'scripts/review-mode-theme-token-checks.js'),'utf8'));
    console.log('MODIFIED '+entry+' '+JSON.stringify(result));
   }
  }
  if(!probe&&!snapshot){
   await command('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/examples/review-mode-theme-tokens.html`});
   for(let i=0;i<120;i++){if(await evaluate('location.pathname.endsWith("review-mode-theme-tokens.html")&&document.readyState==="complete"&&!!window.JquanUI'))break;await delay(30)}
   assert.equal(await evaluate('!!window.JquanUIComponents?.reviewMode'),false,'Example is on-demand');
   await evaluate('document.getElementById("open-review").click()');
   for(let i=0;i<120;i++){if(await evaluate('!!window.JquanUIComponents?.reviewModeApi?.state().active'))break;await delay(30)}
   for(const width of [1280,390]){
    await command('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    const result=await evaluate(`(async()=>{const api=JquanUIComponents.reviewModeApi;api.select('#project-title');const select=document.querySelector('[data-review-edit="utility:font-size"]');select.value='text-heading';select.dispatchEvent(new Event('change',{bubbles:true}));await JquanUI.compile('text-heading');await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return {font:getComputedStyle(document.getElementById('project-title')).fontSize,options:Array.from(select.options).some(x=>x.value==='text-fluid-display'),overflow:document.documentElement.scrollWidth>innerWidth}})()`);
    assert.deepEqual(result,{font:'34px',options:true,overflow:false});
   }
   fs.writeFileSync(path.join(fixture,'example-390.png'),Buffer.from((await command('Page.captureScreenshot',{format:'png'})).data,'base64'));
   await evaluate('JquanUIComponents.reviewModeApi.destroy()');console.log('[JquanUI] theme token example ok (on-demand, real dropdown, 1280/390px)');
  }
 }finally{for(const p of pending.values())clearTimeout(p.timer);socket?.close();browser.kill();await new Promise(r=>server.close(r))}
 console.log('[JquanUI] review theme tokens ok');
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1});

