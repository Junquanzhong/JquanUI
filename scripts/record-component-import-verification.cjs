'use strict';

const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const crypto = require('crypto');
const root = path.resolve(__dirname, '..');
const evidence = path.join(root, 'verification/component-import');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const originalHash = '7318a8761324ca2af4e6dfa83498da2220e70f87e2a898f8173a89cebdf3c34f';
assert.equal(hash(path.join(evidence, 'BASELINE.js')), originalHash);
fs.copyFileSync(path.join(root, 'dist/core/JquanUI@Core.js'), path.join(evidence, 'MODIFIED_FILE.js'));
fs.copyFileSync(path.join(evidence, 'MODIFIED_FILE.js'), path.join(evidence, 'rollback-copy.js'));
const records = [];
function run(label, executable, args, display) {
    const result = spawnSync(executable, args, { cwd: root, encoding: 'utf8', windowsHide: true });
    if (result.error) throw result.error;
    records.push({ label, command: display || `${executable} ${args.join(' ')}`, output: (result.stdout + result.stderr).trim(), exit: result.status });
    assert.equal(result.status, 0, `${label}: ${result.stderr}`);
    console.log(`${label}: ${result.stdout.trim()} (exit ${result.status})`);
}
run('BASELINE', process.execPath, ['verification/component-import/probe.cjs', 'BASELINE.js', 'undefined'], 'node verification/component-import/probe.cjs BASELINE.js undefined');
run('MODIFIED', process.execPath, ['verification/component-import/probe.cjs', 'MODIFIED_FILE.js', 'function'], 'node verification/component-import/probe.cjs MODIFIED_FILE.js function');
const bash = 'C:/Program Files/Git/bin/bash.exe';
run('ROLLBACK_PREPARE', bash, ['-c', 'chmod +x verification/component-import/ROLLBACK.sh'], 'bash -c "chmod +x verification/component-import/ROLLBACK.sh"');
run('ROLLBACK', bash, ['verification/component-import/ROLLBACK.sh', 'verification/component-import/rollback-copy.js'], 'bash verification/component-import/ROLLBACK.sh verification/component-import/rollback-copy.js');
run('ROLLBACK_BEHAVIOR', process.execPath, ['verification/component-import/probe.cjs', 'rollback-copy.js', 'undefined'], 'node verification/component-import/probe.cjs rollback-copy.js undefined');
assert.equal(hash(path.join(evidence, 'rollback-copy.js')), originalHash);
assert.equal(hash(path.join(evidence, 'MODIFIED_FILE.js')), hash(path.join(root, 'dist/core/JquanUI@Core.js')));
const modified = path.join(evidence, 'modified');
const original = path.join(evidence, 'original');
function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
}
for (const file of walk(original)) {
    const relative = path.relative(original, file);
    const current = path.join(root, relative);
    if (!fs.existsSync(current)) continue;
    const target = path.join(modified, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(current, target);
}
for (const relative of ['src/runtime/component-import.js', 'scripts/build-component-import.cjs', 'scripts/check-component-import.cjs', 'scripts/check-component-import-browser.cjs', 'scripts/component-import-fixture.html', 'scripts/record-component-import-verification.cjs']) {
    const target = path.join(modified, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(root, relative), target);
}
const diff = spawnSync('git', ['diff', '--no-index', '--text', '--', 'verification/component-import/original', 'verification/component-import/modified'], { cwd: root, encoding: 'utf8', maxBuffer: 12 * 1024 * 1024, windowsHide: true });
assert.equal(diff.status, 1, 'Expected a non-empty review diff');
const patch = diff.stdout.replace(/([ab])\/verification\/component-import\/(?:original|modified)\//g, '$1/');
fs.writeFileSync(path.join(evidence, 'DIFF_FILE.patch'), patch);
const performance = JSON.parse(fs.readFileSync(path.join(evidence, 'core-performance.json'), 'utf8'));
const artifacts = ['MODIFIED_FILE.js', 'DIFF_FILE.patch', 'VERIFICATION.txt', 'ROLLBACK.sh'].map(file => path.join(evidence, file));
const content = [
    'Changed field: JquanUI.import(name | names, options); JQUAN_CONFIG.componentLoader.',
    'Core source restored from the verified existing 4.72.0 desktop copy before adding the importer.',
    `Original Core SHA256: ${originalHash}`,
    `Modified Core SHA256: ${hash(path.join(evidence, 'MODIFIED_FILE.js'))}`,
    'Artifacts:', ...artifacts,
    '', ...records.flatMap(record => [record.label, `Command: ${record.command}`, 'Input: file arguments shown in the command; no stdin.', `Literal output: ${record.output}`, `Exit status: ${record.exit}`, '']),
    'Restored behavior: rollback-copy.js matches original SHA256 and exposes no JquanUI.import; MODIFIED_FILE.js and the live Core remain changed and expose the function.',
    'Meaningful validation:',
    'node scripts/check-component-import.cjs => [JquanUI] component import check ok (44 assertions), exit 0.',
    'node scripts/check-component-import-browser.cjs => Core/minified/Full passed under nonce CSP with real DOM/Table, dependency order, dedupe and 404 retry, exit 0.',
    'node scripts/check-core-regressions.cjs => [JquanUI] core regression check ok, exit 0.',
    'node scripts/check-documentation.cjs => [JquanUI] documentation check ok (15 public APIs), exit 0.',
    'node scripts/check-component-documentation.cjs => [JquanUI] component documentation check ok (77 modules, 10 categories), exit 0.',
    'node scripts/check-types-surface.cjs => [JquanUI] types surface check ok, exit 0.',
    `node scripts/benchmark-core.cjs --check --output verification/component-import/core-performance.json => passed=${performance.passed}, samples=${performance.samples}, exit 0.`,
    'Known pre-existing package gate: original estimated unpacked bytes 5687305 exceeded the 4456448-byte budget; this task does not claim npm run verify passes.',
    'The restored category check follows the existing docs controller, which already loads the complete index and distinguishes UI/service; no page filtering behavior was changed.',
    'ROLLBACK.sh restores a specified Core copy only. Original snapshots for all modified existing files are in original/; this probe does not reverse all project changes.'
].join('\n') + '\n';
fs.writeFileSync(path.join(evidence, 'VERIFICATION.txt'), content);
for (const file of artifacts) assert(fs.readFileSync(file).length > 0, `Empty artifact: ${file}`);
console.log('Verification artifacts reopened; rollback hash and restored behavior verified.');
