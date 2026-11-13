'use strict';
const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const root = path.resolve(__dirname, '..');
const evidence = path.join(root, 'verification/select-overlay');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const originals = JSON.parse(fs.readFileSync(path.join(evidence, 'original-hashes.json'), 'utf8'));
const originalHash = originals['dist/components/select.js'];
for (const [relative, expected] of Object.entries(originals)) assert.equal(hash(path.join(evidence, 'original', relative)), expected, `Original modified: ${relative}`);
assert.equal(hash(path.join(evidence, 'BASELINE.js')), originalHash);
fs.copyFileSync(path.join(root, 'dist/components/select.js'), path.join(evidence, 'MODIFIED_FILE.js'));
fs.copyFileSync(path.join(evidence, 'MODIFIED_FILE.js'), path.join(evidence, 'rollback-copy.js'));
const records = [];
function run(label, executable, args, command, input = 'Arguments shown in command; no stdin.') {
  const result = spawnSync(executable, args, { cwd: root, encoding: 'utf8', windowsHide: true });
  if (result.error) throw result.error;
  const output = (result.stdout + result.stderr).trim();
  records.push({ label, command, input, output, exit: result.status });
  assert.equal(result.status, 0, `${label}: ${output}`);
  console.log(`${label}: ${output || '(empty)'} (exit ${result.status})`);
}
const probeInput = 'Select file and expected old/new behavior. Browser opens Modal then an inner Select, sends native CDP Escape and waits 260ms; no stdin.';
for (const [label, file, expected] of [['BASELINE', 'BASELINE.js', 'old'], ['MODIFIED', 'MODIFIED_FILE.js', 'new']]) run(label, process.execPath, ['scripts/check-select-browser.cjs', '--probe', file, expected], `node scripts/check-select-browser.cjs --probe ${file} ${expected}`, probeInput);
const bash = 'C:/Program Files/Git/bin/bash.exe';
run('ROLLBACK_PREPARE', bash, ['-c', 'chmod +x verification/select-overlay/ROLLBACK.sh && test -x verification/select-overlay/ROLLBACK.sh'], 'bash -c "chmod +x verification/select-overlay/ROLLBACK.sh && test -x verification/select-overlay/ROLLBACK.sh"');
run('ROLLBACK', bash, ['verification/select-overlay/ROLLBACK.sh', 'verification/select-overlay/rollback-copy.js'], 'bash verification/select-overlay/ROLLBACK.sh verification/select-overlay/rollback-copy.js');
run('ROLLBACK_BEHAVIOR', process.execPath, ['scripts/check-select-browser.cjs', '--probe', 'rollback-copy.js', 'old'], 'node scripts/check-select-browser.cjs --probe rollback-copy.js old', probeInput);
assert.equal(hash(path.join(evidence, 'rollback-copy.js')), originalHash);
assert.equal(hash(path.join(evidence, 'MODIFIED_FILE.js')), hash(path.join(root, 'dist/components/select.js')));
assert.notEqual(hash(path.join(evidence, 'MODIFIED_FILE.js')), originalHash);
for (const script of ['check-documentation.cjs', 'check-component-documentation.cjs', 'check-manifest.cjs', 'check-component-import.cjs']) run('FINAL_CHECK', process.execPath, [`scripts/${script}`], `node scripts/${script}`);
for (const script of ['build-component-bundles.cjs', 'build-component-import.cjs']) run('GENERATED', process.execPath, [`scripts/${script}`, '--check'], `node scripts/${script} --check`);
run('SKILL', 'python', ['-X', 'utf8', 'C:/Users/Jquan/.codex/skills/.system/skill-creator/scripts/quick_validate.py', 'skills/jquanui'], 'python -X utf8 C:/Users/Jquan/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/jquanui');
const modified = path.join(evidence, 'modified');
function snapshot(relative) { const target = path.join(modified, relative); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.copyFileSync(path.join(root, relative), target); }
for (const relative of Object.keys(originals)) snapshot(relative);
for (const relative of ['dist/components/select.d.ts', 'scripts/check-select-browser.cjs', 'scripts/select-browser-fixture.html', 'scripts/record-select-verification.cjs', 'verification/select-overlay/types-consumer.ts', 'verification/select-overlay/ROLLBACK.sh']) snapshot(relative);
const diff = spawnSync('git', ['diff', '--no-index', '--text', '--', 'verification/select-overlay/original', 'verification/select-overlay/modified'], { cwd: root, encoding: 'utf8', windowsHide: true, maxBuffer: 16 * 1024 * 1024 });
assert.equal(diff.status, 1, 'Expected a non-empty diff');
fs.writeFileSync(path.join(evidence, 'DIFF_FILE.patch'), diff.stdout.replace(/([ab])\/verification\/select-overlay\/(?:original|modified)\//g, '$1/'));
const artifacts = ['MODIFIED_FILE.js', 'DIFF_FILE.patch', 'VERIFICATION.txt', 'ROLLBACK.sh'].map(file => path.join(evidence, file));
const budget = JSON.parse(fs.readFileSync(path.join(evidence, 'original/dist/manifest.json'), 'utf8')).budgets;
const earlier = [
  ['node scripts/check-select-browser.cjs', '[JquanUI] select browser core ok (24 fixture assertions; native Escape, remote, ARIA, stack)\n[JquanUI] select browser min ok (24 fixture assertions; native Escape, remote, ARIA, stack)\n[JquanUI] select browser full ok (24 fixture assertions; native Escape, remote, ARIA, stack)\n[JquanUI] select browser check ok (Core, minified, Full)'],
  ['node scripts/check-modal-browser.cjs', '[JquanUI] modal browser core ok (51 fixture assertions; native Escape/Tab, focus, scroll)\n[JquanUI] modal browser min ok (51 fixture assertions; native Escape/Tab, focus, scroll)\n[JquanUI] modal browser full ok (51 fixture assertions; native Escape/Tab, focus, scroll)\n[JquanUI] modal browser check ok (Core, minified, Full)'],
  ['node scripts/check-overlay-browser.cjs', '[JquanUI] overlay browser core ok (47 fixture assertions; native Escape/Tab, focus, scroll)\n[JquanUI] overlay browser min ok (47 fixture assertions; native Escape/Tab, focus, scroll)\n[JquanUI] overlay browser full ok (47 fixture assertions; native Escape/Tab, focus, scroll)\n[JquanUI] overlay browser check ok (Core, minified, Full)'],
  ['npx --yes --package typescript tsc --noEmit --strict --lib ES2022,DOM --module Node16 --moduleResolution Node16 verification/select-overlay/types-consumer.ts verification/modal-overlay/types-consumer.ts verification/overlay-manager/types-consumer.ts', '(empty)'],
  ['node scripts/check-component-import-browser.cjs', '[JquanUI] component import browser core ok (14 installed, 16 scripts)\n[JquanUI] component import browser min ok (14 installed, 16 scripts)\n[JquanUI] component import browser full ok (14 installed, 3 scripts)\n[JquanUI] component import browser check ok (Core, minified, Full; CSP, dependencies, DOM/Table, dedupe, retry)'],
  ['node scripts/check-core-regressions.cjs', '[JquanUI] core regression check ok'],
  ['node scripts/check-types-surface.cjs', '[JquanUI] types surface check ok'],
  ['node scripts/check-package.cjs', '[JquanUI] package metadata check ok']
];
const report = [
  'Changed branch/fields: Select 1.0 -> 1.1 uses OverlayManager 1.3 via requires: jquanui-overlay-manager. Shared outsideElements, autoFocus, update(returnFocus); Select trigger/list/panel ARIA semantics, stable handle identity, ownerElement and shared top-layer Escape/Tab/click replace independent pointerdown/Escape handlers. Native value/change synchronization is retained.',
  'Behavior changes: Select never locks body scrolling; replacement/destroy suppress stale focus and late remote results. Old handles cannot affect replacement instances. Remote requestId and AbortController keep only the latest search result.',
  `Original Select SHA256: ${originalHash}`,
  `Modified Select SHA256: ${hash(path.join(evidence, 'MODIFIED_FILE.js'))}`,
  'Artifacts:', ...artifacts, '',
  ...records.flatMap(record => [record.label, `Command: ${record.command}`, `Input: ${record.input}`, `Literal output: ${record.output || '(empty)'}`, `Exit status: ${record.exit}`, '']),
  `Restored behavior/status: rollback-copy.js matches original Select SHA256; native Escape closes Modal while the old Select remains open with stack=0. MODIFIED_FILE.js and live Select remain changed: Escape closes only Select, preserving Modal and stack=1. All ${Object.keys(originals).length} original snapshots retain their hashes. ROLLBACK.sh restores only the requested Select copy; supporting files and live project remain modified.`,
  'Earlier completed checks (literal observed outputs, not rerun by this recorder):',
  ...earlier.flatMap(([command, output]) => [`Command: ${command}`, 'Input: arguments shown; no stdin.', `Literal output: ${output}`, 'Exit status: 0', '']),
  'Browser coverage includes actual developer documentation example execution, native Escape/Tab/Shift-Tab/trigger and outside mouse click, mixed Select-inside-Modal stacks, native option synchronization, max selections, remote request races, ARIA, detach and stale-handle cleanup.',
  'The Select fixture runs against Core, minified Core and Full; each entry passes the same 24 assertions.',
  'Core importer catalog, minified Core, Components/Full, component types, browser globals, package exports, docs and project skill synchronized. Only importer catalog changed in Core; parser/scanner/performance paths unchanged. Package remains 4.72.0. Installed user skill was left untouched.',
  `Pre-existing package budget: original unpackedBytes=${budget.unpackedBytes}, maxUnpackedBytes=${budget.maxUnpackedBytes}; budgets were not changed. Full npm run verify is not claimed as passing.`,
  'Select migration/remote combobox lifecycle, shared positioning, portals, background inert and cross-ShadowRoot/iframe focus remain future work.'
].join('\n') + '\n';
fs.writeFileSync(path.join(evidence, 'VERIFICATION.txt'), report);
for (const file of artifacts) assert(fs.readFileSync(file).length > 0, `Empty artifact: ${file}`);
console.log('Four artifacts reopened; executable rollback, original hashes and restored behavior verified; live Select remains modified.');
