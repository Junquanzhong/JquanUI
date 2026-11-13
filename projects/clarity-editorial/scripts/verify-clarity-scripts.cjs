const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..', '..', '..');
const files = [
  'projects/clarity-editorial/jquan.config.cjs',
  'projects/clarity-editorial/design-system/tokens/clarity-jquan.config.js',
  'projects/clarity-editorial/scripts/clarity-interactions.js',
  'projects/clarity-editorial/scripts/clarity-preferences.js',
  'scripts/verify-clarity-pages.cjs'
];
for (const relative of files) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) throw new Error(`missing script: ${relative}`);
  execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
}
const interactions = fs.readFileSync(path.join(root, 'projects/clarity-editorial/scripts/clarity-interactions.js'), 'utf8');
if (!interactions.includes("root.setAttribute('data-popover-trigger', 'click')")) throw new Error('clarity interactions: popover click trigger mode is required');
if (!interactions.includes("panel.addEventListener('mouseenter', clearClose)")) throw new Error('clarity interactions: popover panel hover retention is required');
if (!interactions.includes("closeTimer = window.setTimeout(function () { handle.close(); }, 420)")) throw new Error('clarity interactions: popover delayed close is required');
if (!interactions.includes("event.stopImmediatePropagation()")) throw new Error('clarity interactions: popover click fallback must prevent toggle races');
if (!interactions.includes("root.setAttribute('data-popover-align', options.align || 'center')")) throw new Error('clarity interactions: popover alignment attribute is required');
if (!interactions.includes("triggerRect.bottom - panelHeight")) throw new Error('clarity interactions: end-aligned popover positioning is required');
if (!interactions.includes("panel.style.transformOrigin = 'left bottom'")) throw new Error('clarity interactions: end-aligned popover transform origin is required');
console.log('clarity script verification passed');
