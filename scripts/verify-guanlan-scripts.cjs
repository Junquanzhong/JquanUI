const { spawnSync } = require('child_process');

const files = [
  'dist/components/dateTimePicker.js',
  'projects/guanlan-console/scripts/guanlan-showcase.js',
  'projects/guanlan-console/scripts/guanlan-interactions.js',
  'projects/guanlan-console/scripts/guanlan-controls.js',
  'projects/guanlan-console/scripts/guanlan-preferences.js'
];

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], {
    encoding: 'utf8',
    stdio: 'pipe'
  });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout || `syntax check failed: ${file}\n`);
    process.exit(result.status || 1);
  }
}

console.log('guanlan script syntax passed');
