'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

const root = path.resolve(__dirname, '..');
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

if (!fs.existsSync(edge)) throw new Error('Microsoft Edge is required for the component documentation browser check.');

function startServer() {
  const server = http.createServer((request, response) => {
    const requestPath = decodeURIComponent(String(request.url || '/').split('?')[0]);
    const relative = requestPath === '/' ? 'components.html' : requestPath.replace(/^\/+/, '');
    const file = path.resolve(root, relative);
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      response.writeHead(404);
      response.end();
      return;
    }
    const contentType = /\.(?:js|mjs)$/i.test(file) ? 'text/javascript; charset=utf-8' : 'text/html; charset=utf-8';
    response.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(file).pipe(response);
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function waitForJson(url, timeout = 10000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch {}
    await sleep(100);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function main() {
  const server = await startServer();
  const port = server.address().port;
  const debugPort = 9800 + Math.floor(Math.random() * 300);
  const profile = path.join(root, '.tmp', `edge-component-docs-check-${Date.now()}`);
  const browser = spawn(edge, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profile}`,
    'about:blank'
  ], { windowsHide: true, stdio: 'ignore' });

  let socket;
  try {
    const version = await waitForJson(`http://127.0.0.1:${debugPort}/json/version`);
    const pages = await waitForJson(`http://127.0.0.1:${debugPort}/json/list`);
    const page = pages.find(item => item.type === 'page' && !String(item.url).startsWith('chrome-extension:')) || pages.find(item => item.type === 'page');
    assert(page && page.webSocketDebuggerUrl, 'No Edge page was available.');
    socket = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    let sequence = 0;
    const pending = new Map();
    const consoleErrors = [];
    socket.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.method === 'Runtime.consoleAPICalled' && ['error', 'assert'].includes(message.params.type)) {
        consoleErrors.push(message.params.args?.map(item => item.value || item.description).join(' '));
      }
      if (message.id && pending.has(message.id)) {
        pending.get(message.id)(message);
        pending.delete(message.id);
      }
    };
    const command = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++sequence;
      pending.set(id, resolve);
      socket.send(JSON.stringify({ id, method, params }));
      setTimeout(() => { if (pending.delete(id)) reject(new Error(`CDP timeout: ${method}`)); }, 10000);
    });
    const evaluate = async expression => {
      const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (result.result?.exceptionDetails) throw new Error(result.result.exceptionDetails.exception?.description || 'Browser evaluation failed.');
      return result.result?.result?.value;
    };

    await command('Runtime.enable');
    await command('Page.enable');
    // The documentation must not collapse into the loader when the optional
    // syntax highlighter CDN is slow or unavailable. This deliberately tests
    // the offline-first rendering path used by local demos and restricted nets.
    await command('Network.enable');
    await command('Network.setBlockedURLs', { urls: ['https://unpkg.com/@highlightjs/*'] });
    await command('Page.navigate', { url: `http://127.0.0.1:${port}/index.html?browser-check=${Date.now()}` });
    await evaluate(`new Promise(resolve => { const started = Date.now(); const poll = () => { const heading = document.querySelector('#app-container > * h1'); const enhanced = heading && getComputedStyle(heading).fontSize !== '0px' && Boolean(document.adoptedStyleSheets?.length || document.querySelector('style')?.sheet?.cssRules?.length); if (enhanced || Date.now() - started > 9000) resolve(); else setTimeout(poll, 100); }; poll(); })`);
    const introInitial = await evaluate(`({
      sidebarItems: document.querySelectorAll('#sidebar-nav .nav-item').length,
      appChildren: document.querySelector('#app-container')?.children.length || 0,
      headingSize: document.querySelector('#app-container h1') ? getComputedStyle(document.querySelector('#app-container h1')).fontSize : '0px',
      hasRules: Boolean(document.adoptedStyleSheets?.length || document.querySelector('style')?.sheet?.cssRules?.length),
      metrics: typeof window.JquanUI?.getMetrics === 'function' ? window.JquanUI.getMetrics() : null,
      introCodeBlock: Boolean(document.querySelector('#app-container pre code'))
    })`);
    assert(introInitial.sidebarItems > 0, 'CSS documentation sidebar was not rendered.');
    assert(introInitial.appChildren === 1 && introInitial.headingSize !== '0px' && introInitial.hasRules, `CSS documentation intro was not synchronously enhanced: ${JSON.stringify(introInitial)}`);
    assert(introInitial.introCodeBlock, `CSS documentation intro code block was not rendered while the optional highlighter CDN was blocked: ${JSON.stringify(introInitial)}`);
    assert(introInitial.metrics && typeof introInitial.metrics.totalResolves === 'number' && introInitial.metrics.performance, 'Runtime metrics API was not exposed in the browser Core.');

    await evaluate(`window.docApp.loadComponent('align')`);
    await sleep(150);
    assert(await evaluate(`document.querySelector('#align-playground-target')?.textContent.includes('JquanUI')`), 'Alignment playground was not rendered.');
    await evaluate(`document.querySelector('[data-align-value="text-start"]').click(); document.querySelector('[data-align-direction="rtl"]').click()`);
    const alignState = await evaluate(`({
      className: document.querySelector('#align-playground-target')?.className || '',
      direction: document.querySelector('#align-playground-target')?.getAttribute('dir') || '',
      code: document.querySelector('#align-playground-code')?.textContent || '',
      status: document.querySelector('#align-playground-status')?.textContent || ''
    })`);
    assert(alignState.className.includes('text-start') && alignState.direction === 'rtl' && alignState.code.includes('text-start') && /RTL/.test(alignState.status), `Alignment playground interaction failed: ${JSON.stringify(alignState)}`);

    await evaluate(`window.docApp.loadComponent('display')`);
    await sleep(150);
    await evaluate(`document.querySelector('[data-display="inline-block"]').click()`);
    const inlineDisplay = await evaluate(`({
      display: getComputedStyle(document.querySelector('#demo-box-1')).display,
      code: document.querySelector('#display-live-code')?.textContent || '',
      behavior: document.querySelector('#display-behavior')?.textContent || ''
    })`);
    assert(inlineDisplay.display === 'inline-block' && inlineDisplay.code.includes('inline-block') && /并排/.test(inlineDisplay.behavior), `Display inline-block interaction failed: ${JSON.stringify(inlineDisplay)}`);
    await evaluate(`document.querySelector('[data-display="hidden"]').click()`);
    const hiddenDisplay = await evaluate(`({
      display: getComputedStyle(document.querySelector('#demo-box-1')).display,
      code: document.querySelector('#display-live-code')?.textContent || '',
      behavior: document.querySelector('#display-behavior')?.textContent || ''
    })`);
    assert(hiddenDisplay.display === 'none' && hiddenDisplay.code.includes('hidden') && /渲染树/.test(hiddenDisplay.behavior), `Display hidden interaction failed: ${JSON.stringify(hiddenDisplay)}`);

    await evaluate(`window.docApp.loadComponent('bgcolor')`);
    await sleep(150);
    await evaluate(`document.querySelector('[data-bg-choice="bg-success"]').click()`);
    const bgState = await evaluate(`({
      className: document.querySelector('#bg-playground-surface')?.className || '',
      code: document.querySelector('#bg-playground-code')?.textContent || '',
      status: document.querySelector('#bg-playground-status')?.textContent || ''
    })`);
    assert(bgState.className.includes('bg-success') && bgState.code.includes('bg-success') && bgState.status === 'bg-success', `Background color playground interaction failed: ${JSON.stringify(bgState)}`);

    await evaluate(`window.docApp.loadComponent('textcolor')`);
    await sleep(150);
    await evaluate(`document.querySelector('[data-text-choice="text-danger"]').click()`);
    const textState = await evaluate(`({
      className: document.querySelector('#text-playground-target')?.className || '',
      code: document.querySelector('#text-playground-code')?.textContent || '',
      status: document.querySelector('#text-playground-status')?.textContent || ''
    })`);
    assert(textState.className.includes('text-danger') && textState.code.includes('text-danger') && textState.status === 'text-danger', `Text color playground interaction failed: ${JSON.stringify(textState)}`);

    await evaluate(`window.docApp.loadComponent('spacing')`);
    await sleep(150);
    await evaluate(`document.querySelector('[data-type="m"][data-class="m-8"]').click(); document.querySelector('[data-type="space-y"][data-class="space-y-8"]').click()`);
    const spacingState = await evaluate(`({
      box: document.querySelector('#demo-mp-box')?.className || '',
      column: document.querySelector('#demo-space-y')?.className || '',
      code: document.querySelector('#spacing-playground-code-host')?.textContent || '',
      status: document.querySelector('#spacing-playground-status')?.textContent || '',
      codeBlock: Boolean(document.querySelector('#spacing-playground-code-host pre.group')),
      copyButton: Boolean(document.querySelector('#spacing-playground-code-host button[title="复制代码"]'))
    })`);
    assert(spacingState.box.includes('m-8') && spacingState.column.includes('space-y-8') && spacingState.code.includes('m-8') && spacingState.status.includes('space-y-8') && spacingState.codeBlock && spacingState.copyButton, `Spacing playground interaction failed: ${JSON.stringify(spacingState)}`);

    await evaluate(`window.docApp.loadComponent('flexbox')`);
    await sleep(250);
    const flexCode = await evaluate(`document.querySelector('#code-container')?.textContent || ''`);
    assert(flexCode.includes('<div class="flex gap-2') && flexCode.includes('flex-wrap'), 'Flexbox code preview was not escaped and highlighted as source text.');

    await evaluate(`window.docApp.loadComponent('grid')`);
    await sleep(250);
    const gridCode = await evaluate(`document.querySelector('#code-container')?.textContent || ''`);
    assert(gridCode.includes('<div class="grid p-2') && gridCode.includes('grid-cols-4'), 'Grid code preview was not escaped and highlighted as source text.');

    await evaluate(`window.docApp.loadComponent('background-image')`);
    await sleep(250);
    const backgroundCode = await evaluate(`document.querySelector('#code-container')?.textContent || ''`);
    assert(backgroundCode.includes('<div class="w-64 h-64 p-8 border-16') && backgroundCode.includes("bg-[url('https://www.jquan.win/upload/20250626/2a170408a3db79.webp')]"), 'Background image code preview was not escaped and highlighted as source text.');

    await evaluate(`window.docApp.loadComponent('size')`);
    await sleep(250);
    await evaluate(`document.querySelector('[data-type="w"][data-class="w-48"]').click(); document.querySelector('[data-aspect="aspect-square"]').click()`);
    const sizeState = await evaluate(`({
      demo: document.querySelector('#demo-box')?.className || '',
      aspect: document.querySelector('#aspect-demo-box')?.className || '',
      code: document.querySelector('#size-playground-code-host')?.textContent || '',
      status: document.querySelector('#size-playground-status')?.textContent || '',
      codeBlock: Boolean(document.querySelector('#size-playground-code-host pre.group')),
      copyButton: Boolean(document.querySelector('#size-playground-code-host button[title="复制代码"]'))
    })`);
    assert(sizeState.demo.includes('w-48') && sizeState.aspect.includes('aspect-square') && sizeState.code.includes('w-48') && sizeState.status.includes('aspect-square') && sizeState.codeBlock && sizeState.copyButton, `Size playground interaction failed: ${JSON.stringify(sizeState)}`);

    const visitCssDoc = async id => {
      await evaluate(`window.docApp.loadComponent(${JSON.stringify(id)})`);
      await sleep(250);
    };
    const assertSharedCodeBlock = async (id, codeId) => {
      const state = await evaluate(`({
        code: document.querySelector(${JSON.stringify(`#${codeId}`)})?.textContent || '',
        rendered: Boolean(document.querySelector(${JSON.stringify(`#${codeId}.group`)})),
        copyButton: Boolean(document.querySelector(${JSON.stringify(`#${codeId} button[title="复制代码"]`)}))
      })`);
      assert(state.rendered && state.copyButton && state.code.trim().length > 0, `${id} shared code block was not rendered: ${JSON.stringify(state)}`);
      return state;
    };

    await visitCssDoc('font-vf');
    const fontVfBefore = await evaluate(`({
      className: document.querySelector('#preview-section')?.className || '',
      code: document.querySelector('#font-vf-code')?.textContent || '',
      variation: getComputedStyle(document.querySelector('#preview-section') || document.body).fontVariationSettings
    })`);
    await evaluate(`(() => {
      const slnt = document.querySelector('#slnt');
      const wght = document.querySelector('#wght');
      if (slnt) { slnt.value = '-0.5'; slnt.dispatchEvent(new Event('input', { bubbles: true })); }
      if (wght) { wght.value = '700'; wght.dispatchEvent(new Event('input', { bubbles: true })); }
    })()`);
    await sleep(150);
    const fontVfAfter = await evaluate(`({
      className: document.querySelector('#preview-section')?.className || '',
      code: document.querySelector('#font-vf-code')?.textContent || '',
      variation: getComputedStyle(document.querySelector('#preview-section') || document.body).fontVariationSettings
    })`);
    assert(fontVfBefore.code.includes('font-variation-settings') && fontVfAfter.code.includes('"slnt"_-0.5') && fontVfAfter.code.includes('"wght"_700') && fontVfAfter.className.includes('[font-variation-settings:'), `Variable font interaction failed: ${JSON.stringify({ before: fontVfBefore, after: fontVfAfter })}`);
    await assertSharedCodeBlock('font-vf', 'font-vf-code');

    await visitCssDoc('fontsize');
    await evaluate(`(() => { const slider = document.querySelector('#fs-slider'); slider.value = '42'; slider.dispatchEvent(new Event('input', { bubbles: true })); })()`);
    await sleep(120);
    const fontSizeState = await evaluate(`({
      className: document.querySelector('#fs-preview-text')?.className || '',
      display: document.querySelector('#fs-display')?.textContent || '',
      code: document.querySelector('#fs-pre-container')?.textContent || ''
    })`);
    assert(fontSizeState.className.includes('fs-[42px]') && fontSizeState.display === '42px' && fontSizeState.code.includes('fs-[42px]'), `Font-size playground interaction failed: ${JSON.stringify(fontSizeState)}`);
    await assertSharedCodeBlock('fontsize', 'fs-pre-container');

    await visitCssDoc('fontweight');
    await evaluate(`(() => { const slider = document.querySelector('#fw-slider'); slider.value = '653'; slider.dispatchEvent(new Event('input', { bubbles: true })); })()`);
    await sleep(120);
    const fontWeightState = await evaluate(`({
      className: document.querySelector('#fw-preview-text')?.className || '',
      display: document.querySelector('#fw-display')?.textContent || '',
      code: document.querySelector('#fw-pre-container')?.textContent || ''
    })`);
    assert(fontWeightState.className.includes('fw-[653]') && fontWeightState.display === '653' && fontWeightState.code.includes('fw-[653]'), `Font-weight playground interaction failed: ${JSON.stringify(fontWeightState)}`);
    await assertSharedCodeBlock('fontweight', 'fw-pre-container');

    await visitCssDoc('hyphens');
    await evaluate(`(() => { const slider = document.querySelector('#width-slider'); slider.value = '175'; slider.dispatchEvent(new Event('input', { bubbles: true })); })()`);
    await sleep(120);
    const hyphensState = await evaluate(`({
      display: document.querySelector('#width-display')?.textContent || '',
      classes: Array.from(document.querySelectorAll('.demo-container')).map(node => node.className),
      width: getComputedStyle(document.querySelector('.demo-container') || document.body).width
    })`);
    assert(hyphensState.display === '175px' && hyphensState.classes.length === 3 && hyphensState.classes.every(className => className.includes('w-[175px]')), `Hyphens playground interaction failed: ${JSON.stringify(hyphensState)}`);

    await visitCssDoc('hover');
    await assertSharedCodeBlock('hover', 'hover-code');
    await visitCssDoc('interaction');
    await assertSharedCodeBlock('interaction', 'interaction-code');
    await evaluate(`document.querySelector('#pointer-select').value = 'pointer-events-auto'; document.querySelector('#pointer-select').dispatchEvent(new Event('change', { bubbles: true }))`);
    assert(await evaluate(`document.querySelector('#pointer-overlay')?.classList.contains('pointer-events-auto') && /拦截/.test(document.querySelector('#pointer-status')?.textContent || '')`), 'Interaction pointer-events feedback failed.');
    await visitCssDoc('loader');
    await assertSharedCodeBlock('loader', 'loader-code');
    await visitCssDoc('mask');
    await assertSharedCodeBlock('mask', 'mask-code');
    await visitCssDoc('scroll');
    await assertSharedCodeBlock('scroll', 'scroll-code');
    await visitCssDoc('shadow');
    await assertSharedCodeBlock('shadow', 'shadow-code');

    await command('Page.navigate', { url: `http://127.0.0.1:${port}/components.html?browser-check=${Date.now()}` });
    await evaluate(`new Promise(resolve => { const started = Date.now(); const poll = () => { if (document.querySelectorAll('#component-sidebar .component-nav-item').length === 78 || Date.now() - started > 9000) resolve(); else setTimeout(poll, 100); }; poll(); })`);

    const initial = await evaluate(`({ nav: document.querySelectorAll('#component-sidebar .component-nav-item').length, title: document.title })`);
    assert(initial.nav === 78, `Expected 78 functional component navigation items, received ${initial.nav}.`);
    assert(initial.title === 'JquanUI Components Docs', 'Component documentation title is incorrect.');

    await evaluate(`document.querySelector('#component-sidebar .component-nav-item[data-id="data"]').click()`);
    await sleep(300);
    const dataBefore = await evaluate(`document.querySelectorAll('#preview-data-list > div').length`);
    await evaluate(`document.querySelector('#preview-data-insert').click()`);
    await sleep(100);
    const dataAfter = await evaluate(`document.querySelectorAll('#preview-data-list > div').length`);
    const dataFeedback = await evaluate(`document.querySelector('#preview-data-state')?.textContent || ''`);
    assert(dataBefore === 3 && dataAfter === 4, `Data preview insert failed: ${dataBefore} -> ${dataAfter}.`);
    assert(/insert\(\)/.test(dataFeedback), `Data preview feedback did not update: ${dataFeedback}`);

    await evaluate(`document.querySelector('#component-sidebar .component-nav-item[data-id="iframeBridge"]').click()`);
    let bridgeReady = '';
    for (let attempt = 0; attempt < 50; attempt += 1) {
      await sleep(100);
      bridgeReady = await evaluate(`document.querySelector('#preview-iframe-status')?.textContent || ''`);
      if (/\"ready\": true|\"connected\": true/.test(bridgeReady)) break;
    }
    if (!/\"ready\": true|\"connected\": true/.test(bridgeReady)) {
      const childDebug = await evaluate(`JSON.stringify({ href: document.querySelector('#preview-iframe-child')?.contentWindow?.location?.href || '', body: document.querySelector('#preview-iframe-child')?.contentDocument?.body?.innerText || '', state: document.querySelector('#preview-iframe-status')?.textContent || '' })`);
      throw new Error(`iframeBridge did not become ready: ${childDebug}`);
    }
    await evaluate(`document.querySelector('#preview-iframe-request').click()`);
    await sleep(350);
    const bridgeResult = await evaluate(`document.querySelector('#preview-iframe-status')?.textContent || ''`);
    assert(/request\(health\)|ok/.test(bridgeResult), `iframeBridge request result was not rendered: ${bridgeResult.slice(0, 240)}`);

    const visit = async id => {
      await evaluate(`document.querySelector('#component-sidebar .component-nav-item[data-id="${id}"]').click()`);
      await sleep(450);
    };
    await visit('http');
    await evaluate(`document.querySelector('#preview-http-request').click()`);
    await sleep(500);
    const httpResult = await evaluate(`document.querySelector('#preview-http-output')?.textContent || ''`);
    assert(/"status": 200/.test(httpResult) && /JquanUI/.test(httpResult), `HTTP preview request failed: ${httpResult.slice(0, 240)}`);

    await visit('carousel');
    const carouselDocs = await evaluate(`({ schema: document.body.textContent.includes('API 参数摘要'), lifecycle: document.body.textContent.includes('最小运行闭环'), next: document.body.textContent.includes('next()') })`);
    assert(carouselDocs.schema && carouselDocs.lifecycle && carouselDocs.next, `Carousel schema/example documentation did not render: ${JSON.stringify(carouselDocs)}`);
    await visit('tabs');
    const tabsDocs = await evaluate(`({ schema: document.body.textContent.includes('API 参数摘要'), lifecycle: document.body.textContent.includes('最小运行闭环'), destroy: document.body.textContent.includes('destroy()') })`);
    assert(tabsDocs.schema && tabsDocs.lifecycle && tabsDocs.destroy, `Tabs schema/example documentation did not render: ${JSON.stringify(tabsDocs)}`);

    await visit('i18n');
    await evaluate(`document.querySelector('#preview-lang-en').click()`);
    await sleep(150);
    const i18nResult = await evaluate(`({ text: document.querySelector('#preview-i18n-bound')?.textContent || '', placeholder: document.querySelector('#preview-i18n-placeholder')?.getAttribute('placeholder') || '' })`);
    assert(/data-i18n/.test(i18nResult.text) && i18nResult.placeholder === 'Search by keyword', `i18n preview did not translate bound DOM: ${JSON.stringify(i18nResult)}`);

    await visit('storage');
    await evaluate(`document.querySelector('#preview-storage-set').click()`);
    await evaluate(`document.querySelector('#preview-storage-read').click()`);
    const storageResult = await evaluate(`document.querySelector('#preview-storage-output')?.textContent || ''`);
    assert(/components/.test(storageResult), `Storage preview read failed: ${storageResult.slice(0, 240)}`);

    await visit('filterBuilder');
    const filterBefore = await evaluate(`document.querySelectorAll('#preview-filter-builder [jq-filter-builder-row]').length`);
    await evaluate(`document.querySelector('#preview-filter-append').click()`);
    const filterAfter = await evaluate(`document.querySelectorAll('#preview-filter-builder [jq-filter-builder-row]').length`);
    assert(filterAfter === filterBefore + 1, `FilterBuilder append failed: ${filterBefore} -> ${filterAfter}.`);

    await visit('crud');
    assert(await evaluate(`document.querySelector('#preview-crud-root')?.textContent.trim().length > 0`), 'Crud preview did not render its table.');
    await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
    await sleep(250);
    const mobileLayout = await evaluate(`({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth })`);
    assert(mobileLayout.scrollWidth <= mobileLayout.clientWidth + 1, `Component documentation overflows at 390px: ${JSON.stringify(mobileLayout)}`);
    await command('Emulation.clearDeviceMetricsOverride');

    await command('Page.navigate', { url: `http://127.0.0.1:${port}/admin-blocks.html?browser-check=${Date.now()}` });
    await evaluate(`new Promise(resolve => { const started = Date.now(); const poll = () => { const category = document.querySelector('#block-sidebar [data-cat]'); const heading = document.querySelector('#block-app h1'); const enhanced = category && heading && getComputedStyle(category).paddingTop !== '0px' && getComputedStyle(heading).fontSize !== '0px'; if ((document.querySelectorAll('#block-sidebar [data-cat]').length === 7 && document.querySelector('#block-app > *') && enhanced) || Date.now() - started > 9000) resolve(); else setTimeout(poll, 100); }; poll(); })`);

    const blocksInitial = await evaluate(`({
      categories: document.querySelectorAll('#block-sidebar [data-cat]').length,
      appChildren: document.querySelector('#block-app')?.children.length || 0,
      sidebarClass: document.querySelector('#block-sidebar')?.closest('aside')?.className || '',
      sidebarPadding: document.querySelector('#block-sidebar [data-cat]') ? getComputedStyle(document.querySelector('#block-sidebar [data-cat]')).paddingTop : '0px',
      headingSize: document.querySelector('#block-app h1') ? getComputedStyle(document.querySelector('#block-app h1')).fontSize : '0px'
    })`);
    assert(blocksInitial.categories === 7, `Expected 7 admin block categories, received ${blocksInitial.categories}.`);
    assert(blocksInitial.appChildren === 1, 'Admin blocks main content was not rendered.');
    assert(blocksInitial.sidebarClass.includes('w-64') && blocksInitial.sidebarPadding !== '0px' && blocksInitial.headingSize !== '0px', `Admin blocks dynamic content was not enhanced synchronously: ${JSON.stringify(blocksInitial)}`);

    await evaluate(`document.querySelector('#block-sidebar [data-cat]:not(:first-child)')?.click()`);
    await sleep(150);
    assert(await evaluate(`document.querySelector('#block-app')?.children.length === 1`), 'Admin blocks category navigation did not render.');

    await evaluate(`document.querySelector('#block-sidebar [data-cat="UI 组件"]')?.click()`);
    await evaluate(`new Promise(resolve => { const started = Date.now(); const poll = () => { const rendered = document.querySelectorAll('#block-app [data-ui-component-card] pre[jq-code-rendered="true"]').length; if (rendered === 42 || Date.now() - started > 8000) resolve(); else setTimeout(poll, 100); }; poll(); })`);
    const uiShowcase = await evaluate(`({
      cards: document.querySelectorAll('#block-app [data-ui-component-card]').length,
      codeBlocks: document.querySelectorAll('#block-app [data-ui-component-card] [id^="ui-code-"]').length,
      copyButtons: document.querySelectorAll('#block-app [data-ui-copy]').length,
      fivePartCards: Array.from(document.querySelectorAll('#block-app [data-ui-component-card]')).filter(card => ['说明', '演示', '交互', '实时反馈', '可复制代码'].every(label => card.textContent.includes(label))).length,
      title: document.querySelector('#block-app h1')?.textContent || ''
    })`);
    assert(uiShowcase.cards === 42 && uiShowcase.codeBlocks === 42 && uiShowcase.copyButtons === 42 && uiShowcase.fivePartCards === 42 && uiShowcase.title === 'UI 组件', `UI component showcase did not render completely: ${JSON.stringify(uiShowcase)}`);
    const uiButtonBefore = await evaluate(`(() => { const node = document.querySelector('#block-app [data-ui-interact]'); return { exists: Boolean(node), connected: Boolean(node?.isConnected), disabled: Boolean(node?.disabled), onclick: typeof node?.onclick, html: node?.outerHTML || '' }; })()`);
    await evaluate(`document.querySelector('#block-app [data-ui-interact]')?.click()`);
    const uiFeedback = await evaluate(`document.querySelector('#block-app [data-ui-feedback]')?.textContent || ''`);
    assert(/已触发交互/.test(uiFeedback), `UI component interaction feedback did not update: ${JSON.stringify({ uiButtonBefore, uiFeedback })}`);

    assert(consoleErrors.length === 0, `Component documentation browser console errors: ${consoleErrors.join(' | ')}`);
    socket.close();
    console.log(`[JquanUI] component documentation browser check ok (${version.Browser || 'Edge'}, 76 modules, admin blocks, mobile 390px)`);
  } finally {
    server.close();
    browser.kill();
    if (socket && socket.readyState === 1) socket.close();
  }
}

main().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
