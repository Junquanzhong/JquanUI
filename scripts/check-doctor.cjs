#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const jquan = require('../dist/index.cjs');

const root = path.resolve(__dirname, '..');
const fixture = path.join(root, '.tmp', 'doctor-fixture.html');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

fs.mkdirSync(path.dirname(fixture), { recursive: true });

try {
  fs.writeFileSync(fixture, '<main class="container p-4 text-center"></main>', 'utf8');

  const report = jquan.diagnoseProject({ inputs: [fixture], root });
  assert(report.ok, `doctor should be ok: ${report.warnings.join(', ')}`);
  assert(report.coreVersion === require('../package.json').version, 'doctor core version mismatch');
  assert(report.files.length === 1, 'doctor should resolve one file');
  assert(report.classCount >= 3, 'doctor should discover class tokens');
  assert(jquan.formatDoctorReport(report).includes('JquanUI doctor ok'), 'doctor text report mismatch');

  const output = execFileSync(process.execPath, ['dist/cli/jquan-extract.cjs', '--doctor', '--input', fixture, '--json'], {
    cwd: root,
    encoding: 'utf8'
  });
  const cliReport = JSON.parse(output);
  assert(cliReport.ok, `doctor cli should be ok: ${cliReport.warnings.join(', ')}`);
  assert(cliReport.files.length === 1, 'doctor cli should resolve one file');

  console.log('[JquanUI] doctor check ok');
} finally {
  if (fs.existsSync(fixture)) fs.rmSync(fixture, { force: true });
}
