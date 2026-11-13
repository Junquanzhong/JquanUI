# JquanUI Static Extractor

Build-time CSS extraction for JquanUI. This CLI scans source files, reuses `dist/core/JquanUI@Core.js`, and writes a static CSS file containing the base runtime CSS plus rules for discovered classes.

## Usage

```bash
node dist/cli/jquan-extract.cjs --init
node dist/cli/jquan-extract.cjs --input ./index.html --output ./dist/jquan.css
node dist/cli/jquan-extract.cjs --input ./src --output ./dist/jquan.css --minify
node dist/cli/jquan-extract.cjs --input ./src --output ./dist/jquan.css --config ./jquan.config.cjs
node dist/cli/jquan-extract.cjs --input ./src --baseline-output ./dist/jquan.base.css --utilities-output ./dist/jquan.utilities.css --minify
node dist/cli/jquan-extract.cjs --input ./src --output ./dist/jquan.css --report ./dist/jquan.report.json --fail-on-warn
node dist/cli/jquan-extract.cjs --doctor --json
node dist/cli/jquan-extract.cjs --render-html ./pages --html-output ./dist --templates ./templates --data ./site.json
node dist/cli/jquan-extract.cjs --bundle-templates ./templates --template-bundle-output ./dist/jquan.templates.js --templates ./templates
```

When `--config` is omitted, the extractor looks for `jquan.config.cjs`, `jquan.config.js`, then `jquan.config.json` in the current working directory.

## Node API

```js
const { extractFromFiles, renderCriticalCss, injectCriticalCss, createCriticalStyleTag, diagnoseProject } = require('jquanui');

const build = extractFromFiles(['./index.html', './src'], {
  minify: true,
  configFile: './jquan.config.cjs'
});
console.log(build.css);
console.log(build.baselineCss);
console.log(build.utilityCss);
console.log(build.report.unresolvedClasses);

const doctor = diagnoseProject({ inputs: ['./index.html', './src'] });
console.log(doctor.ok);
console.log(doctor.warnings);

const critical = renderCriticalCss('<div class="container dark:bg-slate-900"></div>', {
  minify: true,
  config: {
    shortcuts: {
      'btn-primary': 'inline-flex items-center px-4 py-2 bg-blue-500 text-white hover:bg-blue-600'
    }
  }
});
console.log(critical.css);

const rendered = injectCriticalCss(
  '<html><head></head><body><div class="container"></div></body></html>',
  {
    minify: true,
    id: 'jquan-critical',
    nonce: 'server-csp-nonce',
    attributes: { 'data-route': '/dashboard' },
    replaceExisting: true
  }
);
console.log(rendered.html);

const styleTag = createCriticalStyleTag(critical.css, {
  id: 'jquan-critical',
  nonce: 'server-csp-nonce'
});
```

`renderCriticalCss(html)` returns CSS for one server-rendered HTML string. `createCriticalStyleTag(css)` returns a CSP-ready `<style>` tag. `injectCriticalCss(html)` returns `{ html, css, styleTag, classes, attributes }` and inserts the style tag before `</head>`.

SSR style options:

- `id`: adds a stable id and lets `injectCriticalCss()` replace a previous matching tag.
- `nonce`: adds a CSP nonce for strict server-rendered pages.
- `attribute`: keeps the legacy marker, defaulting to `data-jquanui-critical`; set `false` to disable it.
- `attributes`: adds custom attributes such as route/build markers.
- `replaceExisting`: defaults to `true`; set `false` to append another critical style tag.

## SSR Framework Adapters

Use the optional, dependency-free `jquanui/ssr` bridge when a framework renderer needs one stable Critical CSS boundary. The bridge receives framework render functions instead of taking a framework dependency.

```js
const { createReactSSRAdapter, createVueSSRAdapter, createSvelteSSRAdapter, createNextSSRAdapter } = require('jquanui/ssr');

const react = createReactSSRAdapter({ renderToString }, {
  critical: { id: 'jquan-critical', nonce: cspNonce, minify: true }
});
const page = react.renderPage(App, { url }, { document: true });

const vue = createVueSSRAdapter({ renderToString });
const vuePage = await vue.renderPage(app, context, { document: true });

const svelte = createSvelteSSRAdapter({ render });
const sveltePage = svelte.renderPage(Component, props, { document: true });

const next = createNextSSRAdapter({ critical: { nonce: cspNonce } });
const transformed = next.inject(renderedHtml);
```

React renderers are synchronous, Vue renderers may return a promise, and Svelte renderers may return `{ html, head, css }`. `document: true` preserves Svelte head/CSS while creating a complete document. For Next/Nuxt, use `inject(renderedHtml)` at the final HTML-response boundary. `createSSRAdapter()` supports other render functions without adding a second CSS generator.

For an application-owned HTML shell, provide `document(rendered, options)` in `createSSRAdapter()` or an adapter option. That factory is reused by `renderPage(..., { document: true })` and `adapter.createDocument(...)`, while `inject()` continues to apply the shared Critical CSS pipeline.

Type declarations are included for the root package and subpaths:

```ts
import type { JquanConfig, ExtractResult, ExtractionReport } from 'jquanui';
```

## Static HTML Template Build

Expand external `include` and `layout` files before deployment:

```bash
npx jquan-extract --render-html ./pages --html-output ./dist --templates ./templates --data ./site.json
```

- `--render-html` accepts an HTML file, directory, or glob and can be repeated.
- `--html-output` is an exact file for one entry or a directory for multiple entries.
- `--templates` is the root for external `.html/.htm` include and layout files.
- `--data` is an optional JSON object shared by every page.
- `--safe` enables safe expressions, HTML sanitization, resource protocol validation, and the default filter allowlist. Runtime integrations can additionally configure `safeResourceProtocols`, `safeDataImages`, and a post-sanitization hook.
- Directory builds preserve each entry's relative path.
- Includes cannot escape the template root with `..`.

The Node API uses the same Template component parser and error shape as the browser runtime:

```js
const { buildTemplatePages, renderTemplateFile } = require('jquanui');

await buildTemplatePages('./pages', {
  output: './dist',
  templates: './templates',
  data: { siteName: 'JquanUI' }
});

const page = await renderTemplateFile('./pages/index.html', {
  templates: './templates',
  data: { siteName: 'JquanUI' }
});
console.log(page.html);
```

Browser mounts may set `patch: true` for large templates with frequent updates. It is opt-in; the default remains `innerHTML` for maximum throughput.

For client-rendered templates, generate an in-memory browser bundle instead of final HTML:

```bash
npx jquan-extract --bundle-templates ./templates --template-bundle-output ./dist/jquan.templates.js --templates ./templates
npx jquan-extract --bundle-templates ./templates --template-bundle-output ./dist/jquan.templates.js --template-bundle-report ./dist/jquan.templates.json --templates ./templates
```

The bundle preserves template-root-relative names, escapes script-closing content, populates `window.JQUAN_TEMPLATES`, and calls `templateApi.registerTemplates()` when the component is already loaded. It can therefore load before or after `template.js`.
`--template-bundle-report` writes the exact template names, source paths, source bytes, count, and generated bundle bytes.

## Vite Plugin

```js
// vite.config.js
const jquanUI = require('jquanui/vite');

module.exports = {
  plugins: [
    jquanUI({
      input: ['index.html', 'src'],
      output: 'assets/jquan.css',
      configFile: './jquan.config.cjs',
      report: 'assets/jquan.report.json',
      failOnWarn: true,
      inject: 'style',
      minify: true,
      templateInput: 'templates',
      templateRoot: 'templates',
      templateBundle: 'assets/jquan.templates.js',
      templateBundleReport: 'assets/jquan.templates.json'
    })
  ]
};
```

The plugin emits `assets/jquan.css` during build and injects static CSS into HTML by default.

### Baseline CSS split

Every extraction result contains three coordinated CSS strings: `css` (the compatible single file), `baselineCss` (preflight, theme variables, Core variables, plugin base styles, and keyframes), and `utilityCss` (the discovered utility rules). The single-file `css` output remains the default. For independently cacheable files, use:

```bash
node dist/cli/jquan-extract.cjs --input ./src \
  --baseline-output ./dist/jquan.base.css \
  --utilities-output ./dist/jquan.utilities.css --minify
```

Load the two files in baseline-then-utilities order. Reuse the baseline only while the Core version, theme, and plugin configuration are unchanged.

`configFile` accepts `.json`, `.js`, or `.cjs` files. You can also pass a config object directly with `config`. When neither is provided, the plugin auto-discovers `jquan.config.cjs`, `jquan.config.js`, or `jquan.config.json` from the Vite root and watches that file during development. Set `configFile: false` to disable auto-discovery.

If `input` is omitted, the Vite plugin uses `config.content` first and falls back to `['index.html', 'src']`.

Set `report: 'assets/jquan.report.json'` to emit the same JSON diagnostics as the CLI. Set `failOnWarn: true` to fail the Vite build when unresolved classes or failed rules are found.

External `.html/.htm` template fragments use HMR by default in Vite serve mode. The plugin injects a development-only module client and bridges file changes to the Template component through `jquan:template:update`; matching cache entries are invalidated and mounted instances rerender asynchronously. Set `templateHmr: false` to disable this integration. Production builds never inject the HMR client.

`templateBundle` is opt-in. When set, Vite emits the template map, adds its source files to the watch graph, and injects the generated script using the configured Vite base path. `templateBundleReport` optionally emits its dependency report. Set `templateBundleInject: false` only when the application manages that script itself. Projects without `templateBundle` perform no template bundle scan.

Injection modes:

- `inject: 'style'`: inline generated CSS into `<head>` for zero-request critical CSS.
- `inject: 'link'`: inject `<link rel="stylesheet" href="/assets/jquan.css">`.
- `inject: false`: disable HTML injection and import/use the CSS manually.

You can also import the virtual CSS module:

```js
import 'virtual:jquanui.css';
```

Vite can emit and inject independently cacheable files with `split: true`:

```js
jquanUI({
  input: ['index.html', 'src'],
  split: true,
  baselineOutput: 'assets/jquan.base.css',
  utilitiesOutput: 'assets/jquan.utilities.css',
  inject: 'link'
});
```

Split mode emits two stylesheet assets and injects them in baseline-then-utilities order. Use `inject: 'style'` to inline both parts, or `inject: false` when the application manages the links.

## PostCSS Plugin

```js
// postcss.config.cjs
const jquanUI = require('jquanui/postcss');

module.exports = {
  plugins: [
    jquanUI({
      input: ['index.html', 'src'],
      configFile: './jquan.config.cjs',
      report: 'jquan.report.json',
      failOnWarn: true,
      minify: true
    })
  ]
};
```

Use `@jquanui utilities;` in your CSS where generated utilities should be inserted:

```css
@jquanui utilities;
```

If no directive is present, set `inject: true` to append generated CSS to the end of the stylesheet. The plugin emits diagnostics through PostCSS `result.messages` as an asset-style message when `report` is set.

For explicit split composition, enable `split: true` and place both directives in order:

```css
@jquanui baseline;
@jquanui utilities;
```

`@jquanui baseline;` inserts reusable base CSS and `@jquanui utilities;` inserts only discovered utility rules. Without `split: true`, the existing `@jquanui utilities;` behavior remains a compatible full CSS replacement. `baselineOutput` and `utilitiesOutput` can additionally write the two parts as PostCSS assets.

PostCSS can also emit a client-rendered template bundle:

```js
jquanUI({
  input: ['index.html', 'src'],
  templateInput: 'templates',
  templateRoot: 'templates',
  templateBundle: 'dist/jquan.templates.js',
  templateBundleReport: 'dist/jquan.templates.json'
});
```

The bundle is written during the PostCSS pass and reported as an asset message. This option is disabled by default.

## Container Query Variants

JquanUI core `4.6.0+` supports container query variants:

```html
<section class="container-type-inline-size container-name-sidebar">
  <div class="@sm:bg-red-500 @sidebar/md:flex @[width>30rem]:grid"></div>
</section>
```

- `@sm:bg-red-500` -> `@container (min-width: 24rem)`.
- `@sidebar/md:flex` -> `@container sidebar (min-width: 28rem)`.
- `@[width>30rem]:grid` -> custom container condition.
- `container-name-sidebar` -> `container-name: sidebar`.

## Modern Selector Variants

JquanUI core `4.7.0+` supports `:has()` and child selector variants:

```html
<label class="has-checked:bg-red-500 has-[input:checked]:text-white">
  <input type="checkbox">
</label>

<div class="group">
  <button class="group-has-focus:flex"></button>
</div>

<div class="*:p-2 **:text-sm"></div>
```

- `has-checked:bg-red-500` -> `&:has(:checked)`.
- `has-[input:checked]:text-white` -> custom `:has(input:checked)`.
- `group-has-focus:flex` -> `.group:has(:focus) &`.
- `peer-has-invalid:block` -> `.peer:has(:invalid) ~ &`.
- `*:p-2` -> direct children.
- `**:text-sm` -> all descendants.

## Runtime Diagnostics

JquanUI core `4.8.0+` exposes runtime diagnostics:

```js
const report = window.JquanUI.debug();
// Alias:
const sameReport = window.JquanUI.diagnose();

// Enable conflict tracking when you are actively debugging class overrides:
const conflictReport = window.JquanUI.debug({ track: true });
```

The report includes processed class counts, dynamic rule counts, queue size, cache status, installed plugins, unresolved classes, and failed rule insertions.

JquanUI core `4.9.0+` also reports likely class conflicts in `report.conflicts`, such as multiple display utilities (`flex grid`), position utilities (`relative absolute`), spacing overrides (`p-2 p-4`), and competing color utilities.
Conflict tracking is opt-in in `4.12.1+` to keep production scans cheap. Enable it with `window.JquanUI.debug({ track: true })`, `window.JQUAN_CONFIG = { debug: { trackConflicts: true } }`, or `diagnostics.trackConflicts`.

## Project Doctor

JquanUI `4.12.0+` includes a project doctor for CI and local troubleshooting:

```bash
node dist/cli/jquan-extract.cjs --doctor
node dist/cli/jquan-extract.cjs --doctor --json
```

`diagnoseProject()` checks config discovery, content input resolution, core version, discovered files/classes, generated rule count, CSS byte size, unresolved classes, failed rules, and likely conflicts. The CLI exits with a failing status when doctor warnings are present, so it can be used as a lightweight CI gate before a full build.

## Shortcuts / @apply-style Composition

JquanUI core `4.10.0+` supports shortcut utilities through config:

```js
// jquan.config.cjs
module.exports = {
  content: ['index.html', 'src/**/*.{js,jsx,ts,tsx,vue,svelte,astro,html}', '!src/legacy/**'],
  safelist: [
    'opacity-0',
    { class: 'bg-brand-500', variants: ['hover', 'dark'] }
  ],
  blocklist: ['debug-only', /^legacy-/],
  shortcuts: {
    'btn-primary': 'inline-flex items-center px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-700'
  },
  theme: {
    extend: {
      colors: {
        brand: { 500: '#3366ff' }
      }
    }
  }
};
```

Using `class="btn-primary bg-brand-500"` generates base declarations, variant rules such as `.btn-primary:hover` and `.dark .btn-primary`, plus any theme extensions. Runtime usage can still set the same object on `window.JQUAN_CONFIG`.

Build-time extraction also honors:

- `content`: files or directories to scan when CLI/API/Vite input is omitted.
- `content` supports files, directories, `*`, `**`, `?`, brace sets like `*.{js,vue}`, and `!` exclusions.
- `safelist`: classes that should always be generated; objects may include `variants`.
- `blocklist`: exact class names or regular expressions to exclude from generated output.

## Options

- `--input`, `-i`: file or directory to scan. Can be repeated.
- `--output`, `-o`: output CSS file.
- `--core`: runtime core file to reuse. Defaults to `dist/core/JquanUI@Core.js`.
- `--config`, `-c`: JquanUI config file (`.json`, `.js`, or `.cjs`). Defaults to auto-discovery from the working directory.
- `--report`: write a JSON extraction report with files, class counts, unresolved classes, failed rules, and conflicts.
- `--doctor`: inspect project extraction health without writing CSS.
- `--json`: print `--doctor` output as JSON.
- `--fail-on-warn`: exit with code `1` when unresolved classes or failed rule insertions are found.
- `--init`: create a starter `jquan.config.cjs`.
- `--force`: overwrite an existing config when used with `--init`.
- `--minify`: write compact CSS.

Supported scan extensions: `.html`, `.htm`, `.js`, `.jsx`, `.ts`, `.tsx`, `.vue`, `.svelte`, `.astro`.

The scanner recognizes static class attributes plus common composition forms such as `className={...}`, Vue `:class`, and string literals inside `clsx()`, `classNames()`, `cn()`, `cva()`, and `twMerge()` calls.

Every extraction result includes `report`, so CI and framework integrations can inspect `unresolvedClasses`, `failedRules`, and `conflicts` without parsing console output.

The API reuses the runtime core parser, so CLI output stays aligned with runtime behavior for variant groups, arbitrary values, dark mode, container, shadow, and plugin-registered utilities.

## CSS Migration Audit

`jquan-migrate` audits legacy or project CSS without changing source files:

```bash
jquan-migrate --input ./css --output ./reports/jquan-migration.json --config ./jquan.config.cjs
jquan-migrate --input ./css --format markdown --output ./reports/jquan-migration.md
jquan-migrate --input ./css --semantic-only --min-semantic 60
jquan-migrate --input ./css --source ./src --format markdown --output ./reports/jquan-migration.md
jquan-migrate --source ./src --max-order 0 --output ./reports/class-order.json
```

The report separates direct semantic replacements, arbitrary-value candidates, and declarations requiring manual review. It understands configured colors, spacing, fluid tokens, breakpoints, Tailwind-compatible `screens`, `borderRadius`, `fontSize`, `fontWeight`, and `lineHeight`, and preserves simple pseudo/media/supports context in suggestions such as `tablet:hover:bg-brand`. Tailwind plugins and unsupported configuration keys are reported as review items and are never executed.

`--semantic-only` suppresses arbitrary property suggestions.

Dark-mode migration is a separate read-only source audit:

```bash
jquan-migrate --source ./src --dark-audit --format markdown --output ./reports/dark-audit.md
jquan-migrate --source ./src --dark-audit --max-dark-missing 0 --output ./reports/dark-audit.json
```

The report lists hardcoded palette colors, fixed shadows, semantic role classes, and candidates without a `dark:` variant with source, line, and class-string context. `semantic-role` is a migration direction, not proof that the role is configured; shadows remain manual review. The tool does not reinterpret `bg-white`, add `dark:` automatically, or rewrite source. `--max-dark-missing` exits with status `2` when the count exceeds the threshold.
Add `--source` to audit class order in HTML/JS/JSX/TS/Vue/Svelte/Astro source; the auditor reports `original` and `sorted` values but never rewrites files. `--min-semantic` and `--min-expressible` accept percentages, `--max-manual` accepts a percentage, and `--max-order` accepts a count. Any failed threshold exits with status `2`, making gradual migration measurable in CI. Complex selectors, gradients, masks, shadows, transforms, and keyframes remain manual by design.

`--dark-audit` requires `--source`; `--max-dark-missing` requires `--dark-audit` and a non-negative integer. No matching source files or invalid options exit with status `1`. The report counts unique class strings per file, records the first discoverable location, and uses `line: null` when a decoded binding cannot be located. Pairing requires the same property, importance and ordered non-dark variant chain (`hover`, breakpoints, arbitrary selectors). Supported mode variants are `dark`, `dark-class`, and `dark-media`. Grouped variants and explicit arbitrary color utilities are recognized. Only known palette names, explicit color values, standard role names, and configured `theme.semantic` names are classified; arbitrary runtime concatenation, shortcut expansion, standalone CSS, and conditional execution are not evaluated. A detected pairing is an audit hint, not a contrast or computed-style guarantee.

Programmatic usage is available from the root package and `jquanui/migrate` (CJS or ESM); these synchronous functions allocate no observers and need no teardown:

```js
const { migrate } = require('jquanui');
const darkAudit = migrate.auditDarkFiles(['./src'], { root: process.cwd(), config });
const report = migrate.auditCssFiles(['./css'], { config });
report.darkAudit = darkAudit;
console.log(migrate.formatMigrationReport(report));
// ESM: import { auditDarkFiles, auditDarkSource } from 'jquanui/migrate';
// In-memory input: auditDarkSource('<div class="bg-white"></div>', { source: 'card.html', config });
```

| API / option | Input | Default | Return |
| --- | --- | --- | --- |
| `auditDarkSource(source, options?)` | source text | required | `DarkAuditFileReport` |
| `auditDarkFiles(inputs, options?)` | string or string[] of files/directories | required | `DarkAuditReport` |
| `options.root` | input resolution directory | current working directory | files only |
| `options.source` | label for in-memory input | null | source field |
| `options.config` | JquanUI config, reads semantic role names | {} | role classification |

Each report contains `summary` and `candidates`; file reports also include `findings`, and aggregate reports include `files`. `summary` counts class strings, candidates, hardcoded colors, shadows, semantic roles and missing dark variants. Each candidate carries `token`, `kind`, `property`, suggested `role`, `reason`, `hasDarkVariant`, `missingDarkVariant`, source and line. Pairing candidates may include existing dark classes; the threshold counts only missing non-role candidates. Semantic role detection does not validate the configured light/dark color values.

`classStrings` counts unique strings containing at least one classified candidate in each file. `--output` must differ from the audited source paths (including resolved symlinks); a collision exits with status `1` before writing.

## Design Tokens Bridge

Convert W3C Design Tokens JSON into JquanUI config:

```bash
node dist/cli/jquan-tokens.cjs import --input ./design.tokens.json --output ./jquan.config.json
```

Convert JquanUI config back into Design Tokens JSON:

```bash
node dist/cli/jquan-tokens.cjs export --input ./jquan.config.json --output ./design.tokens.json
```

Supported groups: `color/colors`, `spacing`, `radius`, `fontFamily`, and `semantic`.
