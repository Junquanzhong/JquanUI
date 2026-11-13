const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const repository = path.resolve(root, '../..');
const output = path.join(root, 'site');
fs.mkdirSync(output, { recursive: true });
for (const folder of ['src', 'assets']) fs.cpSync(path.join(root, folder), path.join(output, folder), { recursive: true });
const files = ['core/JquanUI@Core.js', 'data/JquanUI@Data.js', ...['overlayPreset', 'table', 'pagination', 'msg', 'export', 'approvalFlow'].map(name => `components/${name}.js`)];
for (const file of files) {
  const target = path.join(output, 'vendor', file); fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(repository, 'dist', file), target);
}
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8').replaceAll('../../dist/', './vendor/');
fs.writeFileSync(path.join(output, 'index.html'), html);
console.log('Portable static site written to projects/lanse-crm/site. Serve site/ over HTTP.');
