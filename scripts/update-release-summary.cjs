#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'dist/manifest.json'), 'utf8'));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

const hashLines = Object.entries(manifest.hashes)
  .map(([file, hash]) => `| \`${file}\` | \`${hash}\` |`)
  .join('\n');

const exportLines = Object.keys(pkg.exports)
  .map(key => `- \`${key}\``)
  .join('\n');

const content = `# JquanUI Release Summary

## Version

- Package: \`${manifest.name}@${manifest.version}\`
- Generated: \`${manifest.generatedAt}\`
- License: \`${pkg.license}\`

## Entrypoints

- CJS: \`${manifest.entries.main}\`
- ESM: \`${manifest.entries.module}\`
- Types: \`${manifest.entries.types}\`
- Browser runtime: \`${manifest.entries.browser}\`
- Full bundle: \`${manifest.entries.unpkg}\`

## CLI Binaries

- \`jquan-extract\`: \`${manifest.bin['jquan-extract']}\`
- \`jquan-tokens\`: \`${manifest.bin['jquan-tokens']}\`
- \`jquan-migrate\`: \`${manifest.bin['jquan-migrate']}\`

## Exported Subpaths

${exportLines}

## Package Budget

- Files: \`${manifest.budgets.fileCount}/${manifest.budgets.maxFiles}\`
- Unpacked bytes: \`${manifest.budgets.unpackedBytes}/${manifest.budgets.maxUnpackedBytes}\`
- Projected tarball bytes: \`${manifest.budgets.projectedTarballBytes}/${manifest.budgets.maxProjectedTarballBytes}\`

## Verification

\`\`\`bash
npm run verify
\`\`\`

## Key Hashes

| File | SHA256 |
| --- | --- |
${hashLines}
`;

fs.writeFileSync(path.join(root, 'dist/release-summary.md'), `${content.trim()}\n`, 'utf8');
console.log(`[JquanUI] release summary updated (${manifest.version})`);
