'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'dist/components/components.manifest.json'), 'utf8'));
const sources = new Map(manifest.components.map(file => [file.slice(0, -3), fs.readFileSync(path.join(root, 'dist/components', file), 'utf8')]));
const plugins = new Map();
for (const [name, source] of sources) {
    const plugin = source.match(/name:\s*['"](jquanui-[^'"]+)['"]/);
    if (plugin) plugins.set(plugin[1], name);
}
// These existing components use other APIs without declaring plugin.requires.
const operational = {
    // These consumers share the overlay lifecycle service even when their
    // legacy plugin metadata predates the dependency declaration.
    modal: ['overlayManager'],
    popover: ['overlayManager'],
    select: ['overlayManager'],
    table: ['pagination'],
    crud: ['modal', 'formValidator', 'table', 'http'],
    storage: ['localStorage', 'sessionStorage', 'cookie']
};
const catalog = {};
for (const [name, source] of sources) {
    const dependencies = new Set(operational[name] || []);
    const requires = source.match(/requires:\s*\[([^\]]*)\]/);
    for (const [, plugin] of (requires ? requires[1] : '').matchAll(/['"]([^'"]+)['"]/g)) {
        if (!plugins.has(plugin)) throw new Error(`Unknown dependency ${plugin} for ${name}`);
        dependencies.add(plugins.get(plugin));
    }
    for (const preset of ['uiPreset', 'overlayPreset']) {
        if (name !== preset && source.includes(`JquanUIComponents.${preset}`)) dependencies.add(preset);
    }
    for (const dependency of dependencies) if (!sources.has(dependency)) throw new Error(`Unknown dependency ${dependency} for ${name}`);
    catalog[name] = Array.from(dependencies);
}
for (const name of sources.keys()) {
    function check(current, trail) {
        if (trail.includes(current)) throw new Error(`Component dependency cycle: ${trail.concat(current).join(' -> ')}`);
        catalog[current].forEach(dependency => check(dependency, trail.concat(current)));
    }
    check(name, []);
}
const template = fs.readFileSync(path.join(root, 'src/runtime/component-import.js'), 'utf8').trim();
const embedded = template.replace('__JQUAN_COMPONENT_CATALOG__', JSON.stringify(catalog));
const start = '/*! JquanUI component importer: generated start */';
const end = '/*! JquanUI component importer: generated end */';
const corePath = path.join(root, 'dist/core/JquanUI@Core.js');
const core = fs.readFileSync(corePath, 'utf8');
const marker = core.indexOf(start);
const original = (marker < 0 ? core : core.slice(0, marker)).trimEnd();
const expected = `${original}\n\n${start}\n${embedded}\n${end}\n`;
if (process.argv.includes('--check')) {
    if (core !== expected) throw new Error('Core component importer is stale. Run npm run build:core.');
} else if (core !== expected) fs.writeFileSync(corePath, expected, 'utf8');
console.log(`[JquanUI] component importer ${process.argv.includes('--check') ? 'check ok' : 'built'} (${sources.size} components)`);
