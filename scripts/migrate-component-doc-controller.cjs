#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const controllerPath = path.join(root, 'js/components-docs.js');
const checkOnly = process.argv.includes('--check');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function replaceOnce(source, search, replacement, label) {
  const index = source.indexOf(search);
  assert(index >= 0, `Could not locate ${label}.`);
  return source.slice(0, index) + replacement + source.slice(index + search.length);
}

const source = fs.readFileSync(controllerPath, 'utf8');
if (source.includes('    let docs = [];') && source.includes("import('../content/components/index.js')")) {
  if (!checkOnly) console.log('[JquanUI] component docs controller already migrated');
  else console.log('[JquanUI] component docs controller check ok (external index + categorized navigation)');
  process.exit(0);
}
const start = source.indexOf('    const docs = [');
const marker = '\n    ];\n\n    const state';
const end = source.indexOf(marker, start);
assert(start >= 0 && end >= 0, 'Legacy component docs array was not found.');

let migrated = source.slice(0, start) + `    let docs = [];

    async function loadComponentDocs() {
        const module = await import('../content/components/index.js');
        const loaded = module && module.default;
        if (!Array.isArray(loaded) || loaded.length === 0) throw new Error('Component documentation index is empty.');
        docs = loaded;
        return docs;
    }
` + source.slice(end + marker.indexOf(']') + 1);

const oldOrder = "const categoryOrder = ['基础交互', '反馈与浮层', '内容展示', '内容与文档', '数据展示', '数据层', '表单输入', '业务组件', '应用框架', '状态与存储', '辅助工具', '集成通信', '设计预设'];";
const newOrder = "const categoryOrder = ['基础交互', '表单输入', '反馈与浮层', '数据展示', '页面结构', '内容与媒体', '数据与状态', '网络与集成', '浏览器工具', '设计预设'];";
migrated = replaceOnce(migrated, oldOrder, newOrder, 'legacy category order');

const oldBoot = `    document.addEventListener('DOMContentLoaded', () => {
        ensurePlugins();
        bindSearch();
        renderSidebar();
        renderDoc();
    });`;
const newBoot = `    document.addEventListener('DOMContentLoaded', async () => {
        try {
            await loadComponentDocs();
            ensurePlugins();
            bindSearch();
            renderSidebar();
            renderDoc();
        } catch (error) {
            console.error('[JquanUI Docs] Failed to load component documentation.', error);
            const mount = document.getElementById('component-app');
            if (mount) mount.innerHTML = '<div class="rounded-xl border border-danger/20 bg-danger/5 p-6 text-sm text-danger">组件文档目录加载失败，请通过本地服务重新打开。</div>';
        }
    });`;
migrated = replaceOnce(migrated, oldBoot, newBoot, 'component docs boot handler');

if (checkOnly) {
  assert(migrated === source, 'Component docs controller is not migrated.');
} else if (migrated !== source) {
  fs.writeFileSync(controllerPath, migrated, 'utf8');
}

console.log(`[JquanUI] component docs controller ${checkOnly ? 'check' : 'migrated'} (external index + categorized navigation)`);
