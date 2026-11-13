const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pagesDir = path.join(root, 'projects', 'guanlan-console', 'pages');
const requiredPages = ['home', 'list', 'detail', 'form', 'settings', 'model-designer', 'media-library', 'permissions', 'review-queue', 'audit-log', 'import-export', 'notifications', 'recycle-bin', 'task-center', 'profile', '403', '404', '500', 'login', 'signup'];
const checks = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const name of requiredPages) {
  const file = path.join(pagesDir, `${name}.html`);
  assert(fs.existsSync(file), `missing page: ${name}.html`);
  const html = fs.readFileSync(file, 'utf8');
  assert(html.includes('class="gl-screen'), `${name}: missing gl-screen canvas`);
  assert(!/<style\b/i.test(html), `${name}: page-level style tag is not allowed`);
  assert(!/\sstyle\s*=\s*["']/i.test(html), `${name}: inline style is not allowed`);
  assert(html.includes('guanlan-jquan.config.js'), `${name}: missing shared theme config`);
  assert(html.includes('JquanUI@Core.js'), `${name}: missing JquanUI Core`);
  checks.push(`${name}: canvas and shared runtime ok`);
}

const pages = Object.fromEntries(requiredPages.map((name) => [name, fs.readFileSync(path.join(pagesDir, `${name}.html`), 'utf8')]));
assert(/<table\b/i.test(pages.list), 'list: semantic table is required');
assert(/<form\b/i.test(pages.form), 'form: semantic form is required');
assert(/<form\b/i.test(pages.login) && /<form\b/i.test(pages.signup), 'auth: semantic forms are required');
assert(/jq-tabs/.test(pages.settings) && /dist\/components\/tabs\.js/.test(pages.settings), 'settings: JquanUI tabs component is required');
assert(!/data-gl-tab-group|data-gl-tab=|data-gl-panel=/.test(pages.settings), 'settings: legacy custom tab markup must be removed');
assert(/aria-label="主导航"/.test(pages.home), 'home: primary navigation landmark is required');
assert(/data-gl-filter/.test(pages.list), 'list: filter interaction is required');
assert(/data-gl-select-all/.test(pages.list), 'list: select-all checkbox is required');
assert((pages.list.match(/data-gl-row-select/g) || []).length >= 4, 'list: row checkboxes are required');
assert(/data-gl-bulk-bar/.test(pages.list), 'list: bulk action bar is required');
assert(/lg:grid-cols-\[minmax\(0,1fr\)_minmax\(180px,220px\)_auto\]/.test(pages.list), 'list: primary filters must use a three-column desktop layout');
assert(/id="advanced-filters"[^>]*hidden/.test(pages.list), 'list: advanced filters must be independently hidden by default');
assert(/data-jq-select/.test(pages.list) && (pages.list.match(/data-jq-select/g) || []).length >= 3, 'list: all select controls must use JquanUI select');
assert([pages.home, pages.list, pages.form, pages.detail, pages.settings].every((html) => /gl-flyout-menu/.test(html) && /aria-label="主导航"/.test(html)), 'workspace pages: floating secondary navigation is required');
assert(/gl-link-tabs/.test(pages.list) && /gl-link-tabs/.test(pages.form) && /gl-link-tabs/.test(pages.detail), 'content pages: link tabs are required');
assert(/data-jq-select/.test(pages.form) && /data-jq-tag-input/.test(pages.form), 'form: select and tag input components are required');
assert(/dist\/components\/upload\.js/.test(pages.form) && /data-gl-upload/.test(pages.form) && /data-gl-url-assets/.test(pages.form), 'form: media upload and URL asset surfaces are required');
assert(/dist\/components\/dateTimePicker\.js/.test(pages.form) && (pages.form.match(/data-jq-date-time-picker/g) || []).length >= 3, 'form: date, time, and datetime picker components are required');
assert(/data-jq-select/.test(pages.settings) && /dist\/components\/select\.js/.test(pages.settings), 'settings: select component is required');
assert(/dist\/components\/collectionFieldDesigner\.js/.test(pages['model-designer']) && /data-gl-field-designer/.test(pages['model-designer']), 'model designer: field designer component is required');
assert(/dist\/components\/mediaPicker\.js/.test(pages['media-library']) && /data-gl-media-picker/.test(pages['media-library']), 'media library: media picker component is required');
assert(/dist\/components\/permissionMatrix\.js/.test(pages.permissions) && /data-gl-permission-matrix/.test(pages.permissions), 'permissions: permission matrix component is required');
assert(/dist\/components\/roleMemberAssigner\.js/.test(pages.permissions) && /data-gl-role-assigner/.test(pages.permissions), 'permissions: role member assigner component is required');
assert(/dist\/components\/reviewQueuePanel\.js/.test(pages['review-queue']) && /data-gl-review-queue/.test(pages['review-queue']), 'review queue: review panel component is required');
assert(/dist\/components\/auditTimeline\.js/.test(pages['audit-log']) && /data-gl-audit-timeline/.test(pages['audit-log']), 'audit log: audit timeline component is required');
assert(/dist\/components\/notificationCenterPanel\.js/.test(pages.notifications) && /data-gl-notification-center/.test(pages.notifications), 'notifications: notification component is required');
assert(/dist\/components\/taskInbox\.js/.test(pages['task-center']) && /data-gl-task-inbox/.test(pages['task-center']), 'task center: task inbox component is required');
assert(/dist\/components\/upload\.js/.test(pages['import-export']) && /dist\/components\/export\.js/.test(pages['import-export']), 'import export: upload and export components are required');
assert(/jq-tabs/.test(pages.profile) && /dist\/components\/tabs\.js/.test(pages.profile), 'profile: JquanUI tabs component is required');
assert(/403/.test(pages['403']) && /404/.test(pages['404']) && /500/.test(pages['500']), 'status pages: error codes are required');
assert([pages.home, pages.list, pages.form, pages.detail, pages.settings].every((html) => /guanlan-interactions\.js/.test(html)), 'workspace pages: shared navigation interactions are required');
assert(!/gl-subnav/.test(Object.values(pages).join('\n')), 'legacy top secondary navigation must be removed');
const config = fs.readFileSync(path.join(root, 'projects', 'guanlan-console', 'jquan.config.cjs'), 'utf8');
assert(/'gl-stage': 'relative h-screen w-screen overflow-hidden'/.test(config), 'theme: gl-stage must be full viewport without inner padding');
assert(/'gl-screen': 'relative h-full w-full max-w-none/.test(config), 'theme: gl-screen must fill gl-stage');
assert(!/group-hover|group-focus-within/.test(config), 'theme: hover/focus flyout behavior must stay in shared interaction logic');

console.log(`checked ${requiredPages.length} Guanlan pages`);
for (const check of checks) console.log(check);
console.log('guanlan page verification passed');

