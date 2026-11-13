const path = require('node:path');
const { execSync } = require('node:child_process');
const project = path.resolve(__dirname, '..');
const root = path.resolve(project, '../..');
let liveServer;
try {
  liveServer = require('live-server');
} catch {
  try {
    const globalRoot = execSync('npm root --global', { encoding: 'utf8', windowsHide: true }).trim();
    liveServer = require(path.join(globalRoot, 'live-server'));
  } catch {
    console.error('live-server is missing. Run npm install in projects/lanse-crm, or use Start.cmd.');
    process.exit(1);
  }
}
// Absolute paths avoid live-server 1.2.2 CLI's relative-root watcher edge cases.
liveServer.start({
  root,
  host: '127.0.0.1',
  port: 4173,
  open: process.argv.includes('--no-browser') ? false : '/projects/lanse-crm/',
  watch: [project, path.join(root, 'dist')],
  ignore: [path.join(root, '.tmp'), path.join(root, 'reports'), path.join(project, 'verification'), path.join(project, 'site')],
  ignorePattern: /node_modules/
});
process.on('SIGINT', () => { liveServer.shutdown(); process.exit(0); });
process.on('SIGTERM', () => { liveServer.shutdown(); process.exit(0); });
