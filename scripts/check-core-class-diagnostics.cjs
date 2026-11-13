'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),fixture=path.join(root,'verification/core-class-diagnostics-2026-11-08');
const arg=name=>process.argv.includes(name)?process.argv[process.argv.indexOf(name)+1]:null;
const snapshot=arg('--snapshot');assert(!snapshot||['baseline','modified','rollback-copy'].includes(snapshot));
const probe=process.argv.includes('--probe'),old=snapshot==='baseline'||snapshot==='rollback-copy',label=old?(snapshot==='baseline'?'BASELINE':'ROLLBACK'):'MODIFIED';
const sourceRoot=snapshot?path.join(fixture,snapshot):root;
const entries={core:'dist/core/JquanUI@Core.js',min:'js/JquanUI@core.min.js',full:'dist/full/JquanUI@full.js'};
function nodeChecks(){
 if(old || probe)return;
 const extractor=require('../dist/cli/jquan-extract.cjs');
 let checks=0;
 for(const entry of ['core','min']){
   const core=path.join(sourceRoot,entries[entry]);
   const config={theme:{extend:{borderRadius:{card:'18px'},fontSize:{headline:['30px','1.2']}}},shortcuts:{card:'rounded-card text-headline p-4'}};
   const runtime=extractor.createRuntime(core,{config});
   const classes=['card','hover:rounded-card','md:text-headline','before:block','bg-red-500/30'];
   const before=JSON.stringify(runtime.api.debug()),report=runtime.api.checkClasses(classes,{timeoutMs:Infinity});
   assert.equal(report.ok,true);checks++;
   const output=extractor.extractFromSource(`<main class="${classes.join(' ')}"></main>`,{core,config});
   for(const item of report.results){assert.equal(item.css,runtime.api.resolve(item.className).css);assert(output.utilityCss.includes(item.css));checks+=2;}
   assert.equal(JSON.stringify(runtime.api.debug()),before);checks++;
 }
 console.log('[JquanUI] class diagnostics extraction parity ok ('+checks+' assertions)');
}
const browserSuite = async function (legacy) {
 let checks=0;
 const eq=(actual,expected,label)=>{checks++;if(JSON.stringify(actual)!==JSON.stringify(expected))throw Error(label+': '+JSON.stringify({actual,expected}))};
 const ok=(value,label)=>{checks++;if(!value)throw Error(label)};
 JquanUI.stop();
 const drain=()=>{for(let i=0;i<1000&&idleCallbacks.length;i++)idleCallbacks.splice(0).forEach(cb=>cb({didTimeout:false,timeRemaining:()=>999}))};
 drain();
 const initial={checkClasses:typeof JquanUI.checkClasses,compilePromise:typeof JquanUI.compile([])?.then==='function'};
 eq(initial,{checkClasses:legacy?'undefined':'function',compilePromise:true},'public baseline');
 await JquanUI.compile(['jquan-ready']);
 const markerNoise=JquanUI.debug().unresolvedClasses.some(item=>item.className==='jquan-ready');
 eq(markerNoise,legacy,'ready marker noise');
 if(legacy)return {checks,initial,markerNoise};
 const snapshot=()=>JSON.stringify({debug:JquanUI.debug(),metrics:JquanUI.getMetrics(),processed:[...JquanUI.getProcessedClasses()],rules:[...JquanUI.getStyleSheet().cssRules].map(r=>r.cssText),storage:Object.entries(localStorage),idles:idleCallbacks.length,nodes:document.querySelectorAll('*').length});
 const before=snapshot();
 const report=JquanUI.checkClasses(new Set(['grid gap-4','hover:(p-2 m-2)','grid','jquan-ready','diagnostic-missing']));
 eq(report.requested,['grid','gap-4','hover:p-2','hover:m-2','jquan-ready','diagnostic-missing'],'normalization');
 eq(report.results.map(item=>item.status),['resolved','resolved','resolved','resolved','ignored','unresolved'],'statuses');
 eq([report.complete,report.ok,report.reason],[true,false,null],'complete vs ok');
 eq(snapshot(),before,'query pure');
 ok(report.results[0].css.includes('display: grid'),'css returned');
 report.results[0].css='mutated';report.results[0].runtime='corrupted';report.requested.push('external');
 eq(JquanUI.checkClasses('grid').results[0].runtime,'unprocessed','detached results');
 eq(snapshot(),before,'detached mutation pure');
 eq(JquanUI.resolve('diagnostic-missing'),null,'direct resolve no hit');
 eq(snapshot(),before,'resolve stays pure');
 const empty=JquanUI.checkClasses([]);
 eq([empty.requested,empty.results,empty.complete,empty.ok,empty.reason],[[],[],true,true,null],'empty report');
 const many=Array.from({length:121},(_,i)=>'diagnostic-unknown-'+i);
 const uncapped=JquanUI.checkClasses(many,{timeoutMs:Infinity});
 eq(uncapped.results.length,121,'uncapped results');ok(uncapped.results.every(item=>item.status==='unresolved'),'uncapped unresolved');
 eq(snapshot(),before,'121 queries no diagnostics pollution');
 const bound=JquanUI.checkClasses(many,{maxClasses:2,timeoutMs:Infinity});
 eq(bound.results.slice(0,3).map(x=>[x.status,x.reason]),[['unresolved',null],['unresolved',null],['skipped','max-classes']],'bounded report');
 eq([bound.complete,bound.ok,bound.reason],[false,false,'max-classes'],'bounded flags');
 eq(JquanUI.checkClasses('grid',{timeoutMs:0}).results[0].reason,'timeout','time zero');
 eq(JquanUI.checkClasses('grid',{maxClasses:0,timeoutMs:0}).results[0].reason,'max-classes','count zero precedence');
 eq(JquanUI.checkClasses('jquan-ready').results[0].status,'ignored','reserved ready');
 eq(JquanUI.resolve('jquan-ready'),null,'marker resolve unchanged');
 const invalid=[];
 for(const value of [-1,1.5,NaN,'1',null,-Infinity]){try{JquanUI.checkClasses('grid',{maxClasses:value})}catch(e){invalid.push(e instanceof RangeError)}}
 for(const value of [-1,NaN,'1',null,-Infinity]){try{JquanUI.checkClasses('grid',{timeoutMs:value})}catch(e){invalid.push(e instanceof RangeError)}}
 eq(invalid.length,11,'invalid option count');ok(invalid.every(Boolean),'invalid option errors');
 let hooks=0,clock=0,resolverCalls=0;
 JquanUI.use({name:'diagnostic-fixture',install(api){api.onScan(()=>hooks++);api.matchUtilities({
   diagthrow:()=>{throw new TypeError('fixture resolver failure')},
   diagnull:()=>{throw null},
   diagstring:()=>{throw 'fixture string failure'},
   diagclock:value=>{resolverCalls++;clock+=Number(value);return {css:'padding',val:value+'px'}}
 })}});
 ok(hooks>0,'real plugin hooks installed');
 const pluginBefore=snapshot(),hooksBefore=hooks;
 const thrown=JquanUI.checkClasses(['diagthrow-now','block'],{timeoutMs:Infinity});
 eq(thrown.results.map(x=>x.status),['error','resolved'],'query isolates resolver errors');
 eq(thrown.results[0].error,{name:'TypeError',message:'fixture resolver failure'},'detached error');
 eq([hooks,snapshot()],[hooksBefore,pluginBefore],'error path pure');
 const nonError=JquanUI.checkClasses(['diagnull-query','diagstring-query'],{timeoutMs:Infinity});
 eq(nonError.results.map(x=>x.error),[{name:'Error',message:'null'},{name:'Error',message:'fixture string failure'}],'non-Error throws isolated');
 eq(snapshot(),pluginBefore,'non-Error query pure');
 Object.defineProperty(performance,'now',{configurable:true,value:()=>clock});
 const timed=JquanUI.checkClasses(['diagclock-1','diagclock-2','diagclock-3'],{timeoutMs:2});
 eq(timed.results.map(x=>x.status),['resolved','resolved','skipped'],'per class budget');
 eq([timed.reason,timed.durationMs,resolverCalls],['timeout',3,2],'soft budget');
 const slow=JquanUI.checkClasses(['diagclock-9'],{timeoutMs:1});
 eq([slow.complete,slow.ok,slow.durationMs],[true,true,9],'single operation indivisible');
 delete performance.now;
 eq([hooks,snapshot()],[hooksBefore,pluginBefore],'budget path pure');
 const queued=Array.from({length:25},(_,i)=>'m-['+(i+10001)+'px]'),promise=JquanUI.compile(queued);
 eq(JquanUI.isReady(),true,'initial ready before dynamic completion');
 const queuedBefore=snapshot(),pending=JquanUI.checkClasses(queued,{timeoutMs:Infinity});
 ok(pending.results.every(x=>x.status==='resolved'&&x.runtime==='pending'),'resolve now vs queued');
 eq(snapshot(),queuedBefore,'query does not flush queue');
 const zero=await JquanUI.flush({maxMs:0});eq([zero.reason,zero.pending.length],['budget',25],'budget skip is pending not failure');
 await JquanUI.flush();eq((await promise).complete,true,'dynamic compile completes');
 ok(JquanUI.checkClasses(queued).results.every(x=>x.runtime==='processed'),'processed runtime');
 const missing='diagnostic-compiled-missing';
 const oldMiss=await JquanUI.compile([missing]);
 eq(oldMiss.unresolved,[missing],'compile unresolved');
 eq(JquanUI.checkClasses(missing).results[0].runtime,'unresolved','runtime unresolved');
 // A new resolver can now resolve a previously attempted miss; historical outcome remains separate.
 JquanUI.addUtility(missing,{css:'display',val:'flex'});
 const nowResolved=JquanUI.checkClasses(missing).results[0];
 eq([nowResolved.status,nowResolved.runtime],['resolved','unresolved'],'new parse vs historical outcome');
 const sheet=JquanUI.getStyleSheet(),insert=sheet.insertRule.bind(sheet);
 sheet.insertRule=(rule,index)=>{if(rule.includes('888888'))throw Error('diagnostic insertion failure');return insert(rule,index)};
 const inserted=await JquanUI.compile(['w-[888888px]']);
 sheet.insertRule=insert;
 eq(inserted.failed,['w-[888888px]'],'compile insertion failure');
 const insertionQuery=JquanUI.checkClasses('w-[888888px]').results[0];
 eq([insertionQuery.status,insertionQuery.runtime],['resolved','insert-error'],'separate insertion history');
 const resolvedError=await JquanUI.compile(['diagthrow-runtime']);
 eq(resolvedError.failed,['diagthrow-runtime'],'compile resolver failure');
 const errorQuery=JquanUI.checkClasses('diagthrow-runtime').results[0];
 eq([errorQuery.status,errorQuery.runtime],['error','resolve-error'],'separate resolver history');
 const nullCompilation=await JquanUI.compile(['diagnull-runtime','diagstring-runtime']);
 eq(nullCompilation.failed,['diagnull-runtime','diagstring-runtime'],'non-Error compile exceptions settle');
 // Frozen inputs and error results remain caller-owned.
 const immutable=Object.freeze(['grid','diagnostic-freeze']);
 JquanUI.checkClasses(immutable,Object.freeze({maxClasses:100,timeoutMs:Infinity}));
 eq(immutable,['grid','diagnostic-freeze'],'frozen input');
 JquanUI.scan();eq(JquanUI.debug().unresolvedClasses.some(x=>x.className===missing),true,'scan preserves old diagnostic');
 return {checks,initial,markerNoise,queryStatuses:['resolved','unresolved','error','ignored','skipped'],budget:{reason:timed.reason,durationMs:timed.durationMs},runtime:[nowResolved.runtime,insertionQuery.runtime,errorQuery.runtime]};
};
async function main(){
 nodeChecks();
 const browserPath=process.env.JQUAN_BROWSER||['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);assert(browserPath);
 const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');if(url.pathname==='/fixture'){const entry=entries[url.searchParams.get('entry')];assert(entry);const mode=url.searchParams.get('mode');res.setHeader('Content-Type','text/html;charset=utf-8');res.end(`<!doctype html><html><head><script>${url.searchParams.has('warm')?'':'localStorage.clear();'}window.idleCallbacks=[];${mode==='fallback'?'window.requestIdleCallback=undefined;':'window.requestIdleCallback=cb=>(idleCallbacks.push(cb),idleCallbacks.length);'}${mode==='sheet'?'window.JQUAN_CONFIG={constructableStylesheets:false};':''}</script><script src="/${entry}"></script></head><body><main id="target"></main></body></html>`);return;}const file=path.resolve(sourceRoot,decodeURIComponent(url.pathname).slice(1));if(!file.startsWith(sourceRoot+path.sep)||!fs.existsSync(file)){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',file.endsWith('.html')?'text/html;charset=utf-8':'text/javascript;charset=utf-8');fs.createReadStream(file).pipe(res);});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const port=15580+Math.floor(Math.random()*300),browser=spawn(browserPath,['--headless=new','--disable-gpu','--no-sandbox',`--remote-debugging-port=${port}`,`--user-data-dir=${path.join(root,'.tmp','class-diagnostics-'+Date.now())}`,'about:blank'],{windowsHide:true,stdio:'ignore'});let socket,seq=0;const pending=new Map(),delay=ms=>new Promise(r=>setTimeout(r,ms));
 try{let pages;for(let i=0;i<100&&!pages;i++){try{pages=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json()}catch{}if(!pages)await delay(100)}assert(pages);socket=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise((r,j)=>{socket.onopen=r;socket.onerror=j});socket.onmessage=e=>{const m=JSON.parse(e.data),p=pending.get(m.id);if(!p)return;clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result)};const command=(method,params={})=>new Promise((r,j)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);j(Error(method+' timeout'))},20000);pending.set(id,{resolve:r,reject:j,timer});socket.send(JSON.stringify({id,method,params}))});const evaluate=async expression=>{const result=await command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});assert(!result.exceptionDetails,JSON.stringify(result.exceptionDetails));return result.result.value};
  for(const entry of Object.keys(entries)){
    await command('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/fixture?entry=${entry}`});
    for(let i=0;i<100;i++){if(await evaluate('location.search.includes("entry='+entry+'")&&document.readyState==="complete"&&!!window.JquanUI'))break;await delay(40)}
    const result=await evaluate('('+browserSuite.toString()+')('+old+')');
    console.log(label+' '+entry+' '+JSON.stringify(result));
    if(!old&&!probe){
      const navigate=async suffix=>{await evaluate('window.previousDiagnosticsDocument=true');await command('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/fixture?entry=${entry}${suffix}`});for(let i=0;i<100;i++){if(await evaluate('!window.previousDiagnosticsDocument&&document.readyState==="complete"&&!!window.JquanUI'))return;await delay(40)}throw Error('navigation timeout')};
      await navigate('&mode=fallback');
      await evaluate(`(async()=>{JquanUI.stop();JquanUI.addUtility('warm-resolver-error',{raw:()=>{throw new Error('warm resolver failure')}});const sheet=JquanUI.getStyleSheet(),insert=sheet.insertRule.bind(sheet);sheet.insertRule=(rule,index)=>{if(rule.includes('999888'))throw Error('warm insertion failure');return insert(rule,index)};await JquanUI.compile(['warm-resolver-error','warm-unresolved','w-[999888px]']);sheet.insertRule=insert;await new Promise(r=>setTimeout(r,1300))})()`);
      await navigate('&warm=1');
      const warm=await evaluate(`(()=>{JquanUI.stop();const before=JSON.stringify(JquanUI.debug()),report=JquanUI.checkClasses(['warm-resolver-error','warm-unresolved','w-[999888px]']);return {hydrate:JquanUI.debug().cache.hydrate,states:report.results.map(x=>x.runtime),statuses:report.results.map(x=>x.status),pure:before===JSON.stringify(JquanUI.debug()),format:JSON.parse(localStorage.getItem(JquanUI.debug().cache.key)).format}})()`);
      assert.deepEqual(warm,{hydrate:'hit',states:['resolve-error','unresolved','insert-error'],statuses:['unresolved','unresolved','resolved'],pure:true,format:5});
      await evaluate(`(()=>{const key=JquanUI.debug().cache.key,data=JSON.parse(localStorage.getItem(key));data.format=4;localStorage.setItem(key,JSON.stringify(data))})()`);
      await navigate('&warm=1');assert.equal(await evaluate('JquanUI.debug().cache.hydrate'),'invalid');
      await navigate('&mode=sheet');
      const noSheet=await evaluate(`(()=>{JquanUI.stop();document.getElementById('jquan-css-runtime').remove();const before=JSON.stringify(JquanUI.debug()),report=JquanUI.checkClasses(['grid','unknown-sheet']);return {sheet:JquanUI.getStyleSheet(),statuses:report.results.map(x=>x.status),unchanged:JSON.stringify(JquanUI.debug())===before}})()`);
      assert.deepEqual(noSheet,{sheet:null,statuses:['resolved','unresolved'],unchanged:true});
      console.log(label+' '+entry+' '+JSON.stringify({warm,oldCache:'invalid',noSheet}));
    }
  }
  if(!old&&!snapshot&&!probe){
    await command('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/examples/core-class-diagnostics.html`});
    for(let i=0;i<100;i++){if(await evaluate('location.pathname.endsWith("core-class-diagnostics.html")&&document.readyState==="complete"&&!!document.getElementById("check")'))break;await delay(40)}
    await evaluate('document.getElementById("check").click()');
    assert.deepEqual(await evaluate('JSON.parse(document.getElementById("report").textContent).results.map(x=>x.status)'),['resolved','resolved','resolved','unresolved','ignored']);
    await evaluate('document.getElementById("classes").value="grid gap-4";document.getElementById("check").click()');
    assert.equal(await evaluate('JSON.parse(document.getElementById("report").textContent).ok'),true);
    for(const width of [1280,390]){
      await command('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
      await evaluate('document.getElementById("render").click()');
      for(let i=0;i<100;i++){if(await evaluate('!document.getElementById("render").disabled&&document.getElementById("preview").dataset.compiled==="true"'))break;await delay(30)}
      const sample=await evaluate(`(()=>{const preview=document.getElementById('preview'),item=preview.firstElementChild;return {count:preview.children.length,hidden:preview.hidden,gap:getComputedStyle(item).gap,expected:item.className.match(/\\[(\\d+)px/)[1]+'px',overflow:document.documentElement.scrollWidth>innerWidth,ready:JquanUI.isReady()}})()`);
      assert.equal(sample.count,41);assert.equal(sample.hidden,false);assert.equal(sample.gap,sample.expected);assert.equal(sample.overflow,false);assert.equal(sample.ready,true);
    }
    fs.writeFileSync(path.join(fixture,'example-390.png'),Buffer.from((await command('Page.captureScreenshot',{format:'png'})).data,'base64'));
    console.log('[JquanUI] class diagnostics example ok (query, 41 dynamic classes, real computed CSS, 1280/390px)');
    const architecture=await evaluate(`(async()=>{const Doc=(await import('/content/architecture.js')).default;const host=document.createElement('div');host.innerHTML=Doc.render();document.body.replaceChildren(host);Doc.mount(host);host.querySelector('#btn-check-classes').click();const report=JSON.parse(host.querySelector('#class-check-output').textContent);Doc.unmount();return {statuses:report.results.map(x=>x.status),cleanup:Doc.cacheMonitor===null&&Doc.diagnosticMonitor===null}})()`);
    assert.deepEqual(architecture,{statuses:['resolved','resolved','resolved','unresolved','ignored'],cleanup:true});
    console.log('[JquanUI] architecture docs interactive query and unmount ok');
  }

 }finally{for(const p of pending.values())clearTimeout(p.timer);socket?.close();browser.kill();server.close()}
}
main().catch(error=>{console.error(error.stack||error.message);process.exitCode=1});
