'use strict';
const assert = require('assert/strict');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');
const { pathToFileURL } = require('url');
const project = path.resolve(__dirname,'..');
const repository = path.resolve(project,'../..');
const output = path.join(project,'verification');
const browserPath = process.env.JQUAN_BROWSER || ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(file=>fs.existsSync(file));
const delay = ms=>new Promise(resolve=>setTimeout(resolve,ms));
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.webp':'image/webp', '.woff2':'font/woff2', '.woff':'font/woff' };
async function main() {
  assert(browserPath,'Set JQUAN_BROWSER to Chromium');
  fs.mkdirSync(output,{recursive:true});
  const server = http.createServer((request,response)=>{
    const url = new URL(request.url,'http://localhost');
    const file = path.resolve(repository,'.'+decodeURIComponent(url.pathname));
    const relative = path.relative(repository,file);
    if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); response.end(); return; }
    response.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
    fs.createReadStream(file).pipe(response);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const debugPort = 12000+Math.floor(Math.random()*1000);
  const profile = path.join(repository,'.tmp',`edge-prismara-${Date.now()}`);
  const browser = spawn(browserPath,['--headless=new','--no-sandbox',`--remote-debugging-port=${debugPort}`,`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
  let socket;
  const pending = new Map();
  let sequence = 0;
  const errors = [];
  const results = [];
  const command = (method,params={},sessionId)=>new Promise((resolve,reject)=>{
    const id=++sequence;
    const timer=setTimeout(()=>{pending.delete(id);reject(new Error(`CDP timeout ${method}`));},15000);
    pending.set(id,{resolve,reject,timer}); socket.send(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})}));
  });
  const evaluate = async(expression)=>{
    const result=await command('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
    assert(!result.exceptionDetails,JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const waitFor = async(expression,label)=>{
    for(let attempt=0;attempt<100;attempt++){if(await evaluate(expression))return;await delay(100);}
    throw new Error(`Timeout: ${label}; ${JSON.stringify(await evaluate(`({url:location.href,preference:window.PrismaraTheme?.getPreference(),resolved:window.PrismaraTheme?.getResolved(),root:document.documentElement.className,system:matchMedia('(prefers-color-scheme: dark)').matches})`))}`);
  };
  const visit = async(name)=>{
    const url=`http://127.0.0.1:${server.address().port}/projects/prismara-atlas/pages/${name}`;
    await command('Page.navigate',{url});
    await waitFor(`location.href === ${JSON.stringify(url)} && document.readyState === 'complete' && !!window.JquanUI`,'page ready');
    await delay(300);
  };
  const capture=async(name)=>{
    const shot=await command('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    fs.writeFileSync(path.join(output,name),Buffer.from(shot.data,'base64'));
  };
  try {
    let pages;
    for(let i=0;i<100&&!pages;i++){try{const response=await fetch(`http://127.0.0.1:${debugPort}/json/list`);if(response.ok)pages=await response.json();}catch{}if(!pages)await delay(100);}
    assert(pages,'Chromium launch timeout');
    socket=new WebSocket(pages.find(page=>page.type==='page').webSocketDebuggerUrl);
    await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
    socket.onmessage=(event)=>{
      const message=JSON.parse(event.data);
      if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails.text+': '+(message.params.exceptionDetails.exception?.description||''));
      const item=pending.get(message.id);if(!item)return;clearTimeout(item.timer);pending.delete(message.id);
      if(message.error)item.reject(new Error(JSON.stringify(message.error)));else item.resolve(message.result);
    };
    await command('Runtime.enable'); await command('Page.enable');
    await command('Emulation.setFocusEmulationEnabled',{enabled:true});
    await command('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
    const names=fs.readdirSync(path.join(project,'pages')).filter(name=>name.endsWith('.html'));
    await visit('index.html');
    for (const theme of ['light','dark']) {
    await evaluate(`PrismaraTheme.setPreference('${theme}')`);
    for(const width of (process.argv.includes('--interactions-only') ? [] : [1280,768,390])) {
      await command('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
      for(const name of names) {
        await visit(name);
        const state=await evaluate(`({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,h1:document.querySelectorAll('h1').length,brokenImages:[...document.images].filter(image=>image.complete&&!image.naturalWidth).map(image=>image.src),title:document.title,bodyWidth:document.body.getBoundingClientRect().width})`);
        assert(state.scrollWidth<=width+1,`${name} at ${width}: horizontal overflow ${state.scrollWidth}`);
        assert.equal(state.h1,1,`${name}: h1 count`);
        assert.equal(state.brokenImages.length,0,`${name}: broken images`);
        assert.equal(await evaluate(`PrismaraTheme.getResolved()`),theme);
        assert.equal(await evaluate(`getComputedStyle(document.body).backgroundColor`),theme==='dark'?'rgb(11, 19, 22)':'rgb(255, 255, 255)');
        assert(await evaluate(`[...document.querySelectorAll('img[src*="covers/"]')].filter(image=>getComputedStyle(image).display!=='none').every(image=>image.src.includes('/dark/')===${theme==='dark'})`),'matching cover palette');
        const contrast=await evaluate(`(()=>{const rgb=value=>value.match(/[\\d.]+/g).slice(0,3).map(Number);const lum=value=>rgb(value).map(n=>{n/=255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4}).reduce((sum,n,index)=>sum+n*[.2126,.7152,.0722][index],0);const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};const body=getComputedStyle(document.body),sample=document.querySelector('.pr-body'),button=document.querySelector('.pr-primary');return {body:ratio(body.color,body.backgroundColor),muted:sample?ratio(getComputedStyle(sample).color,body.backgroundColor):10,button:ratio(getComputedStyle(button).color,getComputedStyle(button).backgroundColor)}})()`);
        assert(Object.values(contrast).every(value=>value>=4.5),`${name} ${theme}: text contrast ${JSON.stringify(contrast)}`);
        results.push({page:name,width,theme,overflow:false,brokenImages:0});
        if(name==='index.html') {
          assert(await evaluate(`(()=>{const hero=document.querySelector('[data-hero]'),canvas=hero.querySelector('canvas'),shell=hero.querySelector('.pr-shell');return getComputedStyle(canvas).position==='absolute'&&parseFloat(getComputedStyle(shell).paddingBottom)<=56&&PrismaraMotion.layout(canvas.clientWidth,canvas.clientHeight).near<=canvas.clientHeight*.85})()`),'pet overlays carousel without a separate layout strip');
          await evaluate(`JquanUIComponents.carouselApi.setAutoplay('#hero-carousel',false)`);
          for(let index=0;index<4;index++) {
            await evaluate(`JquanUIComponents.carouselApi.goTo('#hero-carousel',${index},false)`);
            const clipped=await evaluate(`(()=>{const root=document.querySelector('#hero-carousel').getBoundingClientRect();const article=document.querySelector('[jq-carousel-slide][aria-hidden="false"] article');return [...article.children].map(node=>node.getBoundingClientRect()).some(rect=>rect.top<root.top-1||rect.bottom>root.bottom+1)})()`);
            assert(!clipped,`home slide ${index+1} clips content at ${width}px`);
          }
          await evaluate(`JquanUIComponents.carouselApi.goTo('#hero-carousel',0,false)`);
        }
        if(['index.html','library.html','apps.html','column.html','article.html','about.html','archives.html','tags.html','404.html','work.html','showcase.html'].includes(name)) await capture(`${name.replace('.html','')}${theme==='dark'?'-dark':''}-${width}.png`);
      }
    }
    }
    await evaluate(`PrismaraTheme.setPreference('light')`);
    await command('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
    await visit('index.html');
    await waitFor(`!!JquanUIComponents.carouselApi.getState('#hero-carousel')`,'carousel mounted');
    assert.equal(await evaluate(`JquanUIComponents.carouselApi.getState('#hero-carousel').total`),4);
    assert.equal(await evaluate(`document.querySelectorAll('[data-carousel-pause], [data-carousel-prev], [data-carousel-next]').length`),0);
    assert(await evaluate(`[...document.querySelectorAll('[data-carousel-page]')].every(button=>{const style=getComputedStyle(button);return !button.textContent.trim() && !!button.querySelector('i') && style.width===style.height && parseFloat(style.borderRadius)>=parseFloat(style.width)/2})`),'round icon selectors');
    assert(await evaluate(`getComputedStyle(document.querySelector('[data-hero]')).borderBottomWidth==='0px'`),'hero divider removed');
    await evaluate(`document.querySelector('[data-carousel-page="2"]').focus()`);
    assert.equal(await evaluate(`JquanUIComponents.carouselApi.getState('#hero-carousel').isPlaying`),false);
    await evaluate(`document.querySelector('[data-carousel-page="2"]').click()`); await delay(600);
    assert.equal(await evaluate(`Number(document.querySelector('[data-carousel-page][aria-pressed="true"]').dataset.carouselPage)`),2);
    assert((await evaluate(`document.querySelector('[jq-carousel-slide][aria-hidden="false"] h2').textContent`)).includes('FILTER'));
    assert((await evaluate(`document.querySelector('[jq-carousel-slide][aria-hidden="false"] a.pr-primary').getAttribute('href')`)).includes('pagination'));
    assert(await evaluate(`[...document.querySelectorAll('[jq-carousel-slide][aria-hidden="true"]')].every(slide=>slide.inert)`));
    await evaluate(`JquanUIComponents.carouselApi.next('#hero-carousel')`); await delay(600);
    assert.equal(await evaluate(`Number(document.querySelector('[data-carousel-page][aria-pressed="true"]').dataset.carouselPage)`),3);
    await evaluate(`JquanUIComponents.carouselApi.next('#hero-carousel')`); await delay(600);
    assert.equal(await evaluate(`Number(document.querySelector('[data-carousel-page][aria-pressed="true"]').dataset.carouselPage)`),0);
    await evaluate(`JquanUIComponents.carouselApi.prev('#hero-carousel')`); await delay(600);
    assert.equal(await evaluate(`Number(document.querySelector('[data-carousel-page][aria-pressed="true"]').dataset.carouselPage)`),3);
    await evaluate(`document.querySelector('header a').focus()`);
    await delay(6800);
    assert.equal(await evaluate(`Number(document.querySelector('[data-carousel-page][aria-pressed="true"]').dataset.carouselPage)`),0,'built-in autoplay must wrap');
    await evaluate(`document.querySelector('[jq-carousel-slide][aria-hidden="false"] a').focus()`);
    assert.equal(await evaluate(`JquanUIComponents.carouselApi.getState('#hero-carousel').isPlaying`),false,'focus pauses autoplay');
    await evaluate(`document.querySelector('[data-carousel-page="0"]').focus()`);
    assert.equal(await evaluate(`JquanUIComponents.carouselApi.getState('#hero-carousel').isPlaying`),false,'selector focus pauses autoplay');
    await evaluate(`document.querySelector('header a').focus()`);
    assert.equal(await evaluate(`JquanUIComponents.carouselApi.getState('#hero-carousel').isPlaying`),true,'leaving carousel restores autoplay');
    assert.equal(await evaluate(`document.querySelector('[data-pet="dog"]').dataset.particleCount`),'64');
    const beforeApproach=await evaluate(`document.querySelector('[data-pet="dog"]').dataset.petPosition.split(',').map(Number)`);
    await command('Input.dispatchMouseEvent',{type:'mouseMoved',x:beforeApproach[0]>640?220:1060,y:200});
    await waitFor(`document.querySelector('[data-pet="dog"]').dataset.petState==='noticing'`,'puppy stops and looks before running');
    await waitFor(`document.querySelector('[data-pet="dog"]').dataset.petState==='approaching'`,'puppy notices hero cursor');
    await waitFor(`(()=>{const p=document.querySelector('[data-pet="dog"]').dataset.petPosition.split(',').map(Number);return Math.hypot(p[0]-${beforeApproach[0]},p[1]-${beforeApproach[1]})>10})()`,'puppy moves at least ten pixels toward the distant cursor');
    const afterApproach=await evaluate(`document.querySelector('[data-pet="dog"]').dataset.petPosition.split(',').map(Number)`);
    assert(Math.hypot(afterApproach[0]-beforeApproach[0],afterApproach[1]-beforeApproach[1])>10,'puppy gradually moves toward cursor');
    await waitFor(`document.querySelector('[data-pet="dog"]').dataset.petState==='cute'`,'puppy settles and greets');
    assert(await evaluate(`(()=>{const pet=document.querySelector('[data-pet="dog"]');return Number(pet.dataset.petGround)===Number(pet.dataset.petPosition.split(',')[1])})()`),'greeting stays on its ground plane');
    await capture('pet-greeting-light.png');
    await evaluate(`PrismaraTheme.setPreference('dark')`);
    await capture('pet-greeting-dark.png');
    await evaluate(`PrismaraTheme.setPreference('light')`);
    await command('Input.dispatchMouseEvent',{type:'mouseMoved',x:20,y:20});
    await waitFor(`document.querySelector('[data-pet="dog"]').dataset.petState==='playing'`,'puppy returns to play outside hero');
    await delay(500);
    assert.equal(await evaluate(`document.querySelector('[data-pet="dog"]').dataset.petState`),'playing','puppy chooses its own play or rest without a pointer');
    await command('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
    await command('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:500,y:170}]});
    await command('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await delay(200);
    assert.equal(await evaluate(`document.querySelector('[data-pet="dog"]').dataset.petState`),'playing','touch does not leave a sticky cursor target');
    await command('Emulation.setTouchEmulationEnabled',{enabled:false});
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('[data-pet="dog"]')).pointerEvents`),'none','pet never captures links or carousel drag');
    // Fast-forward independent real model instances, then render their actual poses.
    // This captures long autonomous sequences without changing the live pet or waiting minutes.
    await evaluate(`document.querySelector('[data-motion-toggle]').click()`);
    await evaluate(`JquanUIComponents.carouselApi.setAutoplay('#hero-carousel',false);JquanUIComponents.carouselApi.goTo('#hero-carousel',0,false)`);
    await delay(600);
    for(const width of [1280,390]) {
      await command('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
      await delay(150);
      const evidence=await evaluate(`(()=>{
        const canvas=document.querySelector('[data-pet="dog"]'),rect=canvas.getBoundingClientRect(),samples={};let hits=0;
        for(const activity of PrismaraMotion.activities) {
        const pet=PrismaraMotion.createPet({seed:42});pet.activity=PrismaraMotion.activities.indexOf(activity);pet.activityDuration=activity==='balloon'?16:8;pet.clock=0;
        for(let frame=0;frame<900;frame++) {
          const pose=PrismaraMotion.stepPet(pet,rect.width,rect.height,frame/30,1/30,null);
          const ready=pose.action==='rest'?pose.lie>.95:pose.action==='dig'?pose.dig>.95:pose.action==='pee'?pose.lift>.95:pose.action==='balloon'?pose.jump>10&&pose.rear>.4:pose.action==='sniff'?pose.sniff>.9:pose.action==='stretch'?pose.stretch>.8:pose.action==='shake'?pose.shake>.8:pose.stride>.5;
          if(ready&&!samples[pose.action])samples[pose.action]=pose;
        }
        hits+=pet.headHits;
        }
        window.prismaraPetSamples=samples;
        return {actions:Object.keys(samples),hits};
      })()`);
      for(const action of ['walk','rest','dig','chase','pee','balloon','sniff','stretch','shake'])assert(evidence.actions.includes(action),`real model produces ${action}`);
      assert(evidence.hits>=2,'balloon records actual head contacts');
      const lifecycle=await evaluate(`(()=>{const pet=PrismaraMotion.createPet({seed:42}),seen={butterfly:[],balloon:[]};for(let frame=0;frame<18000;frame++){const pose=PrismaraMotion.stepPet(pet,innerWidth,innerHeight,frame/30,1/30,null);if(pose.toy&&seen[pose.toy.type]&&!seen[pose.toy.type].some(item=>item.id===pose.toy.id&&item.stage===pose.toy.stage))seen[pose.toy.type].push({id:pose.toy.id,stage:pose.toy.stage,x:pose.toy.x,y:pose.toy.y});}return seen})()`);
      assert(lifecycle.butterfly.some(item=>item.stage==='entering')&&lifecycle.butterfly.some(item=>item.stage==='exiting'),'butterfly has entry and exit stages');
      assert(lifecycle.balloon.some(item=>item.stage==='entering')&&lifecycle.balloon.some(item=>item.stage==='exiting'),'balloon has entry and exit stages');
      for(const theme of ['light','dark']) {
        for(const action of ['walk','rest','dig','chase','pee','balloon','sniff','stretch','shake']) {
          await evaluate(`(()=>{
            PrismaraTheme.setPreference('${theme}');
            const canvas=document.querySelector('[data-pet="dog"]'),rect=canvas.getBoundingClientRect(),ctx=canvas.getContext('2d'),colors=getComputedStyle(document.documentElement);
            const read=name=>colors.getPropertyValue('--color-'+name+'-css').trim();
            ctx.clearRect(0,0,rect.width,rect.height);
            PrismaraPetRenderer.draw(ctx,prismaraPetSamples['${action}'],{fur:read('pet-fur'),tail:read('pet-tail'),detail:read('action-ink'),toy:read('pet-toy'),earth:read('pet-earth')});
          })()`);
          const petBox=await evaluate(`(()=>{const canvas=document.querySelector('[data-pet="dog"]'),rect=canvas.getBoundingClientRect(),p=prismaraPetSamples['${action}'];window.scrollTo(0,Math.max(0,scrollY+rect.top+p.y-640));return {x:p.x,y:p.y}})()`);
          assert(petBox.x>0&&petBox.y>0);
          await capture(`pet-${action}-${theme}-${width}.png`);
        }
      }
      await evaluate(`window.scrollTo(0,0)`);
    }
    await command('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
    await evaluate(`PrismaraTheme.setPreference('light');document.querySelector('[data-motion-toggle]').click()`);
    await evaluate(`window.scrollTo(0,document.body.scrollHeight)`);await delay(200);
    assert.equal(await evaluate(`document.querySelector('[data-pet="dog"]').dataset.motionState`),'paused','offscreen canvas should stop');
    await evaluate(`window.scrollTo(0,0)`);await delay(200);
    await evaluate(`document.querySelector('[data-motion-toggle]').click()`); await delay(100);
    assert.equal(await evaluate(`document.querySelector('[data-pet="dog"]').dataset.motionState`),'paused');
    const frozen=await evaluate(`document.querySelector('canvas').toDataURL()`);await delay(250);
    assert.equal(await evaluate(`document.querySelector('canvas').toDataURL()`),frozen,'paused field must not redraw');
    await command('Input.dispatchMouseEvent',{type:'mouseMoved',x:250,y:200});await delay(200);
    assert.equal(await evaluate(`document.querySelector('canvas').toDataURL()`),frozen,'paused pet ignores cursor');
    await evaluate(`document.querySelector('[data-motion-toggle]').click()`);await delay(250);
    assert.notEqual(await evaluate(`document.querySelector('canvas').toDataURL()`),frozen,'puppy should animate');
    await command('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await delay(400);
    assert.equal(await evaluate(`document.querySelector('[data-pet="dog"]').dataset.motionState`),'paused');
    const reducedPet=await evaluate(`document.querySelector('canvas').toDataURL()`);
    await command('Input.dispatchMouseEvent',{type:'mouseMoved',x:700,y:200});await delay(200);
    assert.equal(await evaluate(`document.querySelector('canvas').toDataURL()`),reducedPet,'reduced-motion pet ignores cursor');
    assert.equal(await evaluate(`JquanUIComponents.carouselApi.getState('#hero-carousel').isPlaying`),false);
    assert(await evaluate(`[...document.querySelectorAll('[data-ambient-fog]')].every(node=>getComputedStyle(node).animationName==='none')`));
    await capture('home-reduced-motion.png');
    await command('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
    const articleTarget=await evaluate(`(()=>{const link=document.querySelector('[jq-carousel-slide][aria-hidden="false"] a.pr-primary'),rect=link.getBoundingClientRect();return {href:link.getAttribute('href'),x:rect.x+rect.width/2,y:rect.y+rect.height/2}})()`);
    await command('Input.dispatchMouseEvent',{type:'mousePressed',x:articleTarget.x,y:articleTarget.y,button:'left',clickCount:1});
    await command('Input.dispatchMouseEvent',{type:'mouseReleased',x:articleTarget.x,y:articleTarget.y,button:'left',clickCount:1});
    await waitFor(`location.pathname.endsWith(${JSON.stringify('/'+articleTarget.href)})&&document.readyState==='complete'`,'article remains clickable with pet overlay');
    await visit('library.html');
    await evaluate(`document.querySelector('[data-prismara-filter="python"]').click()`);
    assert.equal(await evaluate(`document.querySelectorAll('article[data-library-item]:not([hidden])').length`),2);
    await evaluate(`const input=document.querySelector('[data-prismara-search]');input.value='不存在的内容';input.dispatchEvent(new Event('input',{bubbles:true}))`);
    assert.equal(await evaluate(`document.querySelectorAll('article[data-library-item]:not([hidden])').length`),0);
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('[data-search-empty]')).display==='none'`),false);
    await evaluate(`document.querySelector('[data-reset-search]').click()`);
    assert.equal(await evaluate(`document.querySelectorAll('article[data-library-item]:not([hidden])').length`),5);
    await visit('library.html?q=API');
    assert.equal(await evaluate(`document.querySelectorAll('article[data-library-item]:not([hidden])').length`),1);
    await visit('apps.html');
    const { applications } = require('../content/apps.cjs');
    assert.deepEqual(await evaluate(`[...document.querySelectorAll('[data-app-item]')].map(card=>({id:card.id,urls:[...card.querySelectorAll('a')].map(link=>link.href)}))`),applications.map(app=>({id:app.id,urls:[app.url,app.url,app.repository]})));
    assert(await evaluate(`[...document.querySelectorAll('[data-app-item] a')].every(link=>link.target==='_blank'&&link.rel.includes('noopener'))`));
    await evaluate(`document.querySelector('[data-app-filter="development"]').click()`);
    assert.equal(await evaluate(`document.querySelectorAll('[data-app-item]:not([hidden])').length`),2);
    await evaluate(`(()=>{const input=document.querySelector('[data-app-search]');input.value='Nginx';input.dispatchEvent(new Event('input',{bubbles:true}))})()`);
    assert.equal(await evaluate(`document.querySelectorAll('[data-app-item]:not([hidden])').length`),1);
    await evaluate(`document.querySelector('[data-app-filter="security"]').click()`);
    assert.equal(await evaluate(`document.querySelectorAll('[data-app-item]:not([hidden])').length`),0);
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('[data-app-empty]')).display==='none'`),false);
    await evaluate(`document.querySelector('[data-reset-app-search]').click()`);
    assert.equal(await evaluate(`document.querySelectorAll('[data-app-item]:not([hidden])').length`),4);
    assert.equal(await evaluate(`document.querySelector('[data-app-count]').textContent`),'找到 4 个应用');
    await visit('apps.html?q=TOTP');
    assert.equal(await evaluate(`document.querySelectorAll('[data-app-item]:not([hidden])').length`),1);
    await visit('work.html');
    const contact = require('../content/work.cjs').contact;
    assert.equal(await evaluate(`document.querySelectorAll('[data-work-service]').length`),4);
    assert.equal(await evaluate(`document.querySelectorAll('[data-work-step]').length`),4);
    assert.equal(await evaluate(`document.querySelector('[data-contact-wechat]').textContent`),contact.wechat);
    assert.equal(await evaluate(`document.querySelector('[data-contact-email]').getAttribute('href')`),'mailto:'+contact.email);
    await evaluate(`Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.copiedContact=value}}});document.querySelector('[data-copy-contact]').click()`);
    assert.equal(await evaluate(`window.copiedContact`),contact.wechat);
    assert(await evaluate(`document.querySelector('[data-contact-status]').textContent.includes('已复制')`));
    await evaluate(`Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('Denied')}}});document.querySelector('[data-copy-contact]').click()`);
    assert(await evaluate(`document.querySelector('[data-contact-status]').textContent.includes('手动复制')`));
    await evaluate(`document.querySelector('nav[aria-label="作品与合作"] a[href="showcase.html"]').click()`);
    await waitFor(`location.pathname.endsWith('/showcase.html')&&document.readyState==='complete'`,'showcase navigation');
    const curated = require('../content/showcase.cjs').works;
    assert.equal(await evaluate(`document.querySelectorAll('[data-showcase-item]').length`),curated.length);
    assert.equal(await evaluate(`!!document.querySelector('[data-showcase-empty]')`),curated.length===0);
    assert(await evaluate(`[...document.querySelectorAll('[data-showcase-link]')].every(link=>link.target==='_blank'&&['nofollow','noopener','noreferrer'].every(token=>link.relList.contains(token)))`));
    if (curated.length) {
      for (const name of ['showcase.html','work.html']) {
        await visit(name);
        const expected = name==='work.html' ? curated.slice(0,2) : curated;
        const cards = await evaluate(`[...document.querySelectorAll('[data-showcase-item]')].map(card=>({id:card.dataset.showcaseItem,links:[...card.querySelectorAll('[data-showcase-link]')].map(link=>({url:link.href,target:link.target,rel:link.rel})),preview:card.querySelector('img').getAttribute('src')}))`);
        assert.deepEqual(cards.map(card=>card.id),expected.map(work=>work.id));
        cards.forEach((card,index)=>{
          assert.equal(card.preview,`../assets/showcase/${expected[index].preview}`);
          assert.equal(card.links.length,3);
          card.links.forEach(link=>{
            assert.equal(link.url,expected[index].url);
            assert.equal(link.target,'_blank');
            for(const token of ['nofollow','noopener','noreferrer'])assert(link.rel.split(/\s+/).includes(token));
          });
        });
        for (const width of [1280,390]) {
          await command('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
          for (const theme of ['light','dark']) {
            await evaluate(`PrismaraTheme.setPreference('${theme}');document.querySelector('[data-showcase-item]').scrollIntoView({block:'center'})`);
            await evaluate(`Promise.all([...document.querySelectorAll('[data-showcase-item] img')].map(image=>image.decode()))`);
            await delay(100);
            assert(await evaluate(`document.documentElement.scrollWidth<=innerWidth+1`),'populated portfolio fits');
            await capture(`${name.replace('.html','')}-portfolio-${theme}-${width}.png`);
          }
        }
      }
      await command('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
      await evaluate(`PrismaraTheme.setPreference('light')`);
      await visit('showcase.html');
      const before = (await command('Target.getTargets')).targetInfos.map(target=>target.targetId);
      await command('Runtime.evaluate',{expression:`document.querySelector('[data-showcase-link]').click()`,userGesture:true});
      let opened;
      for(let i=0;i<30&&!opened;i++) {
        opened=(await command('Target.getTargets')).targetInfos.find(target=>!before.includes(target.targetId)&&target.type==='page'&&target.url===curated[0].url);
        if(!opened)await delay(100);
      }
      assert(opened,'actual portfolio click opens the selected website in a new tab');
      assert(await evaluate(`location.pathname.endsWith('/showcase.html')`),'portfolio keeps the original page');
      await command('Target.closeTarget',{targetId:opened.targetId});
    }
    await visit('tags.html?tag=Python');
    assert.equal(await evaluate(`document.querySelectorAll('[data-tag-record]:not([hidden])').length`),2);
    await evaluate(`document.querySelector('[data-tag-choice="API"]').click()`);
    assert.equal(await evaluate(`document.querySelectorAll('[data-tag-record]:not([hidden])').length`),1);
    assert.equal(await evaluate(`new URLSearchParams(location.search).get('tag')`),'API');
    await visit('tags.html?tag=missing');
    assert.equal(await evaluate(`document.querySelectorAll('[data-tag-record]:not([hidden])').length`),0);
    await evaluate(`document.querySelector('[data-tag-reset]').click()`);
    assert.equal(await evaluate(`document.querySelectorAll('[data-tag-record]:not([hidden])').length`),5);
    await visit('archives.html');
    assert.equal(await evaluate(`document.querySelectorAll('[data-archive-month]').length`),2);
    assert.equal(await evaluate(`document.querySelectorAll('[data-archive-month] article').length`),5);
    await visit('404.html');
    await evaluate(`document.querySelector('#missing-search').value='API';document.querySelector('main form').requestSubmit()`);
    await waitFor(`location.pathname.endsWith('/library.html')&&location.search==='?q=API'&&document.readyState==='complete'`,'404 search navigation');
    await delay(300);
    assert.equal(await evaluate(`document.querySelectorAll('article[data-library-item]:not([hidden])').length`),1);
    await evaluate(`(()=>{const input=document.querySelector('[data-prismara-search]');window.prismaraInputBefore=input;input.value='保留输入';input.focus();input.setSelectionRange(1,3);PrismaraTheme.setPreference('dark')})()`);
    assert(await evaluate(`document.querySelector('[data-prismara-search]')===prismaraInputBefore && document.activeElement===prismaraInputBefore && prismaraInputBefore.value==='保留输入' && prismaraInputBefore.selectionStart===1 && prismaraInputBefore.selectionEnd===3`),'theme preserves DOM, input and focus');
    await visit('about.html');
    assert.equal(await evaluate(`PrismaraTheme.getResolved()`),'dark','theme persists across pages');
    await evaluate(`document.querySelector('[data-theme-menu]').open=true;document.querySelector('[data-theme-menu] [data-theme-choice="light"]').click()`);
    assert.equal(await evaluate(`PrismaraTheme.getResolved()`),'light');
    assert(await evaluate(`!document.querySelector('[data-theme-menu]').open && document.activeElement.matches('[data-theme-summary]')`),'theme choice closes menu and returns focus');
    await evaluate(`document.querySelector('[data-theme-menu]').open=true;document.querySelector('[data-theme-summary]').focus()`);
    await command('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});
    assert.equal(await evaluate(`document.querySelector('[data-theme-menu]').open`),false);
    await evaluate(`PrismaraTheme.setPreference('system')`);
    await command('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'dark'}]});
    await command('Page.captureScreenshot',{format:'png'}); // Flush a frame on otherwise static headless pages.
    await waitFor(`PrismaraTheme.getResolved()==='dark' && document.documentElement.classList.contains('dark')`,'system dark theme');
    await command('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'light'}]});
    await command('Page.captureScreenshot',{format:'png'});
    await waitFor(`PrismaraTheme.getResolved()==='light' && document.documentElement.classList.contains('light')`,'system light theme');
    await evaluate(`PrismaraTheme.setPreference('light')`);
    await command('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'dark'}]});
    await command('Page.captureScreenshot',{format:'png'});
    assert.equal(await evaluate(`PrismaraTheme.getResolved()==='light' && document.documentElement.classList.contains('light')`),true,'explicit light overrides dark system');
    await command('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'light'}]});
    await command('Page.captureScreenshot',{format:'png'});
    await evaluate(`PrismaraTheme.setPreference('dark')`);
    assert.equal(await evaluate(`document.documentElement.classList.contains('dark')`),true,'explicit preference overrides light system');
    await visit('index.html');
    assert.equal(await evaluate(`PrismaraTheme.getResolved()`),'dark','stored theme restored');
    await evaluate(`JquanUIComponents.carouselApi.goTo('#hero-carousel',2,false);window.prismaraSlideBefore=document.querySelector('[jq-carousel-slide][aria-hidden="false"]');PrismaraTheme.setPreference('light')`);
    assert(await evaluate(`document.querySelector('[jq-carousel-slide][aria-hidden="false"]')===prismaraSlideBefore && document.querySelector('[data-carousel-page="2"]').getAttribute('aria-pressed')==='true'`),'theme preserves carousel instance and selected article');
    const other=await command('Target.createTarget',{url:'about:blank'});
    const {sessionId}=await command('Target.attachToTarget',{targetId:other.targetId,flatten:true});
    await command('Page.enable',{},sessionId);
    await command('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/projects/prismara-atlas/pages/about.html`},sessionId);
    let otherReady=false;
    for(let attempt=0;attempt<100&&!otherReady;attempt++) {otherReady=(await command('Runtime.evaluate',{expression:`!!window.PrismaraTheme && document.readyState==='complete'`,returnByValue:true},sessionId)).result.value;if(!otherReady)await delay(100);}
    assert(otherReady,'second theme tab ready');
    await command('Runtime.evaluate',{expression:`PrismaraTheme.setPreference('dark')`},sessionId);
    await waitFor(`PrismaraTheme.getPreference()==='dark' && document.documentElement.classList.contains('dark')`,'cross-tab theme synchronization');
    await command('Runtime.evaluate',{expression:`localStorage.removeItem('prismara-appearance')`},sessionId);
    await waitFor(`PrismaraTheme.getPreference()==='system'`,'cross-tab reset to system');
    await command('Target.closeTarget',{targetId:other.targetId});
    const blocked=await command('Page.addScriptToEvaluateOnNewDocument',{source:`Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new DOMException('Storage blocked','SecurityError')}})`});
    await visit('about.html');
    assert.equal(await evaluate(`PrismaraTheme.getPreference()`),'system');
    assert.equal(await evaluate(`PrismaraTheme.setPreference('dark') && document.documentElement.classList.contains('dark')`),true,'theme works with unavailable storage');
    await command('Page.removeScriptToEvaluateOnNewDocument',{identifier:blocked.identifier});
    await visit('about.html');
    await evaluate(`localStorage.setItem('prismara-appearance','invalid')`);
    await visit('library.html');
    assert.equal(await evaluate(`PrismaraTheme.getPreference()`),'system','invalid preference falls back');
    await evaluate(`PrismaraTheme.setPreference('light')`);
    for(const width of [1280,390]) {
      await command('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
      await visit('article.html');
      await evaluate(`document.querySelector('[data-toc][href="#verify"]').click()`);await delay(350);
      assert.equal(await evaluate(`location.hash`),'#verify');
      assert.equal(await evaluate(`document.querySelector('#verify').getBoundingClientRect().top>=document.querySelector('header.pr-nav').getBoundingClientRect().bottom`),true,`TOC heading hidden under header at ${width}`);
    }
    await command('Page.navigate',{url:pathToFileURL(path.join(project,'pages','index.html')).href});
    await waitFor(`location.protocol==='file:' && document.readyState==='complete' && !!window.JquanUIComponents?.carouselApi?.getState('#hero-carousel')`,'direct file preview');
    assert.equal(await evaluate(`JquanUIComponents.carouselApi.getState('#hero-carousel').total`),4);
    assert.equal(await evaluate(`[...document.images].filter(image=>image.complete&&!image.naturalWidth).length`),0);
    assert.equal(errors.length,0,errors.join('\n'));
    fs.writeFileSync(path.join(output,process.argv.includes('--interactions-only')?'interactions-results.json':'browser-results.json'),JSON.stringify({passed:true,pages:results,petEvidence:{live:'real mouse noticing, running, ground greeting, leave, touch, pause and reduced motion',autonomous:'independent seeded behavior fixtures rendered by the real renderer; separate seeded random lifecycle simulation',actions:['walk','rest','dig','chase','pee','balloon','sniff','stretch','shake'],themes:['light','dark'],widths:[1280,390],screenshots:36},checks:['work services/process, public contacts, clipboard success/denied fallback, showcase navigation and external link attributes','light/dark at three widths, semantic text contrast, matching cover palette','theme selection, system follow, explicit override, storage restore and actual cross-tab synchronization','unavailable storage and invalid value fallback; input, focus and Carousel state preserved','archive grouping, tag selection/query/reset, 404 search navigation','round icon selectors; no numeric controls, previous/next/pause buttons or hero divider','carousel select, public navigation API, wrap, autoplay, focus pause','matching title, article and column links','inactive slides excluded from focus','64-particle four-legged puppy notices, runs, greets on ground, plays and pauses; nine autonomous actions, weighted random play, elastic balloon arcs, continuous toy entry/exit lifecycles, rear-supported balloon jumps and head contacts','reduced-motion disables field, fog and autoplay','search, column filter, no results, reset, query links','app search/category intersection, reset, query and verified project links','article TOC anchor','no runtime exceptions']},null,2));
    console.log(`Prismara browser verification passed: ${results.length} page/theme/viewport cases; appearance persistence/system/cross-tab, input and Carousel state, archives/tags/404, existing interactions; no runtime exceptions. Screenshots: ${output}`);
  } finally {
    for(const item of pending.values())clearTimeout(item.timer);
    socket?.close();browser.kill();server.close();
  }
}
main().catch(error=>{console.error(error.stack||error.message);process.exitCode=1;});
