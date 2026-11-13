'use strict';

const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const root = path.resolve(__dirname, '..');
const evidence = path.join(root, 'verification/table-runtime');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const originalHash = '42e11af45dce8a7298e96b6144d09649406f116da86fa1677a8e96267a60e411';
const originals = JSON.parse(fs.readFileSync(path.join(evidence, 'original-hashes.json'), 'utf8'));
for (const [file, expected] of Object.entries(originals)) {
    assert.equal(hash(path.join(evidence, 'original', file)), expected, `Original snapshot changed: ${file}`);
}
assert.equal(hash(path.join(evidence, 'BASELINE.js')), originalHash);
fs.copyFileSync(path.join(root, 'dist/components/table.js'), path.join(evidence, 'MODIFIED_FILE.js'));
fs.copyFileSync(path.join(evidence, 'MODIFIED_FILE.js'), path.join(evidence, 'rollback-copy.js'));
const records = [];
function run(label, executable, args, command) {
    const result = spawnSync(executable, args, { cwd: root, encoding: 'utf8', windowsHide: true });
    if (result.error) throw result.error;
    records.push({ label, command, output: (result.stdout + result.stderr).trim(), exit: result.status });
    assert.equal(result.status, 0, `${label}: ${result.stderr}`);
    console.log(`${label}: ${result.stdout.trim()} (exit ${result.status})`);
}
run('BASELINE', process.execPath, ['verification/table-runtime/probe.cjs', 'BASELINE.js', 'old'], 'node verification/table-runtime/probe.cjs BASELINE.js old');
run('MODIFIED', process.execPath, ['verification/table-runtime/probe.cjs', 'MODIFIED_FILE.js', 'new'], 'node verification/table-runtime/probe.cjs MODIFIED_FILE.js new');
const bash = 'C:/Program Files/Git/bin/bash.exe';
run('ROLLBACK_PREPARE', bash, ['-c', 'chmod +x verification/table-runtime/ROLLBACK.sh && test -x verification/table-runtime/ROLLBACK.sh'], 'bash -c "chmod +x verification/table-runtime/ROLLBACK.sh && test -x verification/table-runtime/ROLLBACK.sh"');
run('ROLLBACK', bash, ['verification/table-runtime/ROLLBACK.sh', 'verification/table-runtime/rollback-copy.js'], 'bash verification/table-runtime/ROLLBACK.sh verification/table-runtime/rollback-copy.js');
run('ROLLBACK_BEHAVIOR', process.execPath, ['verification/table-runtime/probe.cjs', 'rollback-copy.js', 'old'], 'node verification/table-runtime/probe.cjs rollback-copy.js old');
assert.equal(hash(path.join(evidence, 'rollback-copy.js')), originalHash);
assert.equal(hash(path.join(evidence, 'MODIFIED_FILE.js')), hash(path.join(root, 'dist/components/table.js')));
assert.notEqual(hash(path.join(evidence, 'MODIFIED_FILE.js')), originalHash);
for (const [label, script] of [
    ['RUNTIME', 'check-table-runtime.cjs'], ['DOCS', 'check-documentation.cjs'],
    ['COMPONENT_DOCS', 'check-component-documentation.cjs'], ['TYPES_SURFACE', 'check-types-surface.cjs'],
    ['PACKAGE_METADATA', 'check-package.cjs'], ['MANIFEST', 'check-manifest.cjs']
]) run(label, process.execPath, [`scripts/${script}`], `node scripts/${script}`);

const original = path.join(evidence, 'original');
const modified = path.join(evidence, 'modified');
function snapshot(relative) {
    const target = path.join(modified, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(root, relative), target);
}
for (const relative of Object.keys(originals)) snapshot(relative);
for (const relative of [
    'dist/components/table.d.ts', 'scripts/check-table-runtime.cjs',
    'scripts/check-table-browser.cjs', 'scripts/table-browser-fixture.html',
    'scripts/record-table-verification.cjs', 'verification/table-runtime/probe.cjs',
    'verification/table-runtime/types-consumer.ts', 'verification/table-runtime/ROLLBACK.sh'
]) snapshot(relative);
const diff = spawnSync('git', ['diff', '--no-index', '--text', '--', 'verification/table-runtime/original', 'verification/table-runtime/modified'], { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, windowsHide: true });
assert.equal(diff.status, 1, 'Expected a non-empty review diff');
const patch = diff.stdout.replace(/([ab])\/verification\/table-runtime\/(?:original|modified)\//g, '$1/');
fs.writeFileSync(path.join(evidence, 'DIFF_FILE.patch'), patch);
const artifacts = ['MODIFIED_FILE.js', 'DIFF_FILE.patch', 'VERIFICATION.txt', 'ROLLBACK.sh'].map(file => path.join(evidence, file));
const content = [
    'Changed branch/fields: Table 2.2.0 -> 2.3.0; latest requestId commits; AbortController cancellation; lifecycle invalidation; loading/error/destroyed/requestId state; onError/errorText; pagination cleanup; native sorting buttons, aria-sort/aria-busy and filter focus; generic Table API types.',
    `Original Table SHA256: ${originalHash}`,
    `Modified Table SHA256: ${hash(path.join(evidence, 'MODIFIED_FILE.js'))}`,
    'Artifacts:', ...artifacts,
    '', ...records.flatMap(record => [record.label, `Command: ${record.command}`, 'Input: arguments in command; no stdin. Probe resolves the newer request first and the older request last.', `Literal output: ${record.output || '(empty)'}`, `Exit status: ${record.exit}`, '']),
    'Restored behavior/status: rollback-copy.js matches original SHA256 and renders row=old. MODIFIED_FILE.js and live dist/components/table.js remain changed and render row=new. All 16 original snapshots retain their recorded hashes.',
    'Earlier completed validation (not repeated by this recorder):',
    'node scripts/check-table-browser.cjs => [JquanUI] table browser check ok (Core, minified, Full), exit 0. Each entry passed 22 fixture assertions plus actual CDP Enter/Space, focus and aria-sort checks.',
    'npx --yes --package typescript tsc --noEmit --strict --lib ES2022,DOM --module Node16 --moduleResolution Node16 verification/table-runtime/types-consumer.ts => empty output, exit 0; positive generic use and three expected type failures.',
    'node scripts/check-component-import-browser.cjs => Core/minified/Full importer integration passed, exit 0; dependencies, dedupe, CSP and retry retained.',
    'node scripts/build-component-import.cjs --check => 77 components current, exit 0.',
    'node scripts/build-component-bundles.cjs --check => 75 Components / 37 Full modules current, exit 0.',
    'python -X utf8 C:/Users/Jquan/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/jquanui => Skill is valid!, exit 0. First invocation without UTF-8 failed decoding under GBK; UTF-8 invocation passed.',
    'Known pre-existing package budget: original estimated unpacked bytes 5687305 exceeded the 4456448-byte budget. Full npm run verify is not claimed as passing.',
    'ROLLBACK.sh restores the specified Table copy only; original/ retains snapshots of all changed existing files. The rollback test does not revert live project changes.',
    'Metadata regenerated in two passes; package remains 4.72.0 and changes are recorded under Unreleased.'
].join('\n') + '\n';
fs.writeFileSync(path.join(evidence, 'VERIFICATION.txt'), content);
for (const file of artifacts) assert(fs.readFileSync(file).length > 0, `Empty artifact: ${file}`);
console.log('Four verification artifacts reopened; original hashes and rollback behavior verified; live Table remains modified.');
