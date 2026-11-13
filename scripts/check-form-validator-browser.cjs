'use strict';
const fs = require('fs'), path = require('path'), http = require('http'), assert = require('assert/strict');
const { spawn } = require('child_process');
const root = path.resolve(__dirname, '..');
const arg = name => process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : null;
const source = path.resolve(root, arg('--source') || 'dist/components/formValidator.js');
const expected = arg('--expected') || 'after';
const browserPath = process.env.JQUAN_BROWSER || ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const fixture = `<!doctype html><html><body><script src="/core.js"></script><script src="/source.js"></script><script>
JquanUI.use(JquanUIComponents.formValidator);
window.run = async () => {
 const api=JquanUIComponents.formValidatorApi, pause=()=>new Promise(resolve=>setTimeout(resolve,30));
 const make=id=>{const f=document.createElement('form');f.id=id;f.innerHTML='<input name="value" value="new">';document.body.append(f);return f;};
 let native=0, successes=0;
 const first=make('stable');first.submit=()=>native++;
 const a=api.mount(first,{onSuccess(){successes++;return false;}});
 const stable=a===api.get(first)&&a===api.mount(first);
 JquanUI.enhance(first);first.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));await pause();
 const enhanced=successes===1&&native===0;
 const replacement=make('stable'),b=api.mount(replacement,{onSuccess:()=>false});JquanUI.enhance(replacement);first.remove();await pause();
 const isolated=a.destroy()===false&&api.get(first)===null&&api.get(replacement)===b&&b.values().value==='new';
 const asynchronous=make('async');let resolveOld, callback=0, calls=0;
 const c=api.mount(asynchronous,{schema:{value:[{validator:()=>++calls===1?new Promise(resolve=>resolveOld=resolve):true}]},onFieldValidate(){callback++;}});
 const old=c.validateField('value');
 await c.validateField('value');resolveOld('late');await old;
 const latest=!asynchronous.querySelector('input').classList.contains('is-invalid')&&callback===1;
 let resolveReset; c.updateSchema({value:[{validator:()=>new Promise(resolve=>resolveReset=resolve)}]});
 const pendingReset=c.validateField('value');c.reset();resolveReset('late');await pendingReset;
 const reset=Object.keys(c.state().fields).length===0&&!asynchronous.querySelector('input').classList.contains('is-invalid');
 let resolveGone; c.updateSchema({value:[{validator:()=>new Promise(resolve=>resolveGone=resolve)}]});
 const pendingGone=c.validate();const before=callback;c.destroy();resolveGone('late');await pendingGone;
 const destroyed=callback===before&&c.destroy()===false&&c.values()===null;
 b.destroy();replacement.remove();asynchronous.remove();
 return {stable,enhanced,isolated,latest,reset,destroyed};
};</script></body></html>`;
(async()=>{
 const server=http.createServer((req,res)=>{res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',req.url==='/'?'text/html; charset=utf-8':'text/javascript');res.end(req.url==='/'?fixture:fs.readFileSync(req.url==='/core.js'?path.join(root,'dist/core/JquanUI@Core.js'):source));});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const port=12500+Math.floor(Math.random()*300),browser=spawn(browserPath,['--headless=new','--disable-gpu','--no-sandbox',`--remote-debugging-port=${port}`,`--user-data-dir=${path.join(root,'.tmp','form-validator-'+Date.now())}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
 let socket;const pending=new Map();
 try{
  let pages;for(let i=0;i<100&&!pages;i++){try{pages=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();}catch{}if(!pages)await delay(100);}
  assert(pages,'Browser start timed out');socket=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});let id=0;
  socket.onmessage=event=>{const m=JSON.parse(event.data),p=pending.get(m.id);if(!p)return;clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);};
  const command=(method,params={})=>new Promise((resolve,reject)=>{const key=++id,timer=setTimeout(()=>reject(new Error('CDP timeout')),20000);pending.set(key,{resolve,reject,timer});socket.send(JSON.stringify({id:key,method,params}));});
  const evaluate=async expression=>{const r=await command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});assert(!r.exceptionDetails,JSON.stringify(r.exceptionDetails));return r.result.value;};
  await command('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/`});
  for(let i=0;i<100&&!await evaluate('typeof run === "function"');i++)await delay(50);
  const result=await evaluate('run()');
  if(expected==='after')assert(Object.values(result).every(Boolean),JSON.stringify(result));
  else assert.equal(result.isolated,false,JSON.stringify(result));
  console.log('FormValidator='+JSON.stringify(result));
 }finally{for(const p of pending.values())clearTimeout(p.timer);socket?.close();browser.kill();server.close();}
})().catch(error=>{console.error(error.stack||error);process.exitCode=1;});
