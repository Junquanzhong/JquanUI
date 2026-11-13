'use strict';
const assert = require('assert/strict');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');
const root = path.resolve(__dirname, '..');
const browserPath = process.env.JQUAN_BROWSER || ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find(file => fs.existsSync(file));
if (!browserPath) throw new Error('Set JQUAN_BROWSER to Chromium.');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const entries = { core: '/dist/core/JquanUI@Core.js', min: '/js/JquanUI@core.min.js', full: '/dist/full/JquanUI@full.js' };
const extractor = require('../dist/cli/jquan-extract.cjs');
const probe = process.argv.includes('--core') ? process.argv[process.argv.indexOf('--core')+1] : null;
if(probe) { for(const key of Object.keys(entries)) delete entries[key]; entries.probe = '/' + probe.replaceAll('\\','/'); }
else entries.static = 'static';
const config = {
 darkMapping: { enabled: true, map: { white:'surface', 'slate-700':'text', 'slate-200':'border', md:'text' } },
 theme: { extend: { colors: { md:'#ff0000' } }, semantic: {
  surface:{light:'white',dark:'slate-900'}, text:{light:'slate-700',dark:'slate-100'}, border:{light:'slate-200',dark:'slate-700'}
 } }
};
const template = '<!doctype html><html class="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><script>window.JQUAN_CONFIG=CONFIG;<'+ '/script><!-- CORE_ENTRY --></head><body>' +
 '<input id="mapped" class="bg-white text-slate-700 border border-slate-200 outline outline-slate-200 ring-2 ring-slate-200" value="preserve">'+
 '<div id="alpha" class="bg-white/90"></div><div id="explicit" class="bg-white dark:bg-red-500"></div>'+
 '<div id="media" class="bg-white dark-media:bg-red-500"></div><div id="responsive" class="sm:bg-white sm:dark:bg-red-500"></div>'+
 '<div id="scope"><div id="local" class="bg-white"></div></div><input id="placeholder" placeholder="sample" class="placeholder:text-slate-700">'+
 '<div id="sides" class="border-x-slate-200"></div><div id="size" class="text-md"></div>'+
 '<div id="unmapped" class="bg-red-100"></div><div id="important" class="!bg-white dark:bg-red-500"></div>'+
 '<div id="state" class="hover:bg-white"></div><div class="container-type-inline-size w-full"><div id="container" class="@sm:bg-white"></div></div>'+
 '<script>JquanUI.scan();window.mappingReady=true;<'+ '/script></body></html>';
async function main() {
    const server = http.createServer((request, response) => {
        const url = new URL(request.url, 'http://localhost');
        response.setHeader('Cache-Control', 'no-store');
        if (url.pathname === '/') {
            const entry = url.searchParams.get('entry');
            if (!entries[entry]) { response.writeHead(400); response.end(); return; }
            response.setHeader('Content-Type', 'text/html; charset=utf-8');
            const currentConfig = {...config, darkMapping: {...config.darkMapping, enabled: url.searchParams.get('enabled') !== 'false'}, cascadeLayers: url.searchParams.get('layers') === 'true', constructableStylesheets: url.searchParams.get('style') !== 'true'};
            let html = template.replace('=CONFIG;', '=' + JSON.stringify(currentConfig) + ';');
            if (entry === 'static') {
                const css = extractor.extractFromSource(html + '<div class="bg-white"></div>', { config: currentConfig }).css;
                html = html.replace('<!-- CORE_ENTRY -->', '<style>' + css + '</style>').replace('JquanUI.scan();', '');
            } else html = html.replace('<!-- CORE_ENTRY -->', `<script src="${entries[entry]}"></script>`);
            response.end(html); return;
        }
        const file = path.resolve(root, decodeURIComponent(url.pathname).slice(1));
        const relative = path.relative(root, file);
        if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); response.end(); return; }
        response.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : 'text/plain');
        fs.createReadStream(file).pipe(response);
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const debugPort = 10200 + Math.floor(Math.random() * 300);
    const browser = spawn(browserPath, ['--headless=new', '--disable-gpu', '--no-sandbox', `--remote-debugging-port=${debugPort}`, `--user-data-dir=${path.join(root, '.tmp', `edge-semantic-theme-${Date.now()}`)}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
    let socket; const pending = new Map();
    try {
        let pages;
        for (let i = 0; i < 100 && !pages; i++) { try { const response = await fetch(`http://127.0.0.1:${debugPort}/json/list`); if (response.ok) pages = await response.json(); } catch {} if (!pages) await delay(100); }
        assert(pages, 'Browser start timed out');
        socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
        await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
        let sequence = 0;
        socket.onmessage = event => { const message = JSON.parse(event.data); const item = pending.get(message.id); if (!item) return; clearTimeout(item.timer); pending.delete(message.id); if (message.error) item.reject(new Error(JSON.stringify(message.error))); else item.resolve(message.result); };
        const command = (method, params = {}) => new Promise((resolve, reject) => { const id = ++sequence; const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 20000); pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params })); });
        const evaluate = async expression => { const result = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); assert(!result.exceptionDetails, JSON.stringify(result.exceptionDetails)); return result.result.value; };
        await command('Runtime.enable');
        await command('Emulation.setFocusEmulationEnabled', { enabled: true });
        await command('Emulation.setDeviceMetricsOverride', { width:1280, height:800, deviceScaleFactor:1, mobile:false });
        await command('DOM.enable');
        await command('CSS.enable');
        for (const entry of Object.keys(entries)) {
          for(const scenario of [{enabled:true},{enabled:false},{enabled:true,layers:true},{enabled:true,style:true}]) {
            const query='?entry='+entry+'&'+new URLSearchParams(scenario);
            await command('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'light'}]});
            await command('Page.navigate',{url:'http://127.0.0.1:'+server.address().port+'/'+query});
            let ready=false;for(let i=0;i<100&&!ready;i++){ready=await evaluate('location.search === '+JSON.stringify(query)+' && window.mappingReady === true');if(!ready)await delay(50);}
            assert(ready,'Fixture timed out');
            const sample=()=>evaluate(`(() => {const style=id=>getComputedStyle(document.getElementById(id));return {
              bg:style('mapped').backgroundColor,text:style('mapped').color,border:style('mapped').borderTopColor,outline:style('mapped').outlineColor,ring:style('mapped').getPropertyValue('--jquan-ring-color').trim(),
              alpha:style('alpha').backgroundColor,explicit:style('explicit').backgroundColor,media:style('media').backgroundColor,responsive:style('responsive').backgroundColor,
              local:style('local').backgroundColor,placeholder:getComputedStyle(document.getElementById('placeholder'),'::placeholder').color,
              side:style('sides').borderLeftColor,sizeColor:style('size').color,root:getComputedStyle(document.documentElement).backgroundColor,
              important:style('important').backgroundColor,container:style('container').backgroundColor,state:style('state').backgroundColor,unmapped:style('unmapped').backgroundColor
            }} )()`);
            const light=await sample();assert.equal(light.bg,'rgb(255, 255, 255)');
            await evaluate(`window.preserved=document.getElementById('mapped');preserved.focus();preserved.setSelectionRange(1,3);document.documentElement.className='dark bg-white';window.JquanUI?.scan()`);
            const { root: domRoot } = await command('DOM.getDocument');
            const { nodeId: stateNode } = await command('DOM.querySelector', { nodeId: domRoot.nodeId, selector:'#state' });
            await command('CSS.forcePseudoState', { nodeId:stateNode, forcedPseudoClasses:['hover'] });
            const dark=await sample();
            assert.equal(dark.bg,scenario.enabled?'rgb(15, 23, 42)':light.bg,'mapped background');
            assert.equal(dark.explicit,'rgb(239, 68, 68)','explicit dark precedence');
            assert.equal(dark.responsive,'rgb(239, 68, 68)','responsive explicit dark precedence');
            assert.equal(dark.important,dark.bg,'important retains priority over normal explicit dark');
            assert.equal(dark.container,dark.bg,'container mapping');
            assert.equal(dark.state,dark.bg,'hover mapping');
            assert.equal(dark.unmapped,light.unmapped,'unmapped color');
            if(scenario.enabled) {
              assert.equal(dark.root,'rgb(15, 23, 42)','dark root element mapping');
              assert.equal(dark.text,'rgb(241, 245, 249)');assert.equal(dark.placeholder,dark.text);
              assert.equal(dark.border,'rgb(51, 65, 85)');assert.equal(dark.side,dark.border);assert.equal(dark.outline,dark.border);
              assert.equal(dark.alpha,'color(srgb 0.0588235 0.0901961 0.164706 / 0.9)');
              assert.equal(dark.sizeColor,light.sizeColor,'font-size utility must not acquire color');
            }
            assert(await evaluate(`preserved===document.getElementById('mapped')&&document.activeElement===preserved&&preserved.selectionStart===1&&preserved.selectionEnd===3`),'DOM/focus/selection changed');
            await evaluate(`document.documentElement.className='light';document.getElementById('scope').className='dark'`);
            assert.equal((await sample()).local,scenario.enabled?'rgb(15, 23, 42)':light.local,'local scope');
            await command('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'dark'}]});
            assert.equal((await sample()).bg,light.bg,'explicit light vs system');
            await evaluate(`document.documentElement.className=''`);
            const system=await sample();assert.equal(system.bg,dark.bg,'system mapping');
            assert.equal(system.explicit,'rgb(239, 68, 68)','system explicit precedence');assert.equal(system.media,'rgb(239, 68, 68)','dark-media precedence');
            if(entry !== 'static') {
              // Reload the same config after persistence to exercise CSSOM cache sorting.
              await delay(1350);
              const warmQuery=query+'&warm=1';
              await command('Page.navigate',{url:'http://127.0.0.1:'+server.address().port+'/'+warmQuery});
              let warm=false;for(let i=0;i<100&&!warm;i++){warm=await evaluate('location.search === '+JSON.stringify(warmQuery)+' && window.mappingReady === true');if(!warm)await delay(50);}
              assert(warm,'warm reload timed out');
              assert.equal(await evaluate('JquanUI.getMetrics().cacheHydrate'),'hit','cache hydration');
              await evaluate(`document.documentElement.className='dark bg-white'`);
              const cached=await sample();assert.equal(cached.bg,dark.bg);assert.equal(cached.explicit,dark.explicit);assert.equal(cached.media,'rgb(239, 68, 68)');assert.equal(cached.root,dark.root);
              await evaluate(`JQUAN_CONFIG.themes={forest:{semantic:{...JQUAN_CONFIG.theme.semantic,surface:{light:'white',dark:'#064e3b'}}}};JquanUI.setTheme('forest')`);
              if(scenario.enabled)assert.equal((await sample()).bg,'rgb(6, 78, 59)','setTheme');
              await evaluate(`JquanUI.setTheme('default')`);assert.equal((await sample()).bg,dark.bg,'theme reset');
              assert.equal(await evaluate('JquanUI.debug().failedRuleCount'),0,'CSSOM failures');
            }
            console.log('[JquanUI] dark mapping '+entry+' '+JSON.stringify(scenario)+' ok');
          }
        }
        console.log('[JquanUI] dark mapping browser check ok');
    } finally { for(const item of pending.values())clearTimeout(item.timer);socket?.close();browser.kill();server.close(); }
}
main().catch(error=>{console.error(error.stack||error.message);process.exitCode=1;});
