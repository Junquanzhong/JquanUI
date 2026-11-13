'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),fixture=path.join(root,'verification/core-compile-completion-2026-11-08');
const arg=name=>process.argv.includes(name)?process.argv[process.argv.indexOf(name)+1]:null;
const snapshot=arg('--snapshot');assert(!snapshot||['baseline','modified','rollback-copy'].includes(snapshot));
const probe=process.argv.includes('--probe'),old=snapshot==='baseline'||snapshot==='rollback-copy',label=old?(snapshot==='baseline'?'BASELINE':'ROLLBACK'):'MODIFIED';
const sourceRoot=snapshot?path.join(fixture,snapshot):root;
const entries={core:'dist/core/JquanUI@Core.js',min:'js/JquanUI@core.min.js',full:'dist/full/JquanUI@full.js'};
async function docsChecks(){
  if(old || snapshot)return;
  const vm=require('node:vm');
  const source=fs.readFileSync(path.join(root,'content/jit-syntax.js'),'utf8').replace(/^import .*;\r?\n/m,'').replace('export default class JitSyntaxDoc','class JitSyntaxDoc')+'\n;globalThis.Doc=JitSyntaxDoc;';
  const timers=[],elements={};let resolveCompile;
  for(const id of ['ctrl-variant-input','preview-variant-btn','compile-status','code-render-target'])elements[id]={value:'p-4',className:'',innerHTML:'',isConnected:true,classList:{add(){},remove(){}},addEventListener(){}};
  const context={initCodeHighlighter(){},window:{JquanUI:{expandSyntax:s=>s,compile:()=>new Promise(r=>resolveCompile=r)}},setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout(){},console};
  vm.createContext(context);vm.runInContext(source,context);
  assert(context.Doc.render().includes('动态编译完成契约'));
  context.Doc.mount({querySelector:selector=>elements[selector.slice(1)]});
  const pendingUpdate=timers.pop()();context.Doc.unmount();
  resolveCompile({cancelled:false});await pendingUpdate;
  assert.equal(elements['preview-variant-btn'].className,'');
  console.log('[JquanUI] compile docs render and async unmount ok');
}
const browserSuite = async function (legacy) {
    let checks = 0;
    const equal = (actual, expected, label) => { checks++; if (JSON.stringify(actual) !== JSON.stringify(expected)) throw Error(label + ': ' + JSON.stringify({actual, expected})); };
    const ok = (value, label) => { checks++; if (!value) throw Error(label); };
    JquanUI.stop();
    const drainOne = () => { const callbacks = idleCallbacks.splice(0); callbacks.forEach(cb => cb({ didTimeout: false, timeRemaining: () => 999 })); };
    const drainAll = () => { for (let i = 0; i < 1000 && idleCallbacks.length; i++) drainOne(); };
    drainAll();
    const classes = (prefix, n, offset = 1) => Array.from({length:n}, (_,i) => prefix + '-[' + (i + offset) + 'px]');
    const firstClasses = classes('p', 25, 1001);
    const firstPromise = JquanUI.compile(firstClasses);
    const initial = { type: typeof firstPromise, promise: !!firstPromise && typeof firstPromise.then === 'function', processed: firstClasses.filter(c => JquanUI.getProcessedClasses().has(c)).length, queue: JquanUI.debug().queueSize, flush: typeof JquanUI.flush };
    equal(initial, {type:legacy?'undefined':'object', promise:!legacy, processed:0, queue:25, flush:legacy?'undefined':'function'}, 'initial compile25');
    drainAll();
    if (legacy) { equal(firstClasses.filter(c => JquanUI.getProcessedClasses().has(c)).length,25,'legacy drain'); return {checks,initial,restored:'legacy scheduling; compile undefined; flush absent'}; }
    const first = await firstPromise;
    equal([first.complete,first.processed.length,first.pending.length,first.unresolved.length,first.failed.length,first.cancelled,first.reason],[true,25,0,0,0,false,null],'first result');
    const thresholds = [];
    for (const n of [20,21,40,41,1000]) {
        const list = classes('m',n,n*100);
        const promise = JquanUI.compile(list);
        const now = list.filter(c=>JquanUI.getProcessedClasses().has(c)).length;
        equal(now,n===20?20:0,'threshold immediate '+n);
        drainOne();
        const afterOne = list.filter(c=>JquanUI.getProcessedClasses().has(c)).length;
        equal(afterOne,Math.min(n,40),'chunk '+n);
        drainAll();
        const result = await promise;
        equal(result.processed,list,'ordered processed '+n);
        equal(result.complete,true,'completed '+n);
        thresholds.push({n,now,afterOne});
    }
    // Own-batch settlement while unrelated queued work remains, overlapping requests, duplicate input.
    const a=classes('left',41,1001), b=classes('right',41,1001);
    const pa=JquanUI.compile(a); const pb=JquanUI.compile(b);
    const overlap=JquanUI.compile([a[0],a[0],b[0]]);
    drainOne(); drainOne();
    const ar=await pa;
    equal([ar.complete,ar.remaining],[true,2],'own batch excludes future queue');
    const overlapResult=await overlap;
    equal(overlapResult.requested,[a[0],b[0]],'dedupe overlap');
    drainAll(); equal((await pb).complete,true,'later batch');
    const unknown=Array.from({length:101},(_,i)=>'contract-missing-'+i);
    const pu=JquanUI.compile(unknown); drainAll();
    equal((await pu).unresolved,unknown,'uncapped unresolved');
    const sheet=JquanUI.getStyleSheet();
    const originalInsert=sheet.insertRule.bind(sheet);
    sheet.insertRule=(rule,index)=>{if(rule.includes('888888'))throw Error('fixture CSSOM failure');return originalInsert(rule,index)};
    const failed=await JquanUI.compile(['w-[888888px]']);
    equal([failed.complete,failed.processed,failed.failed],[true,['w-[888888px]'],['w-[888888px]']],'insertion failure');
    sheet.insertRule=originalInsert;
    const pendingClasses=classes('bottom',50,2001);
    const pendingPromise=JquanUI.compile(pendingClasses);
    const before=JquanUI.debug().processedClassCount;
    const zero=await JquanUI.flush({maxMs:0});
    equal([zero.reason,zero.complete,zero.pending.length,JquanUI.debug().processedClassCount],[ 'budget',false,50,before ],'zero budget');
    let clock=0;
    Object.defineProperty(performance,'now',{configurable:true,value:()=>clock});
    sheet.insertRule=(rule,index)=>{const value=originalInsert(rule,index);clock+=1;return value};
    const budget=await JquanUI.flush({maxMs:2});
    equal([budget.processed.length,budget.pending.length,budget.reason,budget.durationMs],[2,48,'budget',2],'per class budget');
    sheet.insertRule=originalInsert; delete performance.now;
    const all=JquanUI.flush();
    equal(JquanUI.debug().queueSize,0,'flush works before Promise resolution');
    equal((await all).complete,true,'flush full');
    equal((await pendingPromise).complete,true,'original waiter after flush');
    drainAll(); equal(JquanUI.debug().queueSize,0,'stale idle harmless');
    const invalid=[];
    for(const value of [-1,NaN,'8',-Infinity]){try{JquanUI.flush({maxMs:value})}catch(e){invalid.push(e instanceof RangeError)}}
    equal(invalid,[true,true,true,true],'invalid budgets');
    const normalized=await JquanUI.compile(new Set(['hover:(p-2 m-2)','hover:p-2']),{sync:true});
    equal(normalized.requested,['hover:p-2','hover:m-2'],'string set variant group');
    equal((await JquanUI.compile('focus:(p-3 m-3)',{sync:true})).requested,['focus:p-3','focus:m-3'],'string group');
    // prefetch settles an outstanding compile waiter.
    const warmed=classes('h',25,6001), pw=JquanUI.compile(warmed);
    JquanUI.prefetch(warmed,{maxClasses:100,maxBytes:100000,timeoutMs:10000});
    equal((await pw).complete,true,'prefetch waiter');
    drainAll();
    // Flush neither scans DOM nor invokes plugin scan hooks.
    let hooks=0;
    JquanUI.use({name:'compile-contract-test',install(api){api.onScan(()=>hooks++)}});
    ok(JquanUI.hasPlugin('compile-contract-test') && hooks > 0,'real scan hook installed');
    const scans=JquanUI.debug().scans; const previousHooks=hooks;
    const pe=JquanUI.compile(classes('max-w',25,7001));
    await JquanUI.flush();
    equal([hooks,JquanUI.debug().scans],[previousHooks,scans],'flush no scan hooks');
    await pe;
    let busyPromise;
    JquanUI.use({name:'compile-contract-reentrant',install(api){api.matchUtilities({contractreentrant:()=>{busyPromise=JquanUI.flush();return {css:'display',val:'block'}},contractthrow:()=>{throw Error('resolver fixture')}})}});
    const reentrant=JquanUI.compile(['contractreentrant-one','contractthrow-one',...classes('z',23,1)],{sync:true});
    equal((await busyPromise).reason,'busy','reentrant flush is truthful');
    equal((await reentrant).failed,['contractthrow-one'],'resolver exception settles');
    const pe2=JquanUI.compile(classes('min-w',25,7001)); JquanUI.enhance(document.createElement('div'));
    equal((await pe2).complete,true,'empty enhance drains shared queue');
    // No sheet gives a truthful partial result and leaves work available for retry.
    const cancellationClasses=classes('top',25,9001), pc=JquanUI.compile(cancellationClasses);
    JquanUI.destroy(); const cancelled=await pc;
    equal([cancelled.cancelled,cancelled.reason,cancelled.pending.length,JquanUI.debug().queueSize],[true,'destroyed',25,0],'destroy settles');
    drainAll();
    equal(cancellationClasses.some(c=>JquanUI.getProcessedClasses().has(c)),false,'stale callback after destroy');
    const lateClasses=classes('inset',25,11001), pl=JquanUI.compile(lateClasses);
    window.JQUAN_CONFIG={theme:{extend:{colors:{completionlate:'#123456'}}}};
    const late=await pl;
    equal([late.cancelled,late.reason],[true,'config-changed'],'late config settles');
    drainAll();
    ok(JquanUI.resolve('bg-completionlate'),'late config works '+JSON.stringify({config:window.JQUAN_CONFIG,colors:JquanUI.runtimeConfig().colors.completionlate,warnings:JquanUI.debug().configWarnings}));
    return {checks,initial,thresholds,unresolved:unknown.length,budget:{processed:budget.processed.length,pending:budget.pending.length},cancelled:cancelled.reason,late:late.reason};
};
async function main(){
 await docsChecks();
 const browserPath=process.env.JQUAN_BROWSER||['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);assert(browserPath);
 const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');if(url.pathname==='/fixture'){const entry=entries[url.searchParams.get('entry')];assert(entry);const mode=url.searchParams.get('mode');res.setHeader('Content-Type','text/html;charset=utf-8');res.end(`<!doctype html><html><head><script>${url.searchParams.has('warm')?'':'localStorage.clear();'}window.idleCallbacks=[];${mode==='fallback'?'window.requestIdleCallback=undefined;':'window.requestIdleCallback=cb=>(idleCallbacks.push(cb),idleCallbacks.length);'}${mode==='sheet'?'window.JQUAN_CONFIG={constructableStylesheets:false};':''}</script><script src="/${entry}"></script></head><body><main id="target"></main></body></html>`);return;}const file=path.resolve(sourceRoot,decodeURIComponent(url.pathname).slice(1));if(!file.startsWith(sourceRoot+path.sep)||!fs.existsSync(file)){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',file.endsWith('.html')?'text/html;charset=utf-8':'text/javascript;charset=utf-8');fs.createReadStream(file).pipe(res);});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const port=15580+Math.floor(Math.random()*300),browser=spawn(browserPath,['--headless=new','--disable-gpu','--no-sandbox',`--remote-debugging-port=${port}`,`--user-data-dir=${path.join(root,'.tmp','compile-contract-'+Date.now())}`,'about:blank'],{windowsHide:true,stdio:'ignore'});let socket,seq=0;const pending=new Map(),delay=ms=>new Promise(r=>setTimeout(r,ms));
 try{let pages;for(let i=0;i<100&&!pages;i++){try{pages=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json()}catch{}if(!pages)await delay(100)}assert(pages);socket=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise((r,j)=>{socket.onopen=r;socket.onerror=j});socket.onmessage=e=>{const m=JSON.parse(e.data),p=pending.get(m.id);if(!p)return;clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result)};const command=(method,params={})=>new Promise((r,j)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);j(Error(method+' timeout'))},20000);pending.set(id,{resolve:r,reject:j,timer});socket.send(JSON.stringify({id,method,params}))});const evaluate=async expression=>{const result=await command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});assert(!result.exceptionDetails,JSON.stringify(result.exceptionDetails));return result.result.value};
  for(const entry of Object.keys(entries)){
    await command('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/fixture?entry=${entry}`});
    for(let i=0;i<100;i++){if(await evaluate('location.search.includes("entry='+entry+'")&&document.readyState==="complete"&&!!window.JquanUI'))break;await delay(40)}
    const result=await evaluate('('+browserSuite.toString()+')('+old+')');
    console.log(label+' '+entry+' '+JSON.stringify(result));
    if(!old){
      const navigate=async suffix=>{await evaluate('window.previousCompletionDocument=true');await command('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/fixture?entry=${entry}${suffix}`});for(let i=0;i<100;i++){if(await evaluate('!window.previousCompletionDocument&&document.readyState==="complete"&&!!window.JquanUI'))return;await delay(40)}throw Error('navigation timeout')};
      await navigate('&mode=fallback');
      const fallback=await evaluate(`(async()=>{JquanUI.stop();const classes=Array.from({length:81},(_,i)=>'p-['+(i+20000)+'px]');const result=await JquanUI.compile(classes);return {complete:result.complete,processed:result.processed.length,remaining:result.remaining}})()`);
      assert.deepEqual(fallback,{complete:true,processed:81,remaining:0});
      await evaluate(`(async()=>{await JquanUI.compile(['warm-missing','w-[777777px]']);const sheet=JquanUI.getStyleSheet(),insert=sheet.insertRule.bind(sheet);sheet.insertRule=(rule,index)=>{if(rule.includes('666666'))throw Error('warm failure');return insert(rule,index)};await JquanUI.compile(['w-[666666px]']);sheet.insertRule=insert;await new Promise(r=>setTimeout(r,1300))})()`);
      await navigate('&warm=1');
      const warm=await evaluate(`(async()=>{JquanUI.stop();const result=await JquanUI.compile(['warm-missing','w-[666666px]','w-[777777px]']);return {hydrate:JquanUI.debug().cache.hydrate,unresolved:result.unresolved,failed:result.failed,complete:result.complete}})()`);
      assert.deepEqual(warm,{hydrate:'hit',unresolved:['warm-missing'],failed:['w-[666666px]'],complete:true});
      await evaluate(`(()=>{const key=JquanUI.debug().cache.key,data=JSON.parse(localStorage.getItem(key));data.format=4;localStorage.setItem(key,JSON.stringify(data))})()`);
      await navigate('&warm=1');assert.equal(await evaluate('JquanUI.debug().cache.hydrate'),'invalid');
      await navigate('&mode=sheet');
      const noSheet=await evaluate(`(async()=>{JquanUI.stop();const el=document.getElementById('jquan-css-runtime');el.remove();const classes=Array.from({length:25},(_,i)=>'p-['+(i+30000)+'px]');const promise=JquanUI.compile(classes);idleCallbacks.splice(0).forEach(cb=>cb({timeRemaining:()=>999}));const result=await promise,partial=await JquanUI.flush();document.head.appendChild(el);const retry=await JquanUI.flush();return {reason:result.reason,pending:result.pending.length,flush:partial.reason,retry:retry.complete,queue:JquanUI.debug().queueSize}})()`);
      assert.deepEqual(noSheet,{reason:'stylesheet-unavailable',pending:25,flush:'stylesheet-unavailable',retry:true,queue:0});
      console.log(label+' '+entry+' '+JSON.stringify({fallback,warm,oldCache:'invalid',noSheet}));
    }
  }
  if(!old&&!snapshot){
    await command('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});
    await command('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/examples/core-compile-completion.html`});
    for(let i=0;i<100;i++){if(await evaluate('location.pathname.endsWith("/core-compile-completion.html")&&document.readyState==="complete"&&!!document.getElementById("compile-button")'))break;await delay(40)}
    for(const button of ['compile-button','flush-button']){
      await evaluate(`document.getElementById(${JSON.stringify(button)}).click()`);
      for(let i=0;i<100;i++){if(await evaluate('!document.getElementById("compile-button").disabled'))break;await delay(30)}
      const example=await evaluate(`(()=>{const data=JSON.parse(document.getElementById('result').textContent),card=document.querySelector('#output article');return {count:data.completion.processed.length,complete:data.completion.complete,padding:getComputedStyle(card).padding,expected:card.className.match(/\\[(\\d+)px/)[1]+'px',partial:data.partial?.reason||null,overflow:document.documentElement.scrollWidth>innerWidth}})()`);
      assert.equal(example.count,41);assert.equal(example.complete,true);assert.equal(example.padding,example.expected);assert.equal(example.partial,button==='flush-button'?'budget':null);assert.equal(example.overflow,false);
    }
    fs.writeFileSync(path.join(fixture,'example-390.png'),Buffer.from((await command('Page.captureScreenshot',{format:'png'})).data,'base64'));
    console.log('[JquanUI] compile example ok (390px, both actions, actual computed CSS, no overflow)');
  }
 }finally{for(const p of pending.values())clearTimeout(p.timer);socket?.close();browser.kill();server.close()}
}
main().catch(error=>{console.error(error.stack||error.message);process.exitCode=1});
