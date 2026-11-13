const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
for (const file of fs.readdirSync(path.join(root, 'src')).filter(f => f.endsWith('.js'))) execFileSync(process.execPath, ['--check', path.join(root, 'src', file)]);
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const match of html.matchAll(/(?:src|href)="(\.[^"]+)"/g)) if (!fs.existsSync(path.resolve(root, match[1]))) throw new Error(`Missing dependency: ${match[1]}`);
for (const file of fs.readdirSync(path.join(root, 'src')).filter(f => f.endsWith('.js'))) {
  if (/\bstyle\s*=|\.style\./.test(fs.readFileSync(path.join(root, 'src', file), 'utf8'))) throw new Error(`Inline styling is prohibited: ${file}`);
}
console.log('Lanse CRM syntax, entry dependencies and atomic styling: PASS');
