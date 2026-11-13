'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'dist/data/jquan-data.cjs');
const targetPath = path.join(root, 'dist/data/JquanUI@Data.js');
const source = fs.readFileSync(sourcePath, 'utf8')
  .replace(/^'use strict';\s*/, '')
  .replace(/module\.exports\s*=\s*api;\s*$/, 'global.JquanUIData = api; if (global.JquanUI) global.JquanUI.data = api;');
const output = `(function (global) {\n${source}\n})(typeof window !== 'undefined' ? window : globalThis);\n`;
fs.writeFileSync(targetPath, output, 'utf8');
console.log('[JquanUI] Data browser bundle built');
