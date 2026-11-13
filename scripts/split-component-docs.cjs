#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'js/components-docs.js');
const outputDir = path.join(root, 'content/components');
const indexPath = path.join(outputDir, 'index.js');
const checkOnly = process.argv.includes('--check');

const categoryOverrides = {
  button: '基础交互', accordion: '基础交互', tabs: '基础交互', dropdown: '基础交互',
  popover: '基础交互', tooltip: '基础交互', quickActionLauncher: '基础交互',
  select: '表单输入', formValidator: '表单输入', tagInput: '表单输入', schemaForm: '表单输入', upload: '表单输入',
  modal: '反馈与浮层', drawer: '反馈与浮层', dialog: '反馈与浮层', toast: '反馈与浮层', msg: '反馈与浮层', notificationCenterPanel: '反馈与浮层',
  pagination: '数据展示', table: '数据展示', tree: '数据展示', dashboardStats: '数据展示', auditTimeline: '数据展示',
  kanbanBoard: '数据展示', taskInbox: '数据展示', recentActivityFeed: '数据展示',
  appShell: '页面结构', navigationBuilder: '页面结构', workspaceSwitcher: '页面结构', contentOutlinePanel: '页面结构', assetFolderTree: '页面结构',
  carousel: '内容与媒体', infiniteScroll: '内容与媒体', video: '内容与媒体', audio: '内容与媒体', mediaPicker: '内容与媒体',
  mediaLibraryPanel: '内容与媒体', commentThread: '内容与媒体', revisionCompare: '内容与媒体', map: '内容与媒体', watermark: '内容与媒体',
  data: '数据与状态', store: '数据与状态', crud: '数据与状态', filterBuilder: '数据与状态', queryToolbar: '数据与状态',
  batchActions: '数据与状态', recordMetaPanel: '数据与状态', collectionFieldDesigner: '数据与状态', permissionMatrix: '数据与状态',
  dataFilterPresetBar: '数据与状态', roleMemberAssigner: '数据与状态', reviewQueuePanel: '数据与状态', approvalFlow: '数据与状态',
  publishScheduler: '数据与状态', relationPicker: '数据与状态',
  router: '网络与集成', http: '网络与集成', i18n: '网络与集成', iframeBridge: '网络与集成', siteLocaleSwitcher: '网络与集成',
  permission: '浏览器工具', storage: '浏览器工具', localStorage: '浏览器工具', sessionStorage: '浏览器工具', cookie: '浏览器工具',
  copy: '浏览器工具', codeBlock: '浏览器工具', mdViewer: '浏览器工具', template: '浏览器工具', favicon: '浏览器工具', dom: '浏览器工具', export: '浏览器工具', print: '浏览器工具',
  uiPreset: '设计预设', overlayPreset: '设计预设'
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readLegacyDocs() {
  const source = fs.readFileSync(sourcePath, 'utf8');
  const start = source.indexOf('const docs = [');
  const marker = '\n    ];\n\n    const state';
  const end = source.indexOf(marker, start);
  assert(start >= 0 && end >= 0, 'Could not locate the legacy component docs array.');
  const arrayStart = source.indexOf('[', start);
  const arraySource = source.slice(arrayStart, end + marker.indexOf(']') + 1);
  const docs = vm.runInNewContext(`(${arraySource})`, Object.create(null), { filename: sourcePath });
  assert(Array.isArray(docs) && docs.length > 0, 'Legacy component docs array is empty.');
  return docs.map(doc => Object.assign({}, doc, { category: categoryOverrides[doc.id] || doc.category }));
}

function moduleSource(doc) {
  return `// JquanUI component documentation: ${doc.id}\nexport default ${JSON.stringify(doc, null, 2)};\n`;
}

function indexSource(docs) {
  const imports = docs.map((doc, index) => `import doc${index} from './${doc.id}.js';`).join('\n');
  const entries = docs.map((doc, index) => `  doc${index}`).join(',\n');
  return `// JquanUI component documentation index. Keep each descriptor in its own module.\n${imports}\n\nexport default [\n${entries}\n];\n`;
}

function writeOrCheck(target, expected) {
  const current = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
  if (current === expected) return;
  if (checkOnly) throw new Error(`Component documentation module is stale: ${path.relative(root, target)}`);
  fs.writeFileSync(target, expected, 'utf8');
}

if (!fs.readFileSync(sourcePath, 'utf8').includes('const docs = [')) {
  const files = fs.existsSync(outputDir) ? fs.readdirSync(outputDir).filter(file => file.endsWith('.js') && file !== 'index.js') : [];
  assert(fs.existsSync(indexPath) && files.length > 0, 'Split component documentation index is missing.');
  console.log(`[JquanUI] component documentation modules check ok (${files.length} descriptors already split)`);
  process.exit(0);
}

const docs = readLegacyDocs();
const ids = new Set();
for (const doc of docs) {
  assert(doc && /^[A-Za-z0-9_-]+$/.test(doc.id), `Invalid component documentation id: ${doc && doc.id}`);
  assert(!ids.has(doc.id), `Duplicate component documentation id: ${doc.id}`);
  ids.add(doc.id);
}

if (!checkOnly) fs.mkdirSync(outputDir, { recursive: true });
for (const doc of docs) writeOrCheck(path.join(outputDir, `${doc.id}.js`), moduleSource(doc));
writeOrCheck(indexPath, indexSource(docs));

console.log(`[JquanUI] component documentation modules ${checkOnly ? 'check' : 'built'} (${docs.length} descriptors)`);
