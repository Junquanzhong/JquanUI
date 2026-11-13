#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const extractor = require('../dist/cli/jquan-extract.cjs');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const root = path.resolve(__dirname, '..');

async function main() {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'jquan-baseline-'));
  try {
  const input = path.join(fixture, 'index.html');
  const fullOutput = path.join(fixture, 'jquan.css');
  const baselineOutput = path.join(fixture, 'jquan.base.css');
  const utilitiesOutput = path.join(fixture, 'jquan.utilities.css');
  fs.writeFileSync(input, '<main class="container p-4 text-md hover:bg-blue-500"></main>', 'utf8');

  const result = extractor.extractFromFiles([input], {
    core: path.join(root, 'dist/core/JquanUI@Core.js'),
    root: fixture,
    minify: true
  });
  assert(result.css.includes(result.baselineCss), 'full CSS should contain the baseline output');
  assert(result.css.includes(result.utilityCss), 'full CSS should contain the utility output');
  assert(result.baselineCss.includes('--jquan-translate-x'), 'baseline output should contain Core variable initialization');
  assert(result.baselineCss.includes('box-sizing'), 'baseline output should contain preflight');
  assert(result.utilityCss.includes('padding'), 'utility output should contain discovered utility rules');
  assert(!result.utilityCss.includes('--jquan-translate-x'), 'utility output should not duplicate baseline variables');
  assert(result.report.baselineCssBytes === Buffer.byteLength(result.baselineCss), 'baseline byte count should match output');
  assert(result.report.utilityCssBytes === Buffer.byteLength(result.utilityCss), 'utility byte count should match output');
  console.log('[JquanUI] baseline full CSS compatibility check ok');

    const cliResult = await extractor.main([
    '--input', input,
    '--output', fullOutput,
    '--baseline-output', baselineOutput,
    '--utilities-output', utilitiesOutput,
    '--core', path.join(root, 'dist/core/JquanUI@Core.js'),
    '--minify'
    ]);
    assert(cliResult.ok === true, 'CLI split output should succeed');
    assert(fs.readFileSync(fullOutput, 'utf8') === result.css, 'CLI full output should match API output');
    assert(fs.readFileSync(baselineOutput, 'utf8') === result.baselineCss, 'CLI baseline output should match API output');
    assert(fs.readFileSync(utilitiesOutput, 'utf8') === result.utilityCss, 'CLI utility output should match API output');
    console.log('[JquanUI] modified split output check ok');
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
}

main().catch(error => {
  console.error(`[JquanUI] baseline CSS output check failed: ${error.message}`);
  process.exitCode = 1;
});
