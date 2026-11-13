const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pagesDir = path.join(root, 'projects', 'clarity-editorial', 'pages');
const requiredPages = ['articles', 'blog', 'article-detail', 'author-detail', 'media-library', 'login', 'signup', 'profile'];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const pages = {};
for (const name of requiredPages) {
  const file = path.join(pagesDir, `${name}.html`);
  assert(fs.existsSync(file), `missing page: ${name}.html`);
  const html = fs.readFileSync(file, 'utf8');
  pages[name] = html;
  assert(html.includes('class="ce-screen'), `${name}: missing ce-screen canvas`);
  assert(html.includes('clarity-jquan.config.js'), `${name}: missing shared clarity config`);
  assert(html.includes('JquanUI@Core.js'), `${name}: missing JquanUI Core`);
  assert(html.includes('dist/components/popover.js'), `${name}: missing JquanUI popover component`);
  assert(/JquanUI\.use\(JquanUIComponents\.popover\)/.test(html), `${name}: popover component must be registered`);
  assert(!/<style\b/i.test(html), `${name}: page-level style tag is not allowed`);
  assert(!/\sstyle\s*=\s*["']/i.test(html), `${name}: inline style is not allowed`);
  assert(/aria-label="Primary navigation"/.test(html), `${name}: primary navigation landmark is required`);
}

assert(/jq-tabs/.test(pages.articles) && /dist\/components\/tabs\.js/.test(pages.articles), 'articles: time range tabs are required');
assert(/jq-pagination|data-jq-pagination/.test(pages.articles) && /dist\/components\/pagination\.js/.test(pages.articles), 'articles: pagination component is required');
assert(/dist\/components\/numberInput\.js/.test(pages.articles) && /JquanUI\.use\(JquanUIComponents\.numberInput\)/.test(pages.articles), 'articles: number input component is required');
assert(/dist\/components\/select\.js/.test(pages.articles) && /JquanUI\.use\(JquanUIComponents\.select\)/.test(pages.articles), 'articles: select component is required for pagination page size');
assert((pages.articles.match(/aspect-square/g) || []).length >= 5, 'articles: photography grid is required');
assert((pages.articles.match(/loading="lazy" decoding="async" class="ce-photo-img"/g) || []).length >= 10, 'articles: remote gallery images must be lazy and async decoded');
assert(/The startup funding/.test(pages.blog) && /Related posts/.test(pages.blog), 'blog: feature and related post sections are required');
assert(/data-ce-media-picker/.test(pages['media-library']) && /dist\/components\/mediaPicker\.js/.test(pages['media-library']), 'media library: media picker component is required');
assert(/jq-tabs/.test(pages.profile) && /dist\/components\/tabs\.js/.test(pages.profile), 'profile: JquanUI tabs component is required');
assert(/<form\b/i.test(pages.login) && /<form\b/i.test(pages.signup), 'auth: semantic forms are required');
assert(requiredPages.every((name) => /ce-flyout/.test(pages[name]) && /data-ce-menu/.test(pages[name])), 'pages: secondary navigation flyout is required');
assert(requiredPages.every((name) => /clarity-interactions\.js/.test(pages[name])), 'pages: shared interaction script is required');
assert(requiredPages.every((name) => /ce-avatar/.test(pages[name]) && /title="Menu"/.test(pages[name])), 'pages: account and workspace menu triggers are required');
const paginationSource = fs.readFileSync(path.join(root, 'dist', 'components', 'pagination.js'), 'utf8');
const numberInputSource = fs.readFileSync(path.join(root, 'dist', 'components', 'numberInput.js'), 'utf8');
assert(/buttonDefault:\s*'border-slate-200 bg-white text-slate-700'/.test(paginationSource), 'pagination: default button colors must be a separate state');
assert(/active \? options\.classes\.buttonActive : options\.classes\.buttonDefault/.test(paginationSource), 'pagination: active state must not merge default colors');
assert(/!active && !disabled && options\.classes\.buttonHover/.test(paginationSource), 'pagination: active state must not inherit ordinary hover colors');
assert(!/\n\s*button:\s*'[^']*(?:\bbg-white\b|\btext-slate-700\b|\bborder-slate-200\b)/.test(paginationSource), 'pagination: base button class must not contain state colors');
assert(/buttonActive:\s*'bg-blue-500 border-blue-500 text-white'/.test(paginationSource), 'pagination: active colors must remain explicit');
assert(/name:\s*'jquanui-number-input'/.test(numberInputSource), 'number input: component plugin is required');
assert(/data-number-large-step/.test(paginationSource) && /onchange = \(\) => update/.test(paginationSource), 'pagination: jumper must use enhanced number input behavior');
assert(/<select jq-select/.test(paginationSource) && /selectApi\.mount/.test(paginationSource), 'pagination: page size selector must use JquanUI select decoration');

console.log(`checked ${requiredPages.length} Clarity pages`);
console.log('component coverage passed');
console.log('clarity page verification passed');
