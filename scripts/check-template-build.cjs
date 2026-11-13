#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const {
  buildTemplatePages,
  createTemplateBundle,
  createNodeTemplateRuntime,
  main,
  readJsonFile,
  renderTemplateFile,
  writeTemplateBundle
} = require('../dist/cli/jquan-extract.cjs');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function write(file, source) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, source, 'utf8');
}

(async () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'jquan-template-build-'));
  const pages = path.join(fixture, 'pages');
  const templates = path.join(fixture, 'templates');
  const output = path.join(fixture, 'public');

  try {
    write(path.join(templates, 'layout.html'), '<!doctype html><html><head><title>{% renderSlot \'title\' %}</title></head><body>{% include \'header\' %}<main>{% renderSlot \'default\' %}</main></body></html>');
    write(path.join(templates, 'header.html'), '<header>{{ siteName }}</header>');
    write(path.join(templates, 'nested', 'safe.html'), '<script>window.demo="</script>";</script>');
    write(path.join(pages, 'index.html'), "{% layout 'layout' %}{% slot 'title' %}{{ title }}{% endslot %}<h1>{{ title }}</h1>{% endlayout %}");
    write(path.join(pages, 'docs', 'start.html'), "{% include 'header' %}<p>{{ message }}</p>");
    write(path.join(fixture, 'site.json'), JSON.stringify({ siteName: 'JquanUI', title: 'Home', message: 'Ready' }));

    const data = readJsonFile('site.json', { root: fixture });
    const result = await buildTemplatePages('pages', {
      root: fixture,
      output: 'public',
      templates: 'templates',
      data
    });
    assert(result.count === 2, 'directory build should render every HTML entry');
    const home = fs.readFileSync(path.join(output, 'index.html'), 'utf8');
    const docs = fs.readFileSync(path.join(output, 'docs', 'start.html'), 'utf8');
    assert(home.includes('<title>Home</title>'), 'layout named slot should render into the final page');
    assert(home.includes('<header>JquanUI</header>'), 'nested include should share page data');
    assert(home.includes('<main><h1>Home</h1></main>'), 'layout default slot should render page content');
    assert(docs === '<header>JquanUI</header><p>Ready</p>', 'directory output should preserve nested entry paths');

    const single = await buildTemplatePages('pages/index.html', {
      root: fixture,
      output: 'single.html',
      templates: 'templates',
      data
    });
    assert(single.count === 1 && fs.existsSync(path.join(fixture, 'single.html')), 'single-page build should accept an exact output filename');

    const runtime = createNodeTemplateRuntime({ root: fixture, templates: 'templates' });
    const rendered = await renderTemplateFile('pages/docs/start.html', { root: fixture, runtime, data });
    assert(rendered.html.includes('Ready'), 'renderTemplateFile should reuse a caller-provided runtime');

    const templateBundle = createTemplateBundle('templates', { root: fixture, templates: 'templates' });
    assert(templateBundle.count === 3, 'template bundle should include every HTML fragment');
    assert(templateBundle.report.entries.length === 3 && templateBundle.report.bundleBytes === templateBundle.bytes, 'template bundle should expose a dependency report');
    assert(templateBundle.report.entries.find(entry => entry.name === 'layout.html').dependencies.includes('header.html'), 'template bundle report should expose static include dependencies');
    assert(templateBundle.report.entries.find(entry => entry.name === 'layout.html').dynamicDependencies.length === 0, 'static template dependencies should not be classified as dynamic');
    assert(templateBundle.templates['nested/safe.html'].includes('</script>'), 'template bundle should preserve source text');
    assert(!templateBundle.code.includes('</script>'), 'template bundle JavaScript should escape script-closing text');
    let registeredTemplates = null;
    const bundleContext = {
      window: null,
      JquanUIComponents: { templateApi: { registerTemplates(value) { registeredTemplates = value; } } }
    };
    bundleContext.window = bundleContext;
    vm.runInNewContext(templateBundle.code, bundleContext);
    assert(registeredTemplates && registeredTemplates['header.html'].includes('siteName'), 'a late-loaded bundle should register with an existing Template API');
    assert(bundleContext.JQUAN_TEMPLATES['nested/safe.html'].includes('</script>'), 'bundle should expose templates for a later-loaded component');
    const writtenBundle = writeTemplateBundle('templates', { root: fixture, templates: 'templates', output: 'public/jquan.templates.js' });
    assert(writtenBundle.output === path.join(output, 'jquan.templates.js'), 'writeTemplateBundle should return the emitted path');
    const reportPath = path.join(output, 'jquan.templates.json');
    require('../dist/cli/jquan-extract.cjs').writeTemplateBundleReport(writtenBundle, reportPath, fixture);
    assert(JSON.parse(fs.readFileSync(reportPath, 'utf8')).count === 3, 'template bundle report should be writable as JSON');
    const previousCwd = process.cwd();
    process.chdir(fixture);
    try {
      const cliBundle = await main([
        '--bundle-templates', './templates',
        '--template-bundle-output', './public/cli.templates.js',
        '--templates', './templates'
      ]);
      assert(cliBundle.ok && fs.existsSync(path.join(output, 'cli.templates.js')), 'CLI template bundle options should emit a browser bundle');
    } finally {
      process.chdir(previousCwd);
    }

    write(path.join(pages, 'broken.html'), "{% include 'missing' %}");
    let buildError = null;
    try {
      await renderTemplateFile('pages/broken.html', { root: fixture, templates: 'templates' });
    } catch (error) {
      buildError = error;
    }
    assert(buildError && buildError.entryFile.endsWith('broken.html'), 'build errors should identify the HTML entry');
    assert(buildError.message.includes('missing.html'), 'build errors should preserve the missing include name');

    console.log('[JquanUI] template static build check ok');
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
