# JquanUI

JquanUI is a runtime atomic CSS engine with build-time extraction tools for CLI, Vite, PostCSS, SSR critical CSS, and W3C Design Tokens workflows.

## Current component integration

Dialog, Modal, Drawer, Popover and Select consume OverlayManager for ordered dismissal and focus restoration. Load with `await JquanUI.import('popover')` or `await JquanUI.import('drawer')`; the local importer loads dependencies. Popover mount returns a stable handle and preserves the boolean state API; Drawer exposes Modal lifecycle state. See the component pages for options, teardown and limitations.

i18n now documents nested/flat messages, initialization, persistent switching, dynamic roots and structured text. Carousel/Tabs pages include complete declarative and imperative examples plus API summaries; mount options before automatic enhancement. Project skill examples follow the same lifecycle.

Carousel/Tabs expose stable handles, cancel stale callbacks on update/destroy and isolate replacements. Carousel update restores its original content snapshot. See component API pages and run `npm run check:highfreq-lifecycle` for four-entry regression.

Review Mode loads through `JquanUI.import('reviewMode')` and reuses Copy. Core, minified Core, Full and Components omit it: the complete importer catalog retains `reviewMode.js`, while `onDemandOnly` excludes it from bundles. Configuration or URL parameters alone do not download it; application entries handle loading and retries. See the examples for integration.

Review Mode 0.18.0 edits text, 35 semantic utility fields, allowed attributes and mounted options. Carousel 1.8+ adds no-loss `indicators` / `progress` switches. Use `JquanUI.import('reviewMode')`, then `configure({enabled:true,root})` and `open()`; `copyPlan`, drafts, undo/redo and `applyPlan` share the normalized plan. Source mapping remains application work.

`applyPlan(plan)` defaults to dry-run: it checks page, unique stable locator, schema and original values. Apply with `{dryRun:false}` in an open, clean session after reviewing empty issues. Successful changes support undo/reset/destroy; external updates remain conflicts, including interrupted component callbacks. Ctrl/Cmd+Z and Shift+Z/Y operate on applied history while text fields retain native undo. Passive refreshes preserve the focused dirty text/attribute/number input and caret; clean inputs follow source. Selecting another element, explicit edits or closing discard unsubmitted input, which stays out of exported/saved plans. See [live input](examples/review-mode-input-drafts.html), [manual-copy fallback](examples/review-mode-manual-copy.html) and [plan application](examples/review-mode-apply.html). Copy failures show a selectable read-only plan in the review panel.

## Ecosystem design rule

Core now supports ordinary `theme` / `theme.extend` tokens: `borderRadius` (`radius` alias), `boxShadow` and `fontSize`. For example, configure `borderRadius: {card:'18px'}`, `boxShadow: {soft:'0 16px 40px rgba(86,103,214,0.12)'}` and `fontSize: {headline:['37px',{lineHeight:'1.25',fontWeight:650}]}` before loading Core, then use `rounded-card shadow-soft text-headline`. Extend merges built-ins and overrides matching base theme names; explicit customUtilities take priority. A string font size emits only font-size. See [the runnable example](examples/core-config-tokens.html) and the theme documentation for default names, reserved tokens and options.

`JquanUI.debug().configWarnings` / `diagnose().configWarnings` return detached `{path,code,message}` entries for theme configuration errors; invalid entries are skipped while valid siblings initialize. This covers theme keys and token structures, not every CSS property's grammar or component/plugin configuration. Extraction exposes the same `report.configWarnings`, includes them in `report.warnings`, and doctor reports their paths. CLI `--fail-on-warn` and Vite/PostCSS `failOnWarn` include configuration warnings; otherwise valid CSS still emits with diagnostics in the report. Configuration objects are not mutated; frozen configs work. The runtime cache format changes to invalidate rules generated before these token semantics. Run `npm run check:core-config` and `npm run check:core-performance`.

JquanUI follows **reuse first, evolve existing components, then add independent components**. If an existing component lacks a general capability, extend it with backward-compatible API, types, documentation, and regression coverage; new components consume the extension instead of duplicating HTTP, storage, state, table, pagination, validation, or template logic.

Every new component, feature, public API, configuration option, variant, or atomic utility requires accompanying documentation. Extensions update the existing documentation. Each entry should state its purpose, import/install path, minimum example, parameters or class names, return/state behavior, dependencies, limitations, and composition with existing JquanUI components. Run `npm run check:docs` before accepting a change.

The component documentation is available in [`components.html`](components.html), and AI-oriented component usage rules are maintained in [`skills/jquanui/SKILL.md`](skills/jquanui/SKILL.md).

The standalone `favicon` component manages the browser tab icon without adding a favicon library. Load `dist/components/favicon.js` after Core, then install it:

```html
<script src="./dist/core/JquanUI@Core.js"></script>
<script src="./dist/components/favicon.js"></script>
<script>
JquanUI.use(JquanUIComponents.favicon);
JquanUIComponents.faviconApi.set('/assets/brand.svg');
JquanUIComponents.faviconApi.badge(12, { color: '#dc2626' });
JquanUIComponents.faviconApi.status('success');
</script>
```

Use `create()` for an independently managed handle, `watch({ light, dark })` for a theme-aware icon, `clear()` to return to the instance base icon, and `restore()` or `destroy()` to return the original `<link rel="icon">`. Sources may be a safe image URL, a sanitized SVG string, or a canvas. Badge text is capped and SVG input rejects scripts, event attributes, and unsafe resource protocols.

The engine-only development roadmap is documented in the repository’s [ROADMAP.md](./ROADMAP.md); this planning document stays in the repository and is excluded from the npm package. The external HTML template loader for multi-page static sites is available through the optional Template component.

### Runtime performance metrics

The browser Core exposes a low-cost, read-only `JquanUI.getMetrics()` snapshot for development diagnostics. It does not trigger a new DOM scan or enable conflict tracking. The snapshot includes `totalResolves`, processed and injected rule counts, queue state, cache hydration status and hit rate, scan/queue timing averages, budget warnings, and the slowest resolved class.

```js
const metrics = JquanUI.getMetrics();
console.table({
  classes: metrics.processedClassCount,
  rules: metrics.dynamicRuleCount,
  resolves: metrics.totalResolves,
  cacheHitRate: metrics.cacheHitRate,
  lastScanMs: metrics.performance.lastScanMs,
  slowest: metrics.slowestResolve?.className || 'none'
});
```

### Opt-in dark mapping for legacy color classes

Existing pages can map selected legacy colors to semantic dark roles without changing markup. Configure this before loading Core; the default is disabled.

```html
<script>
window.JQUAN_CONFIG = {
  darkMapping: {
    enabled: true,
    map: { white: 'surface', 'slate-700': 'text', 'slate-200': 'border' }
  },
  theme: { semantic: {
    surface: { light: 'white', dark: 'slate-900' },
    text: { light: 'slate-700', dark: 'slate-100' },
    border: { light: 'slate-200', dark: 'slate-700' }
  } }
};
</script>
```

Classes such as `bg-white/90`, `text-slate-700`, `border-slate-200`, `ring-*`, and `placeholder:text-*` keep their light rule and receive `.dark` plus system-dark overrides. Opacity suffixes are preserved. Explicit `dark:` variants take precedence; unmapped classes keep their existing behavior. Mapping includes the theme element itself. Explicit overrides assume equal importance and comparable states: `!bg-white` still wins over a normal `dark:bg-*`. Keys omit opacity suffixes and targets must exist in `theme.semantic`; font sizes, widths, arbitrary values and shadows are excluded. The token map applies across color properties, so review white text before mapping `white` to a surface role. Use `placeholder:text-slate-700` for placeholders. Run `npm run check:dark-mapping` for runtime/static and cold/warm browser coverage, and `npm run check:semantic-theme` for Table role colors and DOM/focus preservation.

Use `JquanUI.debug()` or `JquanUI.diagnose()` when unresolved classes, failed rules, conflicts, plugin state, or cache limits are needed. Keep metrics and conflict tracking out of production telemetry unless explicitly required.

### Budgeted runtime prefetch

Use `JquanUI.prefetch()` to warm styles for an upcoming route, dialog, async block, or component before it becomes visible. It accepts only explicit class names, never scans the DOM, and reuses the same parser, canonical rule ordering, CSSOM sheet, and cache as normal runtime compilation.

```js
const result = JquanUI.prefetch([
  'grid',
  'gap-4',
  'hover:bg-primary/90',
  'before:block'
], {
  maxClasses: 40,
  maxBytes: 32000,
  timeoutMs: 16
});

console.log(result.accepted);
console.table(result.skipped);
```

`maxClasses` limits the number of unique expanded tokens considered in one call. `maxBytes` limits the UTF-8 bytes of new CSS prepared for insertion, and `timeoutMs` limits synchronous work. Defaults are `100`, `100000`, and `50`. The result contains `requested`, `accepted`, `skipped`, `ruleCount`, `bytes`, `durationMs`, the effective budgets, `reason`, and `truncated`. Each skipped item reports `max-classes`, `max-bytes`, or `timeout`. Already processed classes remain accepted without duplicate rules or byte cost; unresolved explicit classes follow the normal runtime diagnostic path and can be inspected with `JquanUI.debug()`.

Pass complete class names such as `md:grid` or `hover:bg-primary/90`. Do not pass unbounded patterns such as `hover:*` or `bg-*`. Use `compile()` for an awaitable known batch; use `prefetch()` when warming optional UI requires a bounded, observable result.

### Dynamic compilation completion

`npm run build:bundles` formats both Core and components in Full with the locked Terser formatter (`compress: false`, `mangle: false`, license comments retained); standalone sources keep development comments. Use `npm run check:bundles` to detect generated drift. The public archive export remains available.

Core alone provides `compile(classes, { sync: false })` and `flush({ maxMs: Infinity })`, both returning `Promise<CompileResult>`. Inputs may be a string or iterable; variant groups expand and duplicate tokens collapse. Default cold queues of at most 20 classes run synchronously; larger queues use idle chunks of at most 40. `await compile()` waits for the requested classes, including already processed ones, rather than unrelated future work. `{ sync: true }` synchronously drains the shared queue and may block the main thread.

```js
const done = await JquanUI.compile(['grid', 'gap-4', 'hover:(bg-primary/90 text-white)']);
if (done.complete && !done.cancelled && !done.unresolved.length && !done.failed.length) {
  showPreparedContent();
}

const pending = JquanUI.compile(dynamicClasses);
const partial = await JquanUI.flush({ maxMs: 8 });
console.log(partial.pending, partial.reason);
const completed = await pending;
```

Results contain `requested`, `processed`, `unresolved`, `failed`, `pending`, `complete`, `cancelled`, `reason`, `remaining` and `durationMs`. `processed` means an attempt finished; `complete` means none of this request remains pending. Check unresolved and failed separately: failed classes may have partially inserted rules, and browsers can silently ignore invalid declarations. `remaining` is the shared queue snapshot, while compile duration includes scheduling wait. Results are detached arrays; diagnostic sample limits do not truncate them.

`flush()` performs cooperative synchronous work before returning its Promise. A nonnegative numeric `maxMs` is checked before each class; `0` processes none, omission drains the queue. One resolver/CSSOM operation is indivisible and can overrun the budget. Invalid budgets throw `RangeError`. Partial results use `reason: 'budget'`; a reentrant flush uses `'busy'` and cannot recursively drain. It neither scans DOM nor runs plugin scan hooks, and it does not consume undelivered MutationObserver records. Insert DOM before using `enhance(root)`, or compile explicit classes before revealing content. `isReady()`/`jquan:ready` only covers initial readiness.

`destroy()` and supported first late configuration settle pending requests with `cancelled: true` and `reason: 'destroyed'`/`'config-changed'`. Missing stylesheets settle with `'stylesheet-unavailable'` and pending classes; restore the sheet and retry compile/flush. Normal completion uses null reason. Ignore stale async UI results after view teardown. Processed outcomes, including unresolved/failed attempts, are reused and preserved by cache format 5; earlier cache formats invalidate. Repeated compile is not a retry for an already processed failure after token changes. See [the runnable example](examples/core-compile-completion.html), `content/jit-syntax.js`, and `npm run check:core-compile`.

### Read-only batch class diagnostics

Core provides `checkClasses(classNames, options?)` to query current resolution without inserting CSS, draining queues, scanning DOM or updating Core's processed classes, diagnostics, metrics or cache. It accepts a string or finite iterable, expands groups and deduplicates like compile. Custom/plugin resolvers still execute and must themselves be pure. `resolve(className)` remains a single query whose exceptions propagate; checkClasses isolates each resolver error.

```js
const report = JquanUI.checkClasses(
  ['grid', 'hover:(p-2 m-2)', 'business-marker'],
  { maxClasses: 1000, timeoutMs: 50 }
);
console.table(report.results);
```

`requested` contains normalized tokens; `results` contains the same number of ordered entries with `className`, `status`, `css`, `error`, `reason`, and `runtime`. `status` is `resolved` (CSS string), `unresolved` (no match), `error` (detached `{name,message}`), `ignored` (reserved `jquan-ready` marker) or `skipped` (budget). Null fields stay null when inapplicable. `runtime` is the snapshot at entry: `unprocessed`, `pending`, `processed`, `unresolved`, `resolve-error`, or `insert-error`. Current resolution can succeed even when historical compilation failed. The latter states are preserved by cache format 5; previous caches invalidate. Scanning/compiling `jquan-ready` no longer records an unresolved sample; direct resolve still returns null.

`maxClasses` defaults to 1000 (nonnegative safe integer or Infinity); `timeoutMs` defaults to 50 (nonnegative number or Infinity). Invalid budgets throw RangeError. Zero skips every requested token; the count limit wins when both are zero. Budgets check before each class, exclude enumeration/normalization and cannot interrupt a resolver. `complete` means no skips; `ok` additionally requires all entries resolved/ignored. An empty request has both true. Top-level `reason` is `max-classes`, `timeout` or null; `maxClasses`, `timeoutMs` and `durationMs` report effective limits and query time. A final resolver can overrun the soft time limit while complete remains true. Results are detached and uncapped by debug's 80-item sample limit.

Resolution follows existing tolerant parser behavior; it is not browser CSS validation. A business marker can legitimately be unresolved, and browser-ignored declarations may still resolve. Use compile's `failed` and checkClasses runtime phases to diagnose actual previous attempts. A skipped query neither compiles nor records failure. `debug()/diagnose()` without options remain snapshots; `{track:true}` enables conflict tracking and scans, so keep it out of query purity checks. No listeners or handles require disposal.

For screenshots, wait for initial `isReady()`/`jquan:ready`, finish the current data/template update, then `await JquanUI.compile(dynamicClasses)` and check complete/pending/cancelled/unresolved/failed. Wait separately for required fonts, images and layout. Query success or initial ready does not finish later dynamic work; flush does not collect undelivered observer records. See [the runnable example](examples/core-class-diagnostics.html), `content/architecture.js`, and `npm run check:core-diagnostics`.

### Core performance benchmark

Run the cross-platform Chromium benchmark when changing the scanner, parser, rule ordering, cache, observer, Constructable Stylesheet, or build extractor:

```bash
npm run benchmark:core
npm run check:core-performance
```

`benchmark:core` records three samples and writes `reports/core-performance.json`. It covers a 32-node cold page, a 2500-node cold page, cache hydration of the same large page, a 160-item MutationObserver batch, adoption into 100 ShadowRoots, and static extraction of 2500 source nodes. The report includes min/median/max durations, browser and hardware identity, cache state, rule counts, source/minified/gzip bytes, configured budgets, and per-budget results.

`check:core-performance` runs the same workload and exits non-zero when a median exceeds its conservative regression budget or a correctness check fails. Set `JQUAN_BROWSER` when Edge, Chrome, or Chromium is not installed in a standard location. Use `--samples N` and `--output FILE` for controlled local experiments. Compare reports from the same machine and browser; do not publish one workstation's timing as a universal speed claim, and do not treat a single faster sample as proof of an optimization.

## Browser data layer

完整 Data API、同步恢复和 AI 使用规范见 [`skills/jquanui/DATA.md`](skills/jquanui/DATA.md)。

The optional `jquanui/data` module (`0.2.0`, pre-1.0) provides an independent in-browser collection layer for local lists, drafts, mock APIs, offline workspaces, and client-side filtering. Its API is still allowed to evolve before 1.0. It does not enter the Core runtime. The browser build exposes `window.JquanUIData` and, when Core is present, `JquanUI.data`.

The browser bundle is generated from the same implementation as the CJS entry, so browser, ESM, and Node usage share the same synchronization behavior. Synchronization can resolve an incoming record through `resolveConflict({ local, incoming, event, collection })`; return a merged record, `true` to accept the incoming record, or `false`/`null` to reject it. `onConflict(context)` receives the resulting `merged` or `rejected` status.

Use `changesSince(cursor)` when a synchronizer must detect history truncation. Its `gap` flag means the local history no longer contains every revision after the requested cursor and a full snapshot recovery should be requested.

For automatic recovery, provide `transport.pullSnapshot()` and call `collection.sync(transport, { recoverOnGap: true })`. Recovery remains opt-in because a full snapshot can be more expensive than incremental replay.

同步可配置 `timeout`、`retries`、`retryDelay`、`retryOn` 和 `AbortController.signal`。失败会抛出 `DataSyncError`，其 `code` 为 `SYNC_FAILED`、`SYNC_TIMEOUT` 或 `SYNC_ABORTED`。

多标签页可使用 `createBroadcastAdapter({ channel: 'contacts' })`，再调用 `collection.connect(adapter)`。跨标签页事件会自动避免回声；页面销毁时调用返回的停止函数，并关闭 adapter。

同步事件带有稳定的 `eventId`，重复事件会自动去重；可通过 `collection.syncStatus()` 读取当前同步状态。IndexedDB 适配器额外提供 `estimate()`、`deleteDatabase()` 和 `stores`，存储异常会抛出 `DataStorageError`。适配器会兼容已存在的更高数据库版本，并在声明了缺失 Store 时自动执行一次版本升级；传入较低的 `version` 不会降级或破坏已有数据库。

`pendingChanges(cursor)` 从独立 Outbox 读取尚未被服务端确认的事件，不受 `historyLimit` 裁剪影响。服务端返回 `{ accepted: 数量 }` 或 `{ acceptedEventIds: string[] }` 后，对应事件会从 Outbox 删除；网络失败时待发送事件会保留。

Collections may opt into lightweight schemas without introducing a second model layer:

```js
const contacts = createCollection('contacts', {
  schemaVersion: 2,
  schema: {
    name: { type: 'string', required: true },
    active: { type: 'boolean', default: true }
  },
  migrations: {
    2(record) { return { ...record, name: record.label || record.name }; }
  }
});
contacts.import(oldRows, { version: 1 });
```

Use `exportSnapshot()` and `importSnapshot()` when a persisted payload must carry its format, collection, and schema version. The existing `export()` / `import()` array API remains available for lightweight data exchange.

`collection.persist(adapter)` stores a versioned `jquanui-data-state` package rather than only the record array. It preserves records, generated-ID sequence, revision, change history, pending changes, event de-duplication IDs, and acknowledged sync events. Restore is silent, so loading a page does not create new insert events or resend already acknowledged changes. Existing adapters containing a legacy record array remain readable and are upgraded on the next save.

For small client-side relations, reuse the existing query pipeline with `join()`:

```js
orders.query().join(customers, {
  local: 'customerId', foreign: 'id', as: 'customer'
}).all();
```

The default result is one related record or `null`; use `many: true` when the relation should return an array. This is an in-memory view join, not a replacement for server-side relational integrity.

```html
<script src="./dist/core/JquanUI@Core.js"></script>
<script src="./dist/data/JquanUI@Data.js"></script>
<script>
  const contacts = JquanUIData.createCollection('contacts', {
    primaryKey: 'id',
    indexes: ['status'],
    unique: ['email'],
    validate: record => typeof record.email === 'string'
  });
  contacts.insert({ id: 1, name: 'Ada', status: 'active' });
  const active = contacts.query({ status: 'active' })
    .orderBy({ name: 'asc' })
    .limit(20)
    .all();
</script>
```

For ESM or Node tooling use `import { createDatabase, createBroadcastAdapter } from 'jquanui/data'`. The ESM entry exposes the same 17 public APIs as the CJS and browser entries, including `DataSyncError`, `DataStorageError`, `DataValidationError`, `createBroadcastAdapter`, and `createDataInspector`. Use `export()` and `import()` for snapshots. Keep authorization, sensitive data, and the source of truth on the server; this module is a fast client-side data and view-model layer, not a replacement for a server database.

Data API reference: `DataSyncError`, `DataStorageError`, `DataValidationError`, `createCollection`, `createDatabase`, `createMemoryAdapter`, `createStorageAdapter`, `createIndexedDBAdapter`, `createHttpSyncAdapter`, `createBroadcastAdapter`, `createDataInspector`, `createTableDataSource`, `createCrudDataSource`, `createFilterBuilderMatcher`, `liveQuery`, `matches`, and `clone`. Collection synchronization uses `collection.changes(since)`, `collection.applyChanges(events)`, and `collection.sync(transport)`. These are pre-1.0 APIs and may evolve while the data layer is being validated.

开发调试可调用 `collection.diagnose()` 查看记录数、索引、历史窗口、修订号和查询/写入计数；它只读取现有状态，不执行额外扫描。`transaction()` 失败时会原子恢复记录、索引、revision、变更历史和事件去重状态。

重复读取同一查询实例时可使用 `collection.query(matcher, { cache: true })`；高频写入订阅可使用 `liveQuery(matcher, listener, { debounce: 16 })` 合并短时间内的通知。两者都是 opt-in。

多字段等值查询可声明 `compositeIndexes: [['tenantId', 'status']]`，或调用 `indexComposite(['tenantId', 'status'])`；范围条件会自动回退普通扫描。

开发工具使用 `createDataInspector(collection)`，通过 `snapshot()` 查看诊断、同步状态和查询解释；浏览器中可用 `render(target)` 输出简洁诊断面板。该工具必须显式调用，不会自动启用。

Schema 错误会抛出 `DataValidationError`，包含 `field`、`expected` 和 `value`；字段还可配置 `validate(value, record)` 做自定义校验。

公开 Data API 由 `dist/data/data-api-surface.json` 维护，发布前会校验 CJS、ESM、浏览器入口和类型声明的一致性，命令为 `npm run check:data:surface`。

规模验证：`npm run benchmark:data` 测试常规 1 万 / 10 万条数据；`npm run benchmark:data:large` 单独测试 100 万条数据，可能需要更多内存和执行时间。

真实浏览器验证使用 `npm run check:data:browser`，通过 Edge CDP 检查 IndexedDB 和同频道多标签页广播；普通 Data 检查、API 表面检查和浏览器检查应在发布前一起运行。

单条和小批量写入采用增量索引维护；大批量导入自动切换一次性重建，以保持批量吞吐。可用 `npm run benchmark:data` 复测当前环境基线。

Use the existing FilterBuilder output with Data through the converter API:

```js
filterRoot.addEventListener('jquan:filter-builder:change', event => {
  const matcher = JquanUIData.createFilterBuilderMatcher(event.detail.payload);
  renderRows(contacts.find(matcher));
});
```

Connect Data to the existing Table remote protocol without creating a second table implementation:

```js
const source = JquanUIData.createTableDataSource(contacts);
await JquanUIComponents.tableApi.mount('#contacts-table', {
  columns: [{ key: 'name', title: 'Name', filterable: true }],
  pagination: { page: 1, pageSize: 20 },
  remote: { enabled: true, load: source.load }
});
```

The existing CRUD component can use the collection without a second CRUD implementation:

```js
const request = JquanUIData.createCrudDataSource(contacts);
await JquanUIComponents.crudApi.mount('#contacts-crud', {
  request,
  table: { columns: [{ key: 'name', title: 'Name' }] },
  forms: { create: { schema: [] }, edit: { schema: [] } }
});
```

When the Storage component is already loaded, persist Data through its existing API:

```js
const adapter = JquanUIData.createStorageAdapter({
  key: 'crm-contacts',
  driver: 'local'
});
const persistence = await contacts.persist(adapter, {
  debounce: 100,
  onError(error) { console.error(error); },
  onCorrupt(context) { console.warn(context); }
});

await persistence.flush();
await persistence.close();
```

Use `createStorageAdapter()` to reuse the existing Storage component; use IndexedDB for larger offline datasets. The returned handle remains callable for compatibility and also provides `flush()`, `close()`, and `status()`. Await `close()` when the collection lifecycle ends so a pending debounced save is not dropped. Persistence is local state, not a security boundary or server backup.

Automatic saves and IndexedDB writes are serialized, so a slower old write cannot overwrite a newer state. Use `persist(adapter, { onError(error) { ... } })` to report background save failures; the initial save still rejects `persist()` directly.

Official Memory, Storage, and IndexedDB adapters maintain a backup slot by default. If the primary state is invalid, `persist()` attempts the last valid backup and reports `{ recovered, error, backupError }` through `onCorrupt`. Set `backup: false` only when another storage layer already provides equivalent recovery.

To connect a data page result to the optional Pagination component, let Data calculate rows and let Pagination render controls:

```js
function loadPage(page = 1, pageSize = 20) {
  const result = contacts.query({ status: 'active' }).paginate(page, pageSize);
  renderContacts(result.data);
  JquanUIComponents.paginationApi.updatePage('#contacts-pager', result);
}

JquanUIComponents.paginationApi.mount('#contacts-pager', {
  total: 0,
  onChange: ({ page, pageSize }) => loadPage(page, pageSize)
});
loadPage();
```

For server synchronization, reuse the existing HTTP component instead of adding another request client:

```js
const transport = JquanUIData.createHttpSyncAdapter({
  pull: '/api/sync/pull',
  push: '/api/sync/push'
});
const result = await contacts.sync(transport, { cursor: lastCursor });
lastCursor = result.cursor;
```

## Install

```bash
npm install jquanui
```

## Core workflow

`dist/core/JquanUI@Core.js` is the readable, canonical runtime source. Use it when debugging or inspecting the engine. `js/JquanUI@core.min.js` is the minified browser artifact for local static pages and production prototypes; generate it from the current Core source instead of editing it manually.

```bash
npm run build:core
npm run build:bundles
npm run check:core
npm run check:bundles
```

`build:core` compresses the latest Core with Terser. `build:bundles` uses the locked Terser formatter (no compression transforms or mangling) to compact component code in Components and Full; install development dependencies with `npm ci`. It deterministically rebuilds the bundles from `dist/components/components.manifest.json`. `check:core` validates minified syntax and runs the Core regression suite; `check:bundles` rejects missing, duplicated, or stale component bundles. The package browser entry remains `dist/core/JquanUI@Core.js`; the minified file is provided as a convenient standalone browser artifact.

### Stable cascade and Shadow DOM

Runtime and build-time rules use the same canonical cascade topology. Shorthand utilities are emitted before their longhand refinements, so `p-4 pt-2` and `pt-2 p-4` produce the same result. `cascadeLayers: true` still controls the outer reset/theme/components/utilities layers; it is not required for stable utility ordering.

Modern browsers use Constructable Stylesheets by default when supported. Set `constructableStylesheets: false` to force the `<style>` fallback. A constructable runtime can be adopted into a ShadowRoot:

```js
const shadowRoot = host.attachShadow({ mode: 'open' });
JquanUI.adopt(shadowRoot);
// Existing classes are compiled now; later class/state/child changes are observed.
shadowRoot.innerHTML = '<section class="p-4 text-primary">Web Component</section>';
JquanUI.getAdoptionStatus(shadowRoot);
JquanUI.detach(shadowRoot);
```

`adopt()` is idempotent and defaults to `{ scan: true, observe: true }`. Use `{ scan: false }` only when a build-time stylesheet already contains every class; use `{ observe: false }` for immutable roots. `detach()` disconnects the root observer, cancels queued work, tears down plugin behaviors, and removes only JquanUI's theme/runtime sheets. It never removes third-party adopted sheets. `getAdoptionStatus(root)` returns `{ adopted, observed, styleMode, sheetCount }` without retaining or exposing a root list.

CSS custom properties inherit from the light-DOM host into its ShadowRoot. A `.dark` or `.light` scope inside the ShadowRoot also works because the shared theme sheet is adopted with the utility sheet. The normal `<style>` fallback remains available for document styling in older browsers and test environments, but ShadowRoot adoption requires Constructable Stylesheets and returns `false` when they are unavailable. `JquanUI.getStyleSheet()` exposes the active utility sheet for diagnostics and advanced integration.

Arbitrary values keep nested `calc()`, `env()`, `image-set()`, and safe data URLs, while rejecting unbalanced delimiters, legacy `expression()` / binding / behavior declarations, escaped at-rules, and JavaScript URLs. Prefer theme tokens and semantic utilities before using bracket syntax.

Core typography mappings include `text-shadow-none`, `text-shadow-sm`, `text-shadow-md`, and `text-shadow-lg`. Use `text-shadow-[...]` only for a genuinely custom text shadow. For a composite native CSS `font` declaration, use `font-[700_1rem/1.5_sans-serif]`; for ordinary typography, prefer composing semantic classes such as `font-bold text-md leading-normal font-sans`.

## External HTML templates

The optional Template component can share `header.html`, `footer.html`, and other fragments across static multi-page sites. Register the file loader before installing the component:

```html
<script src="./js/JquanUI@core.min.js"></script>
<script src="./dist/components/template.js"></script>
<script>
  JquanUIComponents.templateApi.useLoader({
    base: './templates/',
    extensions: ['.html'],
    cache: {
      maxEntries: 64,
      ttl: 300000,
      version: 'site-v1'
    }
  });
  JquanUI.use(JquanUIComponents.template);
</script>
```

```html
{% include 'header.html' %}
<main>{{ title }}</main>
{% include 'footer.html' %}
```

External files use the asynchronous renderer and require an HTTP server. `file://` pages cannot reliably fetch sibling template files. Registered templates and DOM `<template>` sources keep their existing priority and synchronous behavior. External cache entries use bounded LRU eviction; `ttl` is expressed in milliseconds and `0` disables expiry. Template compilation defaults to 500 cached AST entries and accepts `cacheLimit` per render or compile call.

Use `await templateApi.dependencyGraph('page.html')` to inspect recursive static include/layout dependencies before rendering. Dynamic dependency expressions are reported separately and are never treated as filenames. Nested errors expose `templateName`, `includeChain`, `position`, and `snippet`; `templateApi.inspect(name)` reports the same loader metadata as `inspectTemplate(name)`.

With the JquanUI Vite plugin, `.html/.htm` fragment changes automatically invalidate matching template caches and rerender mounted Template instances during development. Production builds do not inject the HMR client. Set `templateHmr: false` in the Vite plugin options to disable this behavior; use `templateApi.invalidate(name)` or `await templateApi.refresh(name)` for custom development servers.

For production static sites, render page entries at build time so the browser does not fetch templates:

```bash
npx jquan-extract --render-html ./pages --html-output ./dist --templates ./templates --data ./site.json
```

Every `.html/.htm` entry under `pages` is rendered with the same include/layout syntax, and its relative path is preserved under `dist`. `site.json` must contain an object and is optional. Template paths stay inside the configured template root.

When pages must remain client-rendered, prebundle fragments instead of fetching them one by one:

```bash
npx jquan-extract --bundle-templates ./templates --template-bundle-output ./dist/jquan.templates.js --templates ./templates
```

Load the generated script before or after `template.js`; both orders are supported:

```html
<script src="./dist/jquan.templates.js"></script>
<script src="./dist/components/template.js"></script>
```

The bundle fills `window.JQUAN_TEMPLATES` and registers immediately when `templateApi` already exists. Runtime includes resolve from memory without `fetch()`.

For untrusted template/data input, use the unified safe preset:

```js
const html = templateApi.render(source, data, {
  safe: true,
  safeFilters: ['upper', 'lower', 'default']
});
```

`safe: true` enables safe expressions, HTML sanitization, resource protocol validation, and a filter allowlist. The CLI equivalent is `--safe`. Advanced integrations may set `safeResourceProtocols`, `safeDataImages: false`, or provide `safeSanitizer(html, context)` for post-sanitization normalization; the built-in sanitizer always runs first.

SSR consumers can use the explicit string API:

```js
const html = templateApi.renderToString(source, data, { safe: true });
const asyncHtml = await templateApi.renderToStringAsync(source, data, { safe: true });
```

大模板频繁更新时可显式启用 DOM Patch，尽量复用已有节点；默认仍使用更快的 `innerHTML`：

```js
templateApi.mount('#view', {
  template: source,
  data,
  patch: true
});
```

## Runtime

| Deployment | Core entry | On-demand components |
| --- | --- | --- |
| Complete repository | `./js/JquanUI@core.min.js` or `./dist/core/JquanUI@Core.js` | `./dist/components/` is inferred |
| Copy only dist | `./dist/core/JquanUI@Core.js` | Keep `dist/core` and `dist/components`, including the `dist` directory name |
| npm + browser bundler | `import 'jquanui/core'` | Copy required component files and dependencies to public assets; configure `componentLoader.baseURL` |

The repository's `js/JquanUI@core.min.js` is outside dist and is not in the npm package. If dist is renamed/flattened or Core is bundled/renamed, configure the URL explicitly. Bundler builds do not copy dynamically requested component files. For example, copy required files from `node_modules/jquanui/dist/components/` to `public/assets/jquan-components/`:

```js
window.JQUAN_CONFIG = {
  componentLoader: { baseURL: '/assets/jquan-components/' }
};
await import('jquanui/core');
const dom = await window.JquanUI.import('dom');
```

Configuration must execute before Core. Static imports run before the module body; use a preceding HTML configuration script or the dynamic import sequence above. Serve via HTTP(S). Load one Core entry per page. In Node/SSR, browser subpaths intentionally do nothing and do not create `window.JquanUI`; use the root or `jquanui/extract` for extraction.

Runtime metadata has no arguments, component dependencies or cleanup:

| Property | Type / current value | Contract |
| --- | --- | --- |
| `JquanUI.engineVersion` | string / `4.72.0` | Pure semver, equal to debug/metrics/ready version |
| `JquanUI.versionLabel` | string / `Enterprise Plugin Lifecycle` | Descriptive label |
| `JquanUI.version` | string / `4.72.0 (Enterprise Plugin Lifecycle)` | Historical display value, retained for compatibility |

```js
console.log(JquanUI.engineVersion, JquanUI.versionLabel);
```

The public `jquanui/core-archive-v4.5` entry remains available for historical projects; current development uses `jquanui/core`.

Use the browser runtime directly:

```html
<script src="./dist/core/JquanUI@Core.js"></script>
```

CDN-style full bundle entry:

```html
<script src="https://cdn.jsdelivr.net/npm/jquanui/dist/full/JquanUI@full.js"></script>
```

Package subpath:

```js
import 'jquanui/core';
```

Browser bundle subpaths:

```js
import 'jquanui/full';
import 'jquanui/components';
import 'jquanui/components/button';
```

These browser subpaths register globals such as `window.JquanUI` and `window.JquanUIComponents`.

`jquanui/components` contains the manifest's bundled components, excluding entries marked `onDemandOnly` (including Review Mode). `jquanui/full` is the curated browser profile: current Core plus 33 general-purpose components and the shared UI presets. Use individual `jquanui/components/*` subpaths when bundle size or explicit dependencies matter.

## Container queries

Use `container-type-inline-size` on the query container, then use the `@size:` variant on descendants. Container thresholds are independent from viewport breakpoints, so a reusable component responds to its own available width:

```html
<article class="container-type-inline-size">
  <div class="grid grid-cols-1 gap-4 @sm:grid-cols-2 @lg:grid-cols-3">
    ...
  </div>
</article>
```

Named containers accept both readable orders: `@sidebar/lg:` and `@lg/sidebar:` mean the same thing. The latter follows the usual size-first variant flow and is recommended for new code. Nested container variants are composed in the order written:

```html
<aside class="container-type-inline-size container-name-sidebar">
  <div class="@sm/sidebar:p-4 @md/sidebar:grid @md/sidebar:grid-cols-2">
    ...
  </div>
</aside>
```

For a one-off threshold, use an arbitrary condition such as `@[min-width:400px]:grid-cols-2`; for a named one-off condition, use `@sidebar/[min-width:400px]:grid-cols-2`. Configure repeated project thresholds once instead of scattering values:

```js
window.JQUAN_CONFIG = {
  theme: {
    extend: {
      containers: { sidebar: '30rem', wide: '48rem' }
    }
  }
};
```

Then `@wide:grid-cols-2` uses the configured threshold. Keep threshold aliases and container names distinct where possible; if both sides are custom names, the recommended size-first form `@wide/sidebar:` wins deterministically. Invalid names and conditions are ignored, and nested `@...:` variants are emitted through the same runtime and build-time ordering pipeline.

## Pseudo-elements and state variants

`before:` and `after:` create an empty pseudo-element automatically, so common decorations do not need a separate CSS file:

```html
<div class="relative before:absolute before:inset-0 before:rounded-lg before:bg-brand-500/10">
  Atomic decoration
</div>

<button class="after:content-['New'] after:ml-2 after:text-xs after:text-brand-500">
  Inbox
</button>
```

Use `content-none` to suppress generated content. Attribute and scrollbar variants cover common component states and browser chrome:

```html
<button aria-expanded="true" class="aria-expanded:bg-brand-500 aria-expanded:text-white">Menu</button>
<div data-state="open" class="hidden data-[state=open]:block">Panel</div>
<div class="overflow-auto scrollbar:w-2 scrollbar-thumb:bg-brand-500/40 scrollbar-thumb:rounded-full">...</div>
```

Range, language, input capability, arbitrary selector, and feature-query variants keep responsive and compound states atomic:

```html
<nav class="max-md:hidden pointer-fine:hover:bg-brand-500"></nav>
<span class="lang-en:tracking-wider not-lang-en:font-serif"></span>
<header class="[.scrolled_&]:bg-black/90"></header>
<div class="supports-[backdrop-filter:blur(1px)]:backdrop-blur-md"></div>
<div class="[@media(max-width:760px)]:hidden"></div>
```

`lang-en:` uses native `:lang(en)`, so it matches `<html lang="en">`, regional tags such as `en-US`, and inherited language from a localized subtree. Keep the default typography first and add only the language-specific correction, for example `class="text-xl lang-en:text-lg"`.

Native dialog, popover, validation, and entry-transition states are available as variants:

```html
<dialog class="opacity-100 starting:opacity-0 modal:flex"></dialog>
<div popover class="opacity-0 popover-open:opacity-100 starting:opacity-0"></div>
<input class="border-gray-300 user-invalid:border-red-500 user-valid:border-green-500">
<main inert class="inert:opacity-50 inert:pointer-events-none"></main>
```

Safe-area utilities support both the raw device inset and an additional semantic offset:

```html
<header class="pt-safe px-safe-4"></header>
<nav class="fixed bottom-safe pb-safe-2"></nav>
<main class="min-h-dvh"></main>
```

Large projects can opt into deterministic cascade layers without changing the compatibility default:

```js
window.JQUAN_CONFIG = {
  cascadeLayers: true
};
```

The engine then emits `jquan-reset`, `jquan-theme`, `jquan-components`, and `jquan-utilities` in a fixed order. Runtime rules, cached rules, static extraction, SSR output, themes, and plugins use the same layer model. Enable this at the start of a project or validate existing overrides before adopting it in an established codebase.

Theme colors accept modern CSS color spaces and functions:

```js
window.JQUAN_CONFIG = {
  theme: {
    extend: {
      colors: {
        brand: 'oklch(62% 0.2 250)',
        wide: 'color(display-p3 0.9 0.2 0.4)',
        adaptive: 'light-dark(#ffffff, #030303)'
      }
    }
  }
};
```

They work with the normal color surface and opacity suffixes:

```html
<div class="bg-brand/20 text-wide border-adaptive/30 ring-brand shadow-brand shadow-lg"></div>
```

Anchor Positioning and View Transitions also have semantic utility entry points:

```html
<button class="anchor-name-[--tooltip]">Anchor</button>
<div class="position-fixed position-anchor-[--tooltip] position-area-top">Tooltip</div>
<article class="view-transition-name-card view-transition-group-nearest">Card</article>
<html class="view-transition-types-[--route]">
```

Use `anchor-scope-*`, `position-try-*`, `position-try-order-*`, and `position-visibility-*` for fallback and visibility policy. Use `position-area-[...]` only for a project-specific area; common top, bottom, left, right, and span combinations have semantic mappings. These properties are progressive enhancement: preserve a normal-flow or fixed-position fallback for browsers without Anchor Positioning or View Transitions.

RGB channel themes continue to emit compatible `rgb()` / `rgba()` values. Modern colors use `color-mix()` only when an opacity suffix or shadow alpha is required.

## Fluid design tokens

Repeated responsive spacing and typography can be named once instead of scattering arbitrary `clamp(...)` values through templates:

```js
window.JQUAN_CONFIG = {
  theme: {
    extend: {
      fluid: {
        spacing: {
          section: ['3rem', '6vw', '6rem'],
          frame: { min: '18rem', preferred: '80vw', max: '72rem' }
        },
        fontSize: {
          display: {
            min: '2.25rem',
            preferred: '6vw',
            max: '4.5rem',
            lineHeight: '1.05'
          }
        }
      }
    }
  }
};
```

```html
<section class="py-fluid-section max-w-fluid-frame">
  <h1 class="text-fluid-display">Fluid heading</h1>
</section>
```

Fluid spacing names work anywhere the shared spacing scale is used, including `p-*`, `m-*`, `gap-*`, `w-*`, `h-*`, `max-w-*`, and safe-area offsets such as `pb-safe-fluid-section`. A complete `clamp(...)` string is also accepted. Invalid or incomplete token definitions are ignored instead of emitting broken CSS.

Project motion can live in the same theme config and is emitted by both the runtime and build-time extractor:

```js
window.JQUAN_CONFIG = {
  theme: {
    extend: {
      keyframes: {
        'brand-reveal': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: { 'brand-reveal': 'brand-reveal 600ms ease both' }
    }
  }
};
```

Use it with `class="animate-brand-reveal motion-reduce:animate-none"`.

Modern form controls can use native sizing, theme integration, and caret colors without custom CSS:

```html
<textarea class="field-sizing-content color-scheme-light caret-current"></textarea>
<input class="field-sizing-fixed color-scheme-dark caret-current" />
```

Modern typography and fragmented text can use `text-wrap-stable`, `text-box-trim-both`, `text-box-edge-cap`, `interpolate-size-allow-keywords`, `box-decoration-clone`, and `box-decoration-slice` without a CSS file.

## CLI

Create a starter config:

```bash
npx jquan-extract --init
```

Extract static CSS:

```bash
npx jquan-extract --input ./src --output ./dist/jquan.css --report ./dist/jquan.report.json --fail-on-warn
npx jquan-extract --doctor --json
```

For long-lived sites, generated CSS can be split into a reusable baseline and page-specific utilities. The default `jquan.css` output is unchanged:

```bash
npx jquan-extract --input ./src \
  --baseline-output ./dist/jquan.base.css \
  --utilities-output ./dist/jquan.utilities.css --minify
```

The Node API exposes the same coordinated parts without a second parser:

```js
const build = extractFromFiles(['index.html', 'src'], { minify: true });
console.log(build.baselineCss, build.utilityCss, build.css);
```

Load the baseline before the utilities. Reuse the baseline only while the Core version, theme, and plugin configuration remain the same.

Render static HTML pages with shared templates:

```bash
npx jquan-extract --render-html ./pages --html-output ./dist --templates ./templates --data ./site.json
npx jquan-extract --bundle-templates ./templates --template-bundle-output ./dist/jquan.templates.js --templates ./templates
```

## CSS Migration Audit

Audit an existing stylesheet before moving declarations into JquanUI classes:

```bash
npx jquan-migrate --input ./css --output ./reports/jquan-migration.json --config ./jquan.config.cjs
npx jquan-migrate --input ./css --format markdown --output ./reports/jquan-migration.md
npx jquan-migrate --input ./css --source ./src --format markdown --output ./reports/jquan-migration.md
npx jquan-migrate --source ./src --max-order 0 --output ./reports/class-order.json
```

The report keeps three categories separate:

- `semantic`: use an existing semantic class, including visually equivalent tokens such as `font-size: 15px` -> `text-md` and `padding: 15px` -> `p-4`.
- `arbitrary`: JquanUI can express the declaration, but a project token should be considered before using the suggested bracket class.
- `manual`: complex selectors, gradients, masks, transforms, shadows, keyframes, and other declarations that should not be rewritten mechanically.

Use `--semantic-only` to suppress bracket suggestions. The optional `--source` input audits HTML/JS/JSX/TS/Vue/Svelte/Astro class strings and reports a stable utility order without changing source files. Reports include `before`/`after` pairs, manual-review reasons, `configWarnings`, and `unsupportedTailwindTokens`.

Tailwind configuration is accepted as migration context, including `theme.extend.colors`, `spacing`, `screens`, `borderRadius`, `fontSize`, `fontWeight`, and `lineHeight`. Tailwind plugins, `corePlugins`, and `variants` are reported as review items; they are not executed or silently treated as JquanUI mappings.

CI can enforce a minimum semantic ratio with `--min-semantic 60`, a total expressible ratio with `--min-expressible 80`, a maximum manual ratio with `--max-manual 20`, and a maximum number of unsorted class strings with `--max-order 0`. Any failed threshold exits with status `2`. The tool only writes reports and never modifies source CSS, templates, or application files.

暗色迁移候选可以单独审计：

```bash
npx jquan-migrate --source ./src --dark-audit --format markdown --output ./reports/dark-audit.md
npx jquan-migrate --source ./src --dark-audit --max-dark-missing 0 --output ./reports/dark-audit.json
```

报告只列硬编码颜色、阴影、语义角色和缺少 `dark:` 的类，并保留文件、行号和 class 字符串。历史 `bg-white/90` 等类不会被默认重解释；确认角色映射和视觉回归后再人工迁移。

`--dark-audit` 必须配 `--source`；CI 阈值必须为非负整数。API 为 `migrate.auditDarkSource(source, { source, config })` 与 `migrate.auditDarkFiles(inputs, { root, config })`，返回 summary、候选及文件上下文。配对区分状态、断点、属性和 important；不展开 shortcut 或执行动态拼接，报告不代表最终对比度。完整参数、计数与限制见本页 [CLI](#cli) 章节；仓库内的 [CLI README](dist/cli/README.md#css-migration-audit) 提供同内容的模块化阅读版本。

Node and ESM consumers can use the same API:

```js
const { migrate } = require('jquanui');
const report = migrate.auditCssFiles(['./css'], { config });
const order = migrate.auditClassFiles(['./src'], { root: process.cwd() });
console.log(report.migrationSuggestions, order.files);
```

## Node API

```js
const { extractFromFiles, renderCriticalCss, injectCriticalCss, createCriticalStyleTag, diagnoseProject, buildTemplatePages } = require('jquanui');

const build = extractFromFiles(['index.html', 'src'], { minify: true });
console.log(build.css);
console.log(build.report);

const doctor = diagnoseProject({ inputs: ['index.html', 'src'] });
console.log(doctor.ok, doctor.warnings);

const critical = renderCriticalCss('<main class="container dark:bg-slate-900"></main>', { minify: true });
const styleTag = createCriticalStyleTag(critical.css, {
  id: 'jquan-critical',
  nonce: res.locals.cspNonce
});

const page = injectCriticalCss('<html><head></head><body><main class="container"></main></body></html>', {
  minify: true,
  id: 'jquan-critical',
  nonce: res.locals.cspNonce,
  replaceExisting: true
});

await buildTemplatePages('./pages', {
  output: './dist',
  templates: './templates',
  data: { siteName: 'JquanUI' }
});
```

ESM is supported too:

```js
import { extractFromFiles } from 'jquanui';
import jquanUI from 'jquanui/vite';
```

## SSR Framework Adapters

`jquanui/ssr` is a dependency-free thin bridge for server rendering. It never imports React, Vue, Svelte, Next, or Nuxt; provide the renderer from the framework already used by the application. Every adapter reuses the same `injectCriticalCss()` extraction and CSP options.

```js
// React (sync)
const { createReactSSRAdapter } = require('jquanui/ssr');
const { renderToString } = require('react-dom/server');

const ssr = createReactSSRAdapter({ renderToString }, {
  critical: { id: 'jquan-critical', nonce: res.locals.cspNonce, minify: true }
});
const page = ssr.renderPage(App, { url: req.url }, { document: true });
res.send(page.html);
```

```js
// Vue (async), Svelte ({ html, head, css }), and pre-rendered Next/Nuxt HTML
const { createVueSSRAdapter, createSvelteSSRAdapter, createNextSSRAdapter } = require('jquanui/ssr');

const vue = createVueSSRAdapter({ renderToString });
const vuePage = await vue.renderPage(app, context, { document: true });

const svelte = createSvelteSSRAdapter({ render });
const sveltePage = svelte.renderPage(Page, { title: 'Docs' }, { document: true });

const next = createNextSSRAdapter({ critical: { nonce: cspNonce } });
const nextPage = next.inject(renderedHtml); // HTML already contains <head>
```

`renderPage()` accepts a string or `{ html, head, css }`; Svelte `head` and `css.code` are preserved when `{ document: true }` creates a document. `inject()` transforms an existing complete response, which is the normal Next/Nuxt integration point. `createSSRAdapter()` is available for any other renderer. The result always contains `html`, `css`, `styleTag`, `classes`, `framework`, `frameworkHead`, and `frameworkCss`.

When the application owns a document shell, pass `document(rendered, options)` in the adapter options. The same factory is used by both `renderPage(..., { document: true })` and `adapter.createDocument(...)`, so the two server entry points cannot drift:

```js
const ssr = createSSRAdapter({
  document({ html, head }) {
    return `<!doctype html><html lang="zh-CN"><head>${head}</head><body>${html}</body></html>`;
  }
});
const page = ssr.renderPage('<main class="p-4">Hello</main>', null, { document: true });
```

## Vite

```js
const jquanUI = require('jquanui/vite');

module.exports = {
  plugins: [
    jquanUI({
      configFile: './jquan.config.cjs',
      report: 'assets/jquan.report.json',
      failOnWarn: true,
      templateInput: './templates',
      templateRoot: './templates',
      templateBundle: 'assets/jquan.templates.js'
    })
  ]
};
```

## PostCSS

```js
const jquanUI = require('jquanui/postcss');

module.exports = {
  plugins: [
    jquanUI({ configFile: './jquan.config.cjs' })
  ]
};
```

PostCSS supports explicit split output:

```js
jquanUI({
  split: true,
  baselineOutput: 'dist/jquan.base.css',
  utilitiesOutput: 'dist/jquan.utilities.css'
});
```

```css
@jquanui baseline;
@jquanui utilities;
```

```css
@jquanui utilities;
```

PostCSS projects that keep client-rendered templates can opt into the same prebundling path:

```js
jquanUI({
  input: ['index.html', 'src'],
  templateInput: 'templates',
  templateRoot: 'templates',
  templateBundle: 'dist/jquan.templates.js'
});
```

## Config

```js
module.exports = {
  content: ['index.html', 'src/**/*.{html,js,jsx,ts,tsx,vue,svelte,astro}', '!src/legacy/**'],
  safelist: [
    { class: 'bg-brand-500', variants: ['hover', 'dark'] }
  ],
  blocklist: [/^debug-/],
  shortcuts: {
    'btn-primary': 'inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600'
  },
  theme: {
    extend: {
      colors: {
        brand: { 500: '#3366ff' }
      },
      fluid: {
        spacing: { section: ['3rem', '6vw', '6rem'] },
        fontSize: {
          display: { min: '2.25rem', preferred: '6vw', max: '4.5rem', lineHeight: '1.05' }
        }
      }
    }
  }
};
```

## Design Tokens

```bash
npx jquan-tokens import --input ./design.tokens.json --output ./jquan.config.json
npx jquan-tokens export --input ./jquan.config.json --output ./design.tokens.json
```

## Browser component importer

只引入 Core 后，可以按名称加载 `dist/components` 下的本地组件；导入器会去重并先装依赖：

```html
<script src="./dist/core/JquanUI@Core.js"></script>
<script type="module">
  const dom = await JquanUI.import('dom');
  const [table, select] = await JquanUI.import(['table', 'select']);
  await JquanUI.import('drawer', { install: false }); // 只加载
</script>
```

`JquanUI.import(name | names, { baseURL, timeout, install, nonce })` 接受组件名或数组，也接受带 `.js` 后缀的名称。`baseURL` 默认根据 Core/Full/压缩入口推导；成功脚本与并发请求只执行一次，批量结果保持输入顺序。失败会抛出带 `code`、`component`、`url` 的 `JquanComponentImportError`，修正路径或网络后可重试。组件 API 的 mount、句柄和 destroy 仍按各自文档使用。

## AI Skill

The package includes an AI development skill at `skills/jquanui/SKILL.md`. Give that file to Codex, Claude Code, or another coding agent when generating JquanUI interfaces. It enforces semantic HTML, semantic atomic classes, minimal arbitrary values, and no custom CSS unless the engine cannot express the requirement.

Codex users can install or link the `skills/jquanui` directory as a personal/project skill and invoke it with `$jquanui`.

## Release Checks

```bash
npm run verify
```

`verify` refreshes `dist/manifest.json`, checks version/package/size/manifest metadata, and performs a real pack/install smoke test.

Template runtime behavior has an independent regression gate:

```bash
npm run check:template-runtime
```

It covers syntax and loops, compiled-cache limits, asynchronous external includes and request deduplication, safe rendering, include-cycle errors, and DOM mount/update/destroy behavior. The same gate runs as part of `npm run check`.

The developer component catalog has a structural and browser gate:

```bash
npm run check:component-docs
npm run check:component-docs:browser
```

The browser gate opens `components.html` in an isolated Edge session and verifies all 76 modules, the Select and Data previews, iframeBridge handshake/request flow, console errors, and 390px horizontal overflow.

This README contains the detailed CLI, Vite, PostCSS, SSR, report, and token bridge documentation. The repository also keeps a modular copy at [dist/cli/README.md](dist/cli/README.md); that duplicate developer file is excluded from the npm tarball.

