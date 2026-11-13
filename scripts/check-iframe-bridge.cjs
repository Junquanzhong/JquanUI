'use strict';

const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('dist/components/iframeBridge.js', 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function createWindow(origin) {
  const listeners = new Set();
  const target = {
    origin,
    window: null,
    location: { origin, href: `${origin}/index.html` },
    JquanUIComponents: {},
    addEventListener(type, listener) { if (type === 'message') listeners.add(listener); },
    removeEventListener(type, listener) { if (type === 'message') listeners.delete(listener); },
    receive(event) { listeners.forEach(listener => listener(event)); },
    setInterval,
    clearInterval,
    setTimeout,
    clearTimeout,
    URL,
    document: { referrer: `${origin}/parent.html`, querySelector() { return null; } }
  };
  target.window = target;
  return target;
}

function createWindowPair(parent, child) {
  const parentProxy = {
    postMessage(message, targetOrigin, transfer = []) {
      parent.receive({ data: message, origin: child.origin, source: childProxy, ports: transfer });
    }
  };
  const childProxy = {
    postMessage(message, targetOrigin, transfer = []) {
      child.receive({ data: message, origin: parent.origin, source: parentProxy, ports: transfer });
    }
  };
  return { parentProxy, childProxy };
}

(async () => {
  const parent = createWindow('https://parent.example');
  const child = createWindow('https://child.example');
  const { parentProxy, childProxy } = createWindowPair(parent, child);
  const iframe = {
    contentWindow: childProxy,
    addEventListener() {},
    removeEventListener() {},
    getAttribute() { return 'https://child.example/app.html'; }
  };
  parent.document.querySelector = () => iframe;
  vm.runInNewContext(source, parent);
  const parentBridge = parent.JquanUIComponents.iframeBridgeApi.createParent({ iframe, targetOrigin: 'https://child.example', channel: false, handshakeInterval: 20 });
  const childContext = { ...child, window: child, parent: parentProxy };
  vm.runInNewContext(source, childContext);
  const actualChildBridge = childContext.JquanUIComponents.iframeBridgeApi.createChild({ parentWindow: parentProxy, targetOrigin: 'https://parent.example', channel: false, handshakeInterval: 20 });
  await Promise.all([parentBridge.ready(), actualChildBridge.ready()]);
  assert(parentBridge.state().ready && actualChildBridge.state().ready, 'iframe handshake failed');

  let eventPayload = null;
  actualChildBridge.on('refresh', payload => { eventPayload = payload; });
  assert(parentBridge.send('refresh', { page: 2 }), 'iframe event send failed');
  assert(eventPayload.page === 2, 'iframe event payload failed');

  actualChildBridge.on('request:health', () => ({ ok: true, source: 'child' }));
  const response = await parentBridge.request('health', { probe: true });
  assert(response.ok === true && response.source === 'child', 'iframe request response failed');

  let rejected = false;
  try { vm.runInNewContext(source, createWindow('https://other.example')).JquanUIComponents.iframeBridgeApi.createChild({ parentWindow: parentProxy, targetOrigin: '*' }); } catch (error) { rejected = error instanceof TypeError; }
  assert(rejected, 'wildcard target origin was not rejected');

  parentBridge.destroy();
  actualChildBridge.destroy();
  assert(parentBridge.state().ready === true, 'destroy changed historical state unexpectedly');
  console.log('[JquanUI] iframe bridge check ok');
})().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
