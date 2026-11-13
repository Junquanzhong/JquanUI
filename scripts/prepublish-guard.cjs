#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

function fail(message) {
  console.error(`[JquanUI] ${message}`);
  process.exitCode = 1;
}

if (pkg.license === 'UNLICENSED' && process.env.JQUANUI_ALLOW_UNLICENSED_PUBLISH !== '1') {
  fail('Refusing npm publish while license is UNLICENSED. Set JQUANUI_ALLOW_UNLICENSED_PUBLISH=1 only for intentional private/internal publishing.');
} else {
  console.log('[JquanUI] prepublish guard ok');
}
