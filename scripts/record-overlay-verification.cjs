'use strict';
const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const root = path.resolve(__dirname, '..');
const evidence = path.join(root, 'verification/overlay-manager');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const originals = JSON.parse(fs.readFileSync(path.join(evidence, 'original-hashes.json'), 'utf8'));
const originalHash = originals['dist/components/dialog.js'];
for (const [relative, expected] of Object.entries(originals)) assert.equal(hash(path.join(evidence, 'original', relative)), expected, `Original modified: ${relative}`);
assert.equal(hash(path.join(evidence, 'BASELINE.js')), originalHash);
fs.copyFileSync(path.join(root, 'dist/components/dialog.js'), path.join(evidence, 'MODIFIED_FILE.js'));
fs.copyFileSync(path.join(evidence, 'MODIFIED_FILE.js'), path.join(evidence, 'rollback-copy.js'));
const records = [];
function run(label, executable, args, command, input) {
    const result = spawnSync(executable, args, { cwd: root, encoding: 'utf8', windowsHide: true });
    if (result.error) throw result.error;
    const output = (result.stdout + result.stderr).trim();
    records.push({ label, command, input: input || 'Arguments shown in command; no stdin.', output, exit: result.status });
    assert.equal(result.status, 0, `${label}: ${output}`);
    console.log(`${label}: ${output} (exit ${result.status})`);
}
const probeInput = 'Dialog file and expected old/new behavior. Real browser opens parent and child via declarative triggers, then dispatches a native CDP Escape; no stdin.';
for (const [label, file, expected] of [['BASELINE', 'BASELINE.js', 'old'], ['MODIFIED', 'MODIFIED_FILE.js', 'new']]) {
    run(label, process.execPath, ['scripts/check-overlay-browser.cjs', '--probe', file, expected], `node scripts/check-overlay-browser.cjs --probe ${file} ${expected}`, probeInput);
}
const bash = 'C:/Program Files/Git/bin/bash.exe';
run('ROLLBACK_PREPARE', bash, ['-c', 'chmod +x verification/overlay-manager/ROLLBACK.sh && test -x verification/overlay-manager/ROLLBACK.sh'], 'bash -c "chmod +x verification/overlay-manager/ROLLBACK.sh && test -x verification/overlay-manager/ROLLBACK.sh"');
run('ROLLBACK', bash, ['verification/overlay-manager/ROLLBACK.sh', 'verification/overlay-manager/rollback-copy.js'], 'bash verification/overlay-manager/ROLLBACK.sh verification/overlay-manager/rollback-copy.js');
run('ROLLBACK_BEHAVIOR', process.execPath, ['scripts/check-overlay-browser.cjs', '--probe', 'rollback-copy.js', 'old'], 'node scripts/check-overlay-browser.cjs --probe rollback-copy.js old', probeInput);
assert.equal(hash(path.join(evidence, 'rollback-copy.js')), originalHash);
assert.equal(hash(path.join(evidence, 'MODIFIED_FILE.js')), hash(path.join(root, 'dist/components/dialog.js')));
assert.notEqual(hash(path.join(evidence, 'MODIFIED_FILE.js')), originalHash);
for (const script of ['check-documentation.cjs', 'check-component-documentation.cjs', 'check-manifest.cjs']) {
    run('FINAL_CHECK', process.execPath, [`scripts/${script}`], `node scripts/${script}`);
}
const modified = path.join(evidence, 'modified');
function snapshot(relative) {
    const target = path.join(modified, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(root, relative), target);
}
for (const relative of Object.keys(originals)) snapshot(relative);
for (const relative of ['dist/components/overlayManager.js', 'dist/components/overlayManager.d.ts', 'content/components/overlayManager.js', 'scripts/check-overlay-browser.cjs', 'scripts/overlay-browser-fixture.html', 'scripts/record-overlay-verification.cjs', 'verification/overlay-manager/types-consumer.ts', 'verification/overlay-manager/ROLLBACK.sh']) snapshot(relative);
const diff = spawnSync('git', ['diff', '--no-index', '--text', '--', 'verification/overlay-manager/original', 'verification/overlay-manager/modified'], { cwd: root, encoding: 'utf8', windowsHide: true, maxBuffer: 16 * 1024 * 1024 });
assert.equal(diff.status, 1, 'Expected a non-empty diff');
fs.writeFileSync(path.join(evidence, 'DIFF_FILE.patch'), diff.stdout.replace(/([ab])\/verification\/overlay-manager\/(?:original|modified)\//g, '$1/'));
const artifacts = ['MODIFIED_FILE.js', 'DIFF_FILE.patch', 'VERIFICATION.txt', 'ROLLBACK.sh'].map(file => path.join(evidence, file));
const budget = JSON.parse(fs.readFileSync(path.join(evidence, 'original/dist/manifest.json'), 'utf8')).budgets;
const completed = [
    ['node scripts/check-overlay-browser.cjs', '[JquanUI] overlay browser core ok (47 fixture assertions; native Escape/Tab, focus, scroll)\n[JquanUI] overlay browser min ok (47 fixture assertions; native Escape/Tab, focus, scroll)\n[JquanUI] overlay browser full ok (47 fixture assertions; native Escape/Tab, focus, scroll)\n[JquanUI] overlay browser check ok (Core, minified, Full)'],
    ['npx --yes --package typescript tsc --noEmit --strict --lib ES2022,DOM --module Node16 --moduleResolution Node16 verification/overlay-manager/types-consumer.ts verification/table-runtime/types-consumer.ts', '(empty)'],
    ['node scripts/check-component-import.cjs', '[JquanUI] component import check ok (44 assertions)'],
    ['node scripts/check-component-import-browser.cjs', '[JquanUI] component import browser core ok (13 installed, 15 scripts)\n[JquanUI] component import browser min ok (13 installed, 15 scripts)\n[JquanUI] component import browser full ok (13 installed, 3 scripts)\n[JquanUI] component import browser check ok (Core, minified, Full; CSP, dependencies, DOM/Table, dedupe, retry)'],
    ['node scripts/check-core-regressions.cjs', '[JquanUI] core regression check ok'],
    ['node scripts/check-types-surface.cjs', '[JquanUI] types surface check ok'],
    ['node scripts/check-package.cjs', '[JquanUI] package metadata check ok'],
    ['node scripts/build-component-import.cjs --check', '[JquanUI] component importer check ok (78 components)'],
    ['node scripts/build-component-bundles.cjs --check', '[JquanUI] component bundle check ok (76 all, 38 full)'],
    ['python -X utf8 C:/Users/Jquan/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/jquanui', 'Skill is valid!']
];
const report = [
    'Changed branch/fields: new OverlayManager 1.0 service; Dialog 1.0 -> 1.1 requires jquanui-overlay-manager. Only top entry processes Escape/Tab/outside dismissal; lockScroll/trapFocus/closeOnEscape/closeOnOutside, initialFocus/returnFocus, onClose, closed/isTop state, stack/top/destroy lifecycle. Restores original overflow axes/priority/marker and inline z-index.',
    'Catalog/Core/minified/Components/Full, package subpath types, browser globals, developer docs, project skill and Unreleased records synchronized.',
    `Original Dialog SHA256: ${originalHash}`,
    `Modified Dialog SHA256: ${hash(path.join(evidence, 'MODIFIED_FILE.js'))}`,
    `New OverlayManager SHA256: ${hash(path.join(root, 'dist/components/overlayManager.js'))}`,
    'Artifacts:', ...artifacts,
    '', ...records.flatMap(record => [record.label, `Command: ${record.command}`, `Input: ${record.input}`, `Literal output: ${record.output || '(empty)'}`, `Exit status: ${record.exit}`, '']),
    'Restored behavior/status: rollback-copy.js matches original Dialog SHA256 and Escape closes both parent and child, leaving empty overflow. MODIFIED_FILE.js and live Dialog remain changed: Escape closes the child only, parent remains open with hidden overflow. The new service remains installed in the live project. All 20 original snapshots retain their hashes.',
    'Previously completed checks in this iteration (literal observed outputs; no rerun by recorder):',
    ...completed.flatMap(([command, output]) => [`Command: ${command}`, 'Input: arguments shown; no stdin.', `Literal output: ${output}`, 'Exit status: 0', '']),
    'Browser suite also executes the published documentation example and verifies it shows/hides the actual DOM and releases the layer.',
    'Manifest/release summary regenerated in two passes. Package remains 4.72.0.',
    `Pre-existing package budget: original unpackedBytes=${budget.unpackedBytes}, maxUnpackedBytes=${budget.maxUnpackedBytes}. Full npm run verify is not claimed as passing.`,
    'Current slice covers Dialog and ordinary DOM only; Modal/Drawer/Popover/Select migration, positioning, portals, background inert, ShadowRoot/iframe focus remain future work.',
    'ROLLBACK.sh restores the specified Dialog copy only. Original snapshots for other existing modified files remain in original/. The live project and new service were not rolled back.'
].join('\n') + '\n';
fs.writeFileSync(path.join(evidence, 'VERIFICATION.txt'), report);
for (const file of artifacts) assert(fs.readFileSync(file).length > 0, `Empty artifact: ${file}`);
console.log('Four artifacts reopened; executable rollback, original hashes and restored behavior verified; live Dialog remains modified.');
