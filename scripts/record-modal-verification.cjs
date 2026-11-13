'use strict';
const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const root = path.resolve(__dirname, '..');
const evidence = path.join(root, 'verification/modal-overlay');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const originals = JSON.parse(fs.readFileSync(path.join(evidence, 'original-hashes.json'), 'utf8'));
const originalHash = originals['dist/components/modal.js'];
for (const [relative, expected] of Object.entries(originals)) assert.equal(hash(path.join(evidence, 'original', relative)), expected, `Original modified: ${relative}`);
assert.equal(hash(path.join(evidence, 'BASELINE.js')), originalHash);
fs.copyFileSync(path.join(root, 'dist/components/modal.js'), path.join(evidence, 'MODIFIED_FILE.js'));
fs.copyFileSync(path.join(evidence, 'MODIFIED_FILE.js'), path.join(evidence, 'rollback-copy.js'));
const records = [];
function run(label, executable, args, command, input = 'Arguments shown in command; no stdin.') {
    const result = spawnSync(executable, args, { cwd: root, encoding: 'utf8', windowsHide: true });
    if (result.error) throw result.error;
    const output = (result.stdout + result.stderr).trim();
    records.push({ label, command, input, output, exit: result.status });
    assert.equal(result.status, 0, `${label}: ${output}`);
    console.log(`${label}: ${output} (exit ${result.status})`);
}
const probeInput = 'Modal file and expected old/new behavior. Browser opens Dialog then Modal, sends native CDP Escape and waits 260ms; no stdin.';
for (const [label, file, expected] of [['BASELINE', 'BASELINE.js', 'old'], ['MODIFIED', 'MODIFIED_FILE.js', 'new']]) {
    run(label, process.execPath, ['scripts/check-modal-browser.cjs', '--probe', file, expected], `node scripts/check-modal-browser.cjs --probe ${file} ${expected}`, probeInput);
}
const bash = 'C:/Program Files/Git/bin/bash.exe';
run('ROLLBACK_PREPARE', bash, ['-c', 'chmod +x verification/modal-overlay/ROLLBACK.sh && test -x verification/modal-overlay/ROLLBACK.sh'], 'bash -c "chmod +x verification/modal-overlay/ROLLBACK.sh && test -x verification/modal-overlay/ROLLBACK.sh"');
run('ROLLBACK', bash, ['verification/modal-overlay/ROLLBACK.sh', 'verification/modal-overlay/rollback-copy.js'], 'bash verification/modal-overlay/ROLLBACK.sh verification/modal-overlay/rollback-copy.js');
run('ROLLBACK_BEHAVIOR', process.execPath, ['scripts/check-modal-browser.cjs', '--probe', 'rollback-copy.js', 'old'], 'node scripts/check-modal-browser.cjs --probe rollback-copy.js old', probeInput);
assert.equal(hash(path.join(evidence, 'rollback-copy.js')), originalHash);
assert.equal(hash(path.join(evidence, 'MODIFIED_FILE.js')), hash(path.join(root, 'dist/components/modal.js')));
assert.notEqual(hash(path.join(evidence, 'MODIFIED_FILE.js')), originalHash);
for (const script of ['check-documentation.cjs', 'check-component-documentation.cjs', 'check-manifest.cjs']) run('FINAL_CHECK', process.execPath, [`scripts/${script}`], `node scripts/${script}`);
run('BUNDLES', process.execPath, ['scripts/build-component-bundles.cjs', '--check'], 'node scripts/build-component-bundles.cjs --check');
const modified = path.join(evidence, 'modified');
function snapshot(relative) {
    const target = path.join(modified, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(root, relative), target);
}
for (const relative of Object.keys(originals)) snapshot(relative);
for (const relative of ['dist/components/modal.d.ts', 'dist/components/drawer.d.ts', 'scripts/check-modal-browser.cjs', 'scripts/modal-browser-fixture.html', 'scripts/record-modal-verification.cjs', 'verification/modal-overlay/types-consumer.ts', 'verification/modal-overlay/ROLLBACK.sh']) snapshot(relative);
const diff = spawnSync('git', ['diff', '--no-index', '--text', '--', 'verification/modal-overlay/original', 'verification/modal-overlay/modified'], { cwd: root, encoding: 'utf8', windowsHide: true, maxBuffer: 16 * 1024 * 1024 });
assert.equal(diff.status, 1, 'Expected a non-empty diff');
fs.writeFileSync(path.join(evidence, 'DIFF_FILE.patch'), diff.stdout.replace(/([ab])\/verification\/modal-overlay\/(?:original|modified)\//g, '$1/'));
const artifacts = ['MODIFIED_FILE.js', 'DIFF_FILE.patch', 'VERIFICATION.txt', 'ROLLBACK.sh'].map(file => path.join(evidence, file));
const budget = JSON.parse(fs.readFileSync(path.join(evidence, 'original/dist/manifest.json'), 'utf8')).budgets;
const earlier = [
    ['node scripts/check-modal-browser.cjs', '[JquanUI] modal browser core ok (51 fixture assertions; native Escape/Tab, focus, scroll)\n[JquanUI] modal browser min ok (51 fixture assertions; native Escape/Tab, focus, scroll)\n[JquanUI] modal browser full ok (51 fixture assertions; native Escape/Tab, focus, scroll)\n[JquanUI] modal browser check ok (Core, minified, Full)'],
    ['node scripts/check-overlay-browser.cjs', '[JquanUI] overlay browser core ok (47 fixture assertions; native Escape/Tab, focus, scroll)\n[JquanUI] overlay browser min ok (47 fixture assertions; native Escape/Tab, focus, scroll)\n[JquanUI] overlay browser full ok (47 fixture assertions; native Escape/Tab, focus, scroll)\n[JquanUI] overlay browser check ok (Core, minified, Full)'],
    ['npx --yes --package typescript tsc --noEmit --strict --lib ES2022,DOM --module Node16 --moduleResolution Node16 verification/modal-overlay/types-consumer.ts verification/overlay-manager/types-consumer.ts verification/table-runtime/types-consumer.ts', '(empty)'],
    ['node scripts/check-component-import.cjs', '[JquanUI] component import check ok (44 assertions)'],
    ['node scripts/check-component-import-browser.cjs', '[JquanUI] component import browser core ok (14 installed, 16 scripts)\n[JquanUI] component import browser min ok (14 installed, 16 scripts)\n[JquanUI] component import browser full ok (14 installed, 3 scripts)\n[JquanUI] component import browser check ok (Core, minified, Full; CSP, dependencies, DOM/Table, dedupe, retry)'],
    ['node scripts/check-core-regressions.cjs', '[JquanUI] core regression check ok'],
    ['node scripts/check-types-surface.cjs', '[JquanUI] types surface check ok'],
    ['node scripts/check-package.cjs', '[JquanUI] package metadata check ok'],
    ['node scripts/build-component-import.cjs --check', '[JquanUI] component importer check ok (78 components)'],
    ['python -X utf8 C:/Users/Jquan/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/jquanui', 'Skill is valid!']
];
const report = [
    'Changed branch/fields: Modal 2.1 -> 2.2 and Drawer 1.1 -> 1.2 share OverlayManager 1.1. Modal requires jquanui-overlay-manager; shared onRequestClose/requestClose/update/focus/minimum zIndex/scrollbar compensation and overlay-change event. Modal state: destroyed/isClosing/busy/closePending/isTop; async beforeClose dedupe and invalidation; animation resources retained until release; Drawer cumulative options and same-id/reentrant cleanup.',
    'FormValidator 1.1 preserves explicit mount options during automatic enhancement, ignores removed nodes during delayed scans, and protects replacement instances from old cleanup. Modal owns submit flow and cleans up validator handles.',
    `Original Modal SHA256: ${originalHash}`,
    `Modified Modal SHA256: ${hash(path.join(evidence, 'MODIFIED_FILE.js'))}`,
    'Artifacts:', ...artifacts,
    '', ...records.flatMap(record => [record.label, `Command: ${record.command}`, `Input: ${record.input}`, `Literal output: ${record.output || '(empty)'}`, `Exit status: ${record.exit}`, '']),
    `Restored behavior/status: rollback-copy.js matches original Modal SHA256; Escape closes Dialog and Modal and leaves overflow hidden. MODIFIED_FILE.js and live Modal remain changed: Escape closes only Modal, leaving Dialog open and its lock active. Closing the last layer restores overflow axes/padding/priority. All ${Object.keys(originals).length} original snapshots retain their hashes.`,
    'Earlier completed checks (literal observed outputs, not rerun by this recorder):',
    ...earlier.flatMap(([command, output]) => [`Command: ${command}`, 'Input: arguments shown; no stdin.', `Literal output: ${output}`, 'Exit status: 0', '']),
    'Browser suite executes actual Modal/Drawer documentation examples and native Tab in both Modal and underlying Dialog. It also covers form submit/validation, image navigation, confirm/promise, lifecycle guards, detached cleanup, same-id replacement and reentrant callbacks.',
    'Intermediate browser navigation failures exposed FormValidator remount/native submission; corrected with reuse and Modal-owned submit. An importer fixture had assumed the old modal->drawer chain and now models overlayManager->modal->drawer. A replacement test exposed delayed enhancement of a detached old form; the final connected-node guard passes that test.',
    'Catalog/Core/minified/Components/Full, explicit subpath types, browser globals, developer docs and project skill synchronized. Metadata regenerated in two passes. Package remains 4.72.0.',
    `Pre-existing package budget: original unpackedBytes=${budget.unpackedBytes}, maxUnpackedBytes=${budget.maxUnpackedBytes}. Full npm run verify is not claimed as passing.`,
    'Popover/Select migration, positioning, portals, background inert and cross-ShadowRoot/iframe focus remain future work.',
    'ROLLBACK.sh restores the specified Modal copy only; original/ preserves all changed existing-file snapshots. The live project, Drawer and supporting services remain modified.'
].join('\n') + '\n';
fs.writeFileSync(path.join(evidence, 'VERIFICATION.txt'), report);
for (const file of artifacts) assert(fs.readFileSync(file).length > 0, `Empty artifact: ${file}`);
console.log('Four artifacts reopened; executable rollback, original hashes and restored behavior verified; live Modal remains modified.');
