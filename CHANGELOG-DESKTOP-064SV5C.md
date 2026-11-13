# Changelog

## Unreleased

- Added opt-in `componentPresets.ui: 'semantic'` with seven light/dark color roles; preserved legacy preset defaults and historical static color utilities. Table 2.4 now consumes role colors for its surface, text, borders, controls, row states and sorting focus without rebuilding DOM on theme changes.
- Corrected semantic theme configuration types, added UiPreset globals/import inference, synchronized theme/component documentation and project skill, and added six-scenario Core/minified/Full browser coverage.

- Upgraded i18n to 1.1.0: `registerMessages()` now preserves `locale → namespace → key` resources for known namespaces and explicit `{ nested: true }` payloads, qualified namespace paths resolve consistently, and flat registration remains backward compatible. Synchronized lifecycle/schema documentation, Carousel/Tabs API summaries, component docs rendering, project skill guidance, and runtime regression coverage.
- Added i18n public types for registration, namespace lookup, formatting, lifecycle, browser globals, and `JquanUI.import('i18n')`; added the component subpath export and TypeScript consumer coverage.
- Updated component documentation browser fixtures to the current 78-module index and 42 UI showcase cards; assertions now inspect the rendered Data preview state instead of removed legacy feedback markup.

- Migrated Popover 1.5 to OverlayManager 1.2 with shared top-layer Escape/Tab/click, trigger-inside regions, accessible state, canonical handles and stale-instance/RAF cleanup; retained positioning and one-active-Popover behavior.
- Added Popover consumer types and importer overload, synchronized docs/skill, and extended OverlayManager with outsideElements, autoFocus and live returnFocus updates. Hover no longer steals/traps focus by default; outside dismissal uses shared click instead of independent pointerdown.

- Migrated Modal 2.2 and Drawer 1.2 to OverlayManager 1.1, retaining async beforeClose and animation lifecycle with shared focus/scroll/stack behavior, live policy updates, observable state and exact types.
- Fixed FormValidator 1.1 enhancement reuse, stale cleanup and Modal-managed submit integration; guarded Drawer replacement, cumulative updates and reentrant cleanup.

- Added OverlayManager 1.0 with shared top-layer dismissal, focus trapping/restoration, stack order, nested scroll locks, detached cleanup, lifecycle types and three-entry browser checks.
- Migrated Dialog to 1.1; local imports automatically load OverlayManager, manual installs require the dependency first. Retained declarative attributes and aligned the previously mismatched Dialog documentation version with runtime.

- Upgraded Table to 2.3.0: latest-request commits, AbortSignal/request IDs, observable remote errors and retry state, destruction/remount guards, pagination disposal, native keyboard sort controls and filter focus/draft preservation.
- Added generic Table declarations, typed import/global APIs, remote usage documentation and skill rules, runtime regressions, three-entry Chromium tests and a TypeScript consumer fixture.

- Added built-in `JquanUI.import(name | names, options)` for local component loading, dependency ordering, concurrent download reuse, automatic installation, API return values, timeout/retry errors and CSP nonce inheritance.
- Added importer types, developer documentation, project skill rules, VM regression and real-browser integration checks.
- Restored the verified 4.72.0 Core source from the existing desktop copy before rebuilding runtime bundles; aligned Select's declarative example with its documented usage.

## 4.72.0 - 2026-09-07

- Completed the modern Anchor Positioning utility surface with `anchor-scope`, `position-area`, `position-try`, `position-try-order`, and `position-visibility` mappings plus semantic area and fallback values.
- Added View Transition utilities for `view-transition-group` and `view-transition-types`, while preserving arbitrary custom names and route types.
- Added Core regression coverage, modern CSS developer examples, README guidance, AI Skill rules, and synchronized runtime/build-time release metadata.
- Continued the high-frequency CSS documentation pass with interactive, copyable playgrounds for alignment, display, background color, text color, and spacing utilities, including live class/status feedback and browser regression coverage.
- Unified playground code presentation with the shared `code-block.mjs` highlighter; removed custom dark code-like status panels from the refreshed CSS documentation pages.
- Fixed dynamic Flexbox, Grid, and Background Image examples so HTML source is escaped before highlighting instead of being parsed as live markup.
- Added a shared live code block to the Size playground and restored Theme Dark Mode examples to the standard highlighter configuration.
- Removed the legacy Gradient documentation style shim and replaced the Opacity checkerboard inline CSS with atomic gradient classes; both pages now follow the no-page-CSS rule.
- Unified the Border Width, Border Radius, and Outline playground headers, and replaced Border Width writing-mode inline CSS with semantic atomic utilities.
- Continued the Effects documentation pass: Shadow now uses atomic radial-gradient utilities, Filter sections have consistent interactive headers and contrast, and a duplicated Transform border class was removed.

## 4.71.0 - 2026-09-06

- Added dependency-free SSR framework adapters for generic renderers and React, Vue, Svelte, Next, and Nuxt integration points.
- Preserved framework HTML, head, and CSS output while reusing the existing critical CSS extraction and CSP injection pipeline.
- Added HTML document generation with language escaping, custom document factories, and synchronous or asynchronous `renderPage()` support.
- Synchronized SSR CJS/ESM/types exports, package subpath metadata, developer documentation, AI Skill guidance, and regression gates.
- Stabilized browser documentation verification by waiting for dynamic content and its generated atomic styles before sampling layout assertions.

## 4.70.0 - 2026-09-05

- Expanded ShadowRoot adoption into a complete lifecycle: existing classes compile synchronously and later class, state-attribute, and child mutations are observed by default.
- Added idempotent `adopt(root, { scan, observe })`, lifecycle-aware `detach(root)`, and read-only `getAdoptionStatus(root)` diagnostics.
- Preserved third-party adopted stylesheets, isolated observers across multiple roots, and connected plugin behavior setup/teardown to ShadowRoot mounting.
- Verified host theme-variable inheritance and local `.dark` scopes in a real Chromium benchmark covering 100 ShadowRoots.
- Synchronized Core, Full, minified Core, public/browser types, README, AI Skill, roadmap, documentation gates, and release verification artifacts.

## 4.69.0 - 2026-09-04

- Completed the Container Queries 2.0 routing pass with deterministic `@size/name:` and backward-compatible `@name/size:` variants.
- Added named arbitrary conditions, nested container query composition, configured thresholds through `theme.containers` or `theme.extend.containers`, and invalid-name rejection.
- Synchronized Core, Full, public types, developer documentation, AI Skill guidance, and regression coverage.

## 4.68.0 - 2026-09-04

- Enhanced `jquan-migrate` with Tailwind-compatible theme token auditing for screens, colors, spacing, border radius, font size, font weight, and line height.
- Added explicit `before`/`after` migration comparisons, manual-review reasons, configuration warnings, and untranslated-token reporting.
- Added non-destructive class-order auditing for HTML, JavaScript, TypeScript, Vue, Svelte, Astro, Markdown, and MDX sources.
- Added source-only auditing plus CI thresholds for semantic coverage, expressible coverage, manual-review ratio, and unsorted class count.
- Added regression coverage, ESM/CJS/type-surface exports, documentation, and the missing `check:migrate` npm script.

## 4.67.0 - 2026-09-01

- Added a cross-platform Chromium Core benchmark covering small and large cold starts, warm cache hydration, mutation batches, ShadowRoot adoption, and static build extraction.
- Added machine-readable min/median/max timing, environment, rule-count, cache, and source/minified/gzip size reporting.
- Added conservative median regression budgets through `npm run check:core-performance` without adding benchmark code to the browser Core.
- Documented same-machine comparison rules and prohibited universal performance claims based on a single workstation or sample.

## 4.66.0 - 2026-08-31

- Added budgeted `JquanUI.prefetch(classes, options)` for explicit runtime class warming without a DOM scan.
- Added class-count, UTF-8 CSS-byte, and synchronous-time budgets with observable accepted/skipped results and runtime metrics.
- Reused the existing utility resolver, canonical rule ordering, CSSOM insertion, and cache pipeline instead of introducing a second compiler.
- Added public types, Core regression coverage, README guidance, developer documentation, AI Skill rules, and documentation gates.

## 4.65.0 - 2026-08-31

- Added coordinated `baselineCss` and `utilityCss` outputs to the static extraction API while preserving the existing full `css` string.
- Added CLI `--baseline-output` and `--utilities-output` destinations for independently cacheable CSS files.
- Added opt-in Vite `split: true` emission/injection and PostCSS `@jquanui baseline` / `@jquanui utilities` composition.
- Added baseline and utility byte counts to extraction reports and documented the required baseline-then-utilities load order.

## 4.64.0 - 2026-08-31

- Added the low-cost read-only `JquanUI.getMetrics()` runtime snapshot for resolve totals, rule counts, queue state, cache hydration hit rate, timing averages, budget warnings, and the slowest resolved class.
- Reused the same performance snapshot fields from `debug()` and `diagnose()` without triggering an extra DOM scan or enabling conflict tracking.
- Synchronized the Core minified bundle, public types, README, AI Skill, roadmap, and regression coverage.

## 4.63.1 - 2026-08-30

- Fixed canonical cascade ordering for physical shorthand utilities such as `px`/`pl`, `py`/`pt`, `mx`/`ml`, `inset-x`/`left`, and border axis/side utilities.
- Added regression coverage for shorthand topology, responsive variants, dark/container combinations, important utilities, and runtime/build-time parity.
- Added the shared documentation shell with Template-first navigation rendering, static fallback, synchronized release labels, and documentation smoke coverage across the three entry pages.
- Moved shared documentation navigation and footer fragments into `docs/templates/`, rendered them through Template `include`, and added a no-fetch/static fallback for local-file and degraded environments.
- Split the component documentation catalog into 76 independent modules under `content/components/`, added UI/service classification and example contracts, and moved the component page chrome to reusable Template fragments.
- Added real browser previews for Data and iframeBridge, fixed script-relative component catalog loading, restored Select/TagInput extended documentation rendering, and added a 76-module Edge documentation smoke check with 390px overflow coverage.
- Hardened documentation demo lifecycles for Pagination, Table, Crud, and FilterBuilder so navigation cleanup destroys handles and late async mounts cannot attach stale listeners; browser smoke now exercises their primary interactions.
- Expanded Template, HTTP, i18n, Storage, localStorage, sessionStorage, and Cookie documentation with copyable API examples, complete method surfaces, async/error/lifecycle guidance, and reuse boundaries.
- Added deterministic HTTP, DOM translation, and Storage interactions to the component documentation browser smoke check; service-only examples now use accurate JavaScript language labels instead of pseudo-declarative HTML.
- Audited DOM, Msg, Permission, Router, Store and Toast documentation against their real browser APIs; added complete signatures, handles, lifecycle guidance, persistence boundaries, and a regression guard against placeholder examples.
- Unified the CSS documentation home runtime badge with the shared `4.63.1` release label and added a regression guard against stale version text.
- Fixed first-paint FOUC in `index.html`, `components.html`, and `admin-blocks.html` by synchronously enhancing dynamically rendered sidebar, documentation, grid, and detail roots; extended the Edge browser smoke check to cover all three documentation entries.

## 4.63.0 - 2026-08-29

- Made runtime and build-time utility insertion deterministic: shorthand and longhand utilities now follow a canonical cascade topology instead of DOM or class discovery order.
- Added optional Constructable Stylesheet support with automatic `<style>` fallback, `JquanUI.adopt()` / `detach()` for ShadowRoot mounting, and `getStyleSheet()` diagnostics.
- Hardened arbitrary CSS values against legacy `expression()`, binding/behavior declarations, escaped at-rules, JavaScript URLs, unbalanced brackets, and malformed alpha fractions while preserving valid data URLs and nested functions.
- Added 8-digit HEX RGB channel extraction and color-space-aware opacity composition for OKLCH, OKLAB, Lab, LCH, Display P3, Rec.2020, A98 RGB, and ProPhoto RGB.
- Added canonical ordering, cache CSSOM, arbitrary-value, modern-color, and ShadowRoot API regression coverage; synchronized the package release to `4.63.0`.

## 4.61.0 - 2026-08-27

- Added the standalone `favicon` component for browser tab icon management.
- Added safe href/SVG/Canvas sources, bounded badges, status icons with loading frames, original icon restoration, theme watching, and instance cleanup.
- Added component bundle integration, typed browser globals, developer/AI documentation, and favicon regression coverage.

## 4.60.0 - 2026-08-26

- Added the standalone `iframeBridge` component for parent/child iframe communication.
- Added origin allowlists, namespace isolation, handshake retries, MessageChannel preference, postMessage fallback, request/response timeouts, event subscriptions, and lifecycle cleanup.
- Added developer documentation, AI Skill guidance, component bundle integration, and message-protocol regression coverage.
- Added typed browser-global declarations and a real Edge same-origin iframe regression fixture.
- Extended the installed-package smoke test to assert that the standalone iframe bridge ships in the tarball.

## 4.59.0 - 2026-08-26

- Promoted the independent Data module to `0.2.0`.
- Added a durable Outbox independent of bounded change history, with cursor and accepted-event pruning.
- Added backward-compatible persistence handles with callable `close()`, explicit `flush()`, and observable `status()`.
- Added primary/backup slots to Memory, Storage, and IndexedDB adapters with automatic corruption recovery and `onCorrupt` diagnostics.
- Kept persistence format version 1 compatible while extending lifecycle, type, documentation, browser, and installed-package coverage.

## 4.58.2 - 2026-08-26

- Serialized automatic persistence and IndexedDB writes so stale asynchronous saves cannot overwrite newer collection state.
- Added the `persist()` `onError` callback for background save failures and tightened concurrent-write regression coverage.

## 4.58.1 - 2026-08-25

- Data persistence now stores and restores revision, history, pending and acknowledged sync state, event de-duplication IDs, and generated-ID sequence without emitting restore events.
- Legacy array persistence remains readable and is upgraded to a versioned `jquanui-data-state` package on save.
- Fixed the top-level `liveQuery()` declaration to expose the runtime-supported `debounce` and `cache` options through a shared `LiveQueryOptions<T>` type.
- Extended the installed-package smoke test to cover the Data CJS/ESM entries, durable state packages, and top-level `liveQuery()` type surface.

## 4.58.0 - 2026-08-25

- Added semantic `text-shadow-none/sm/md/lg` utilities and arbitrary `text-shadow-[...]` support.
- Added arbitrary composite font declarations through `font-[...]`.
- Added Core regression coverage for composite typography mappings.

## 4.57.0 - 2026-08-24

- Added an independent `check:template-runtime` gate for syntax, loops, cache limits, async includes, safe rendering, cycle errors, and DOM mount lifecycle behavior.
- Hardened IndexedDB persistence for existing higher-version databases and on-demand Store upgrades.
- Fixed transaction rollback to restore revision, change history, event deduplication, and acknowledgement state together with records.
- Fixed the ESM Data entry so its 17 public exports now match the CJS, browser, and TypeScript surfaces.
- Extended the Data API surface check to dynamically import and validate the ESM entry.
- Added the versioned Data API surface manifest and compatibility check for CJS, browser, and TypeScript exports.
- Added `DataValidationError` with field-level schema diagnostics and opt-in `createDataInspector()` developer tooling.
- Added a real Edge CDP browser gate covering IndexedDB and same-channel BroadcastChannel propagation.
- Added the Data guide at `skills/jquanui/DATA.md` covering Schema, migrations, snapshots, persistence, joins, synchronization recovery, and AI usage rules.
- Documented `changesSince()`, opt-in snapshot recovery, `resolveConflict()`, `onConflict()`, and the 10k/100k benchmark workflow.
- Added `createFilterBuilderMatcher()` for converting the existing FilterBuilder payload into Data matchers.
- Reused FilterBuilder UI and Data query operators without duplicating either filtering implementation.
- Added AND/OR and comparison operator integration coverage with documentation.

## 4.56.0 - 2026-08-24

- Added `createCrudDataSource()` to adapt Data collections to the existing CRUD request protocol.
- Reused CRUD, Table, and Pagination components for local/offline collection workflows.
- Added create, update, remove, and list integration coverage with documentation.

## 4.55.0 - 2026-08-24

- Added `createTableDataSource()` to adapt Data collections to the existing Table `remote.load` protocol.
- Reused Table filtering, sorting, pagination, and rendering instead of adding a duplicate table binding component.
- Added Data-to-Table integration regression coverage and documentation.

## 4.54.0 - 2026-08-24

- Added `createStorageAdapter()` for Data persistence through the existing Storage component.
- Reused `storageApi.get/set/remove` instead of introducing another local/session storage wrapper.
- Added adapter regression coverage and documented the ecosystem composition path.

## 4.53.0 - 2026-08-23

- Added `createHttpSyncAdapter()` that reuses the existing JquanUI HTTP component.
- Added collection `sync()` orchestration for pull, replay, incremental push, and cursors.
- Kept retries, timeout, authentication, and interceptors in the existing HTTP component.

## 4.52.0 - 2026-08-23

- Added bounded collection change logs with monotonically increasing revisions.
- Added `changes(since)` and `applyChanges()` for offline replay and custom REST/WebSocket sync layers.
- Kept network transport outside the independent Data module.

## 4.51.0 - 2026-08-23

- Added `paginationApi.updatePage()` to connect Data `paginate()` results to the existing Pagination UI component.
- Kept data calculation and UI rendering separate while removing repetitive page-state mapping in application code.

## 4.50.0 - 2026-08-23

- Added query pagination metadata through `paginate(page, pageSize)`.
- Added `average`, `min`, `max`, `pluck`, and `distinct` query helpers for tables and dashboards.
- Kept query helpers available in the browser build and typed subpath API.

## 4.49.0 - 2026-08-23

- Made query `first()` non-mutating so later `count()` and `all()` calls retain the original query.
- Added atomic collection transaction rollback when a transaction callback throws.
- Preserved batched change notifications only for committed transactions.

## 4.48.0 - 2026-08-23

- Added optional `unique` field constraints and record validators to the data layer.
- Duplicate primary keys and unique values now fail before mutation instead of silently overwriting data.
- Kept `upsert()` as the explicit replace-or-insert operation.

## 4.47.0 - 2026-08-23

- Connected declared data indexes to simple equality query planning instead of leaving them as metadata only.
- Added `collection.explain()` to show whether a query uses an index candidate set or a full scan.
- Kept complex operators and logical predicates on the predictable scan path.

## 4.46.0 - 2026-08-23

- Added live queries that notify only when their result set changes.
- Added memory and IndexedDB persistence adapters with debounced saves.
- Kept persistence optional so the default data layer remains synchronous and dependency-free.
- Marked the new data layer as pre-1.0 (`0.1.0`) while its API is being validated.

## 4.45.0 - 2026-08-23

- Added the independent `jquanui/data` browser data layer.
- Added collection queries, operators, sorting, pagination, grouping, batch mutation, subscriptions, indexes, and database snapshots.
- Kept the data layer outside Core and exposed a browser global through `JquanUI@Data.js`.

## 4.44.0 - 2026-08-23

- Added the independent `jquanui/data` browser data layer.
- Added collection queries, operators, sorting, pagination, grouping, batch mutation, subscriptions, indexes, and database snapshots.
- Kept the data layer outside Core and exposed a browser global through `JquanUI@Data.js`.

## 4.32.0 - 2026-08-21

- Added modern typography utilities for stable wrapping, text box trimming, and text box edges.
- Added `interpolate-size-*` utilities for intrinsic size animation strategies.
- Added `box-decoration-slice` and `box-decoration-clone` for fragmented inline decorations.
- Added duplicate-map and Core regression coverage.

## 4.31.0 - 2026-08-21

- Added `field-sizing-content` and `field-sizing-fixed` for intrinsic form control sizing.
- Added `color-scheme-normal`, light/dark, and only-light/only-dark utilities for native controls.
- Added semantic `caret-auto`, `caret-current`, `caret-transparent`, and `caret-inherit` utilities.
- Added duplicate-map and Core regression coverage for all new mappings.

## 4.30.0 - 2026-08-21

- Added opt-in `patch: true` DOM reconciliation for Template mounts and handle renders.
- Reused existing nodes when type, tag, and attributes remain compatible; structural mismatches replace only the affected subtree.
- Preserved the default `innerHTML` path for maximum throughput and added documentation for when DOM patching is appropriate.

## 4.29.0 - 2026-08-21

- Added explicit `renderToString()` and `renderToStringAsync()` Template SSR aliases.
- Added optional template bundle dependency reports with template names, source paths, source bytes, bundle bytes, and counts.
- Added CLI `--template-bundle-report`, Vite `templateBundleReport`, and PostCSS `templateBundleReport` support.
- Added cross-tool regression coverage for SSR aliases and dependency report emission.

## 4.28.0 - 2026-08-21

- Added the unified Template `safe: true` preset for safe expressions, HTML sanitization, resource URL validation, and filter allowlists.
- Added the CLI `--safe` option and `safeFilters` runtime configuration.
- Added a DOM-free sanitizer fallback for Node/static rendering and expanded security regression coverage.

## 4.27.0 - 2026-08-21

- Added optional PostCSS template bundle output through `templateInput`, `templateRoot`, and `templateBundle`.
- Kept PostCSS template scanning disabled unless `templateBundle` is explicitly configured.
- Added asset messages and regression coverage for PostCSS template bundle generation.

## 4.26.0 - 2026-08-21

- Added production template bundles that preload external fragments into `window.JQUAN_TEMPLATES` and `templateApi` without runtime requests.
- Added Template `1.5.0` batch registration through `registerTemplates()` and automatic startup registration of a global template map.
- Added CLI `--bundle-templates` and `--template-bundle-output` plus Node `createTemplateBundle()` and `writeTemplateBundle()` APIs.
- Added opt-in Vite `templateBundle`, `templateInput`, `templateRoot`, and `templateBundleInject` support with HTML injection and template watch files.
- Preserved template-root-relative names, escaped script-closing source safely, and supported loading bundles before or after the Template component.
- Added regression coverage for bundle generation, runtime registration, Vite base paths, asset emission, injection opt-out, and watch integration.

## 4.25.0 - 2026-08-20

- Added build-time static HTML rendering for Template `include`, `layout`, and `slot` syntax.
- Added CLI support for file, directory, and glob page entries with preserved output paths, a dedicated template root, and optional JSON data.
- Added `createNodeTemplateRuntime()`, `renderTemplateFile()`, `resolveTemplateEntries()`, and `buildTemplatePages()` to CJS, ESM, and TypeScript surfaces.
- Reused the browser Template component parser and structured error chain in Node instead of maintaining a second template implementation.
- Added independent regression coverage for multi-page output, nested includes, layouts, data files, exact-file output, runtime reuse, and missing-template errors.

## 4.24.0 - 2026-08-20

- Added development-only Vite HMR for external `.html/.htm` templates.
- Added runtime `invalidate()` and `refresh()` APIs for precise cache invalidation and mounted-instance rerendering.
- Added loader-race isolation during invalidation and clean HMR listener teardown through the component lifecycle.
- Added `templateHmr` Vite configuration, the exported `TEMPLATE_HMR_EVENT`, type declarations, and independent Vite hook regression coverage.
- Kept production HTML free of the HMR client and allowed the integration to be disabled explicitly.

## 4.23.0 - 2026-08-20

- Added recursive external template dependency graphs with static, dynamic, ordered, and cyclic dependency reporting.
- Added structured `templateName` and `includeChain` fields to nested include/layout errors.
- Preserved file-local line, column, and source snippets while rendering nested templates asynchronously.
- Added `templateApi.inspect()` as a concise alias for external template metadata inspection.
- Expanded Template `1.3.0` regression coverage for dependency traversal, dynamic includes, cycles, and nested syntax failures.

## 4.22.0 - 2026-08-20

- Added bounded LRU caching, TTL expiry, cache versions, hit metadata, and configurable limits for external HTML templates.
- Added bounded LRU eviction for compiled template ASTs through the `cacheLimit` option.
- Prevented superseded loader requests from contaminating a replacement loader cache.
- Expanded Template `1.2.0` regression coverage for eviction order, expiry reloads, disabled caching, metadata, and loader lifecycle races.

## 4.21.0 - 2026-08-20

- Added a single component manifest and deterministic generation for the Components and Full browser bundles.
- Defined Components as the complete 71-component bundle and Full as a curated 33-component profile with shared presets.
- Removed duplicate preset blocks from the Components aggregate and retired overlapping Core/Template bundle synchronizers.
- Added checks for missing files, duplicate manifest entries, duplicate plugin names, stale aggregate output, and Core/Full drift.

## 4.20.2 - 2026-08-20

- Removed the unreferenced and stale `JquanUI@components.min.js` artifact from the npm package.
- Synchronized the migration report version with the package and Core release version.
- Added an actual npm tarball size gate instead of relying only on a projected compression ratio.

## 4.20.1 - 2026-08-20

- Replaced the stale `3.4.1` runtime embedded in the Full browser bundle with the canonical current Core.
- Added deterministic Full Core synchronization and a release check that rejects future Core/Full drift.
- Kept the existing Full component set and Template `1.1.0` integration unchanged.

## 4.20.0 - 2026-08-20

- Added the `JQFileLoader` extension for external HTML template includes and layouts through the asynchronous template renderer.
- Added `templateApi.useLoader()`, `createFileLoader()`, `preload()`, external template cache controls, request deduplication, and cache inspection.
- Added extension validation, parent-path and remote-URL safeguards, fetch errors, and external include cycle detection.
- Kept synchronous rendering and existing registered/DOM templates unchanged; external files use `renderAsync()` or `mountAsync()` explicitly.
- Added Template component bundle synchronization and an independent external-template regression suite.

## 4.19.3 - 2026-08-20

- Reused one configuration hash during each cache persistence trim cycle instead of recomputing it for every size reduction.
- Preserved the existing cache format, limits, hydration checks, and LRU-style trimming behavior.

## 4.19.2 - 2026-08-19

- Avoided runtime scans for irrelevant attribute mutations when no plugin attribute hooks are installed.
- Preserved automatic rescans for class, data, ARIA, language, direction, and native state attributes.
- Added regression coverage for the observer filtering path.

## 4.19.1 - 2026-08-19

- Replaced gradient border and gradient ring substring selectors with exact generated utility rules.
- Kept gradient pseudo-elements compatible with variants and removed the stale ring width variable reference.
- Added duplicate top-level variant and utility mapping checks to the Core quality gates.

## 4.19.0 - 2026-08-18

- Added the non-destructive `jquan-migrate` CSS audit CLI and `jquanui/migrate` API subpath.
- Added semantic-first migration suggestions for common layout, spacing, sizing, typography, state, breakpoint, theme-color, and fluid-token declarations.
- Added separate semantic, arbitrary-value, and manual-review coverage so reports do not inflate migration readiness with bracket syntax.
- Added JSON and Markdown reports, recursive CSS directory scanning, configured token/breakpoint awareness, semantic-only mode, and a CI coverage threshold.
- Preserved pseudo-class, pseudo-element, media, supports, and `!important` context where a selector can be migrated safely.
- Added package-install, CJS/ESM/type-surface, CLI exit-code, and generated-class resolution regression coverage.

## 4.18.0 - 2026-08-18

- Added semantic fluid spacing tokens through `theme.extend.fluid.spacing`, available across spacing, sizing, layout, and safe-area utilities.
- Added semantic fluid typography through `theme.extend.fluid.fontSize` with optional line-height composition.
- Accepted tuple, object, and existing `clamp(...)` token formats while rejecting malformed names, incomplete ranges, and declaration-breaking values.
- Kept runtime resolution, CLI extraction, Vite, PostCSS, and SSR on the same fluid-token parsing path.

## 4.17.0 - 2026-08-18

- Added complete theme support for `oklch()`, `color(display-p3 ...)`, alpha-bearing `rgb()`, `light-dark()`, `color-mix()`, and other valid CSS color values.
- Added opacity suffix composition for modern colors through `color-mix()`, while preserving the existing `rgba()` output for RGB channel colors.
- Added complete-color semantic theme variables so modern colors remain valid across light/dark switching and runtime theme changes.
- Added modern-color support for backgrounds, text, borders, gradients, rings, ring offsets, and colored shadows.
- Added dual shadow declarations: legacy RGB output remains first, followed by a modern complete-color override where supported.
- Fixed ring and ring-offset color routing so unknown color names are no longer misinterpreted as ring widths.
- Fixed arbitrary shadows so they retain ring/shadow composition and the dual declaration pipeline.

## 4.16.0 - 2026-08-18

- Added opt-in cascade-layer governance through `cascadeLayers: true`.
- Added deterministic `jquan-reset`, `jquan-theme`, `jquan-components`, and `jquan-utilities` layer ordering.
- Applied the same layer model to runtime insertion, warm-cache hydration, build-time extraction, SSR, late config, theme switching, and plugin refreshes.
- Kept cascade layers disabled by default so existing projects retain their established specificity and source-order behavior.

## 4.15.0 - 2026-08-18

- Added native interaction variants: `open:`, `details-open:`, `popover-open:`, `modal:`, `inert:`, `user-valid:`, and `user-invalid:`.
- Added `starting:` for CSS `@starting-style`, enabling entry transitions for dialogs, popovers, and other top-layer UI without custom CSS.
- Added safe-area spacing utilities: `p-safe`, `px-safe`, `py-safe`, `pt-safe`, `pr-safe`, `pb-safe`, and `pl-safe`.
- Added safe-area position utilities: `inset-safe`, `top-safe`, `right-safe`, `bottom-safe`, and `left-safe`.
- Safe-area utilities accept semantic offsets such as `pb-safe-4` and `px-safe-2`, producing `calc(env(...) + spacing)`.

## 4.14.1 - 2026-08-18

- Changed `lang-*` and `not-lang-*` to native `:lang()` matching so language variants inherit from `<html lang>`, work inside localized subtrees, and match regional tags such as `en-US`.
- Added BCP 47-style language-range validation and regional-language regression coverage.

## 4.14.0 - 2026-08-18

- Added configured and arbitrary range variants such as `max-tablet:`, `max-[760px]:`, and `min-[901px]:`.
- Added document-language variants through `lang-*` and `not-lang-*`.
- Added pointer, hover capability, forced-colors, and reduced-transparency media variants.
- Added semantic `supports-[...]` / `media-[...]` variants and arbitrary at-rule variants such as `[@supports(...)]:` and `[@media(...)]:`.
- Added `theme.extend.keyframes` and `theme.extend.animation` so project-specific motion works in runtime, build-time extraction, and SSR without a standalone CSS file.
- Added regression coverage for arbitrary ancestor selectors such as `[.scrolled_&]:`.
- Added a rule-level real-project CSS audit utility to distinguish migration debt from genuine engine gaps and project-specific visual CSS.

## 4.13.0 - 2026-08-17

- Added a packaged `jquanui` AI Skill that teaches semantic, atomic-first, CSS-free interface construction.
- Added `text-md` as a semantic 16px alias for AI-generated and application code.
- Made `before:` and `after:` utilities create their pseudo-elements automatically with a shared `--jquan-content` value.
- Added `content-none`, `content-empty`, and reliable arbitrary `content-[...]` composition.
- Added `data-*`, `aria-*`, `group-data-*`, `peer-data-*`, `group-aria-*`, and `peer-aria-*` state variants.
- Added WebKit scrollbar pseudo-element variants for fully atomic scrollbar styling.
- Preserved semicolons inside arbitrary data URLs such as `bg-[url('data:image/svg+xml;base64,...')]`.
- Fixed the CSS documentation homepage loader so the application starts reliably from a local HTTP server.
- Made all three documentation surfaces responsive at mobile widths and refreshed displayed version labels.

## 4.12.6 - 2026-08-17

- Restored theme configuration declared immediately after the Core script through a one-time late-config bridge.
- Rebuilt theme variables and runtime rules when a late `window.JQUAN_CONFIG` assignment is detected.
- Moved bundled documentation pages to the preferred config-before-Core loading order.
- Applied the late-config compatibility fix to the archived runtime and advanced it to 4.5.3.

## 4.12.5 - 2026-08-17

- Fixed `.container` max-width values to follow viewport breakpoints instead of container-query thresholds.
- Kept `containers` sizing dedicated to `@container` variants.
- Applied the same `.container` correction to the archived runtime and advanced it to 4.5.2.

## 4.12.4 - 2026-07-22

- Fixed first-paint FOUC by hydrating cached CSS immediately while the parser is still in the document head.
- Started the mutation observer during HTML parsing and synchronously compiled parser-added classes before the next paint.
- Made synchronous scans drain the complete rule queue instead of stopping after the first 40-rule chunk.
- Kept idle chunking for post-load dynamic updates to avoid blocking AJAX-heavy interfaces.
- Added `jquan-ready`, `data-jquan-ready`, `jquan:ready`, and `JquanUI.isReady()` lifecycle signals.
- Applied the same first-paint fix to the archived v4.5 runtime and advanced it to 4.5.1.

## 4.12.3 - 2026-06-19

- Aligned PostCSS subpath declarations with the ESM runtime surface.
- Added type-surface regression checks for PostCSS named exports.

## 4.12.2 - 2026-06-19

- Fixed browser cold-start insertion for utilities that emit multiple top-level CSS rules.
- Tightened `jquanui/extract` declarations to match the extract subpath runtime surface.
- Added missing root constants and Vite named export declarations.

## 4.12.1 - 2026-06-19

- Fixed shortcut composition for utilities that emit multiple CSS rules.
- Made class conflict collection opt-in through `debug({ track: true })`, `debug.trackConflicts`, or `diagnostics.trackConflicts`.

## 4.12.0 - 2026-06-19

- Added `jquan-extract --doctor` and `--doctor --json` for project extraction diagnostics.
- Added `diagnoseProject()` and `formatDoctorReport()` Node APIs.
- Added doctor coverage for config discovery, content inputs, core version, generated files/classes/rules, warning counts, and recommendations.

## 4.11.0 - 2026-06-19

- Added production SSR style tag helpers with `createCriticalStyleTag()`.
- Added CSP nonce, stable id, custom attributes, and replacement controls for critical CSS injection.
- Added TypeScript declarations and package smoke coverage for the expanded SSR API.

## 4.10.0 - 2026-06-19

- Added runtime shortcuts / @apply-style composition.
- Added build-time static extraction CLI.
- Added config loading, auto-discovery, `content`, `safelist`, `blocklist`, glob patterns, and config initialization.
- Added SSR helpers: `renderCriticalCss()` and `injectCriticalCss()`.
- Added Vite and PostCSS integrations.
- Added extraction diagnostics reports and CI `failOnWarn` support.
- Added W3C Design Tokens import/export bridge.
- Added package exports, CLI bins, and TypeScript declarations.

## 4.5.0 - 2026-06-19

- Archived formal runtime at `dist/core/JquanUI@Core v4.5.js`.
- Cleared runtime hard bugs and architecture cleanup items from the stabilization cycle.
## 4.33.0 - 2026-08-21

### Added

- Added semantic mappings for `scrollbar-gutter`, `content-visibility`, CSS containment, and `contain-intrinsic-size`.
- Added modern rendering and platform mappings for `image-rendering`, `text-size-adjust`, anchor positioning, View Transitions, forced-colors, and print color adjustment.
- Added regression coverage for the new mappings, including arbitrary anchor names.

### Quality

- Ran the duplicate-mapping audit before retaining the new utilities; existing containment and print mappings remain single-source entries.
## 4.34.0 - 2026-08-21

### Added

- Added scroll anchoring and scroll/view timeline mappings for modern scroll-driven interfaces.
- Added shape and motion-path mappings for image wrapping and offset-path animation.
- Added `text-decoration-skip-ink` semantic variants for readable links and annotations.

### Quality

- Added regression coverage for arbitrary timeline values, scroll timeline axes, offset rotation, and ink skipping.
## 4.35.0 - 2026-08-22

### Added

- Added international typography utilities for `text-autospace`, `text-spacing-trim`, `hyphenate-character`, and ruby annotation placement.
- Added font rendering controls for kerning, optical sizing, palette selection, and synthesis.
- Added mask compositing, mask mode/type/origin/position, SVG paint order, fill/clip rules, and vector effects.

### Quality

- Added duplicate-mapping coverage for the expanded typography, mask, and SVG utility groups.
## 4.36.0 - 2026-08-22

### Added

- Added advanced international typography mappings for ligatures, East Asian variants, ruby positioning, text rendering, vertical text orientation, and white-space collapsing.
- Added scrollbar color, image orientation, border image, table empty-cell, and tab-size utilities.
- Added regression coverage for the new typography, media, table, and border-image surfaces.
## 4.37.0 - 2026-08-22

### Added

- Added print pagination mappings for legacy `page-break-*` properties alongside the existing modern `break-*` utilities.
- Added `orphans-*` and `widows-*` controls for paged documents and print layouts.
- Added regression coverage for page breaks and pagination line counts.
## 4.38.0 - 2026-08-22

### Added

- Added logical sizing utilities: `is-*`, `bs-*`, `min-is-*`, `max-is-*`, `min-bs-*`, and `max-bs-*`.
- Added modern line-breaking and text-decoration positioning utilities.
- Added logical resize utilities for inline and block directions.

### Quality

- Added regression coverage for logical dimensions, CJK-friendly line breaking, underlined text positioning, and logical resize behavior.
## 4.39.0 - 2026-08-22

### Added

- Added SVG rendering controls for shape and color rendering, color interpolation, text anchoring, dominant baselines, baseline shifts, and marker endpoints.
- Added Core regression coverage for SVG presentation-property mappings.
## 4.40.0 - 2026-08-22

### Added

- Added `font-size-adjust-*` utilities for font fallback metrics and multilingual typography stability.
- Added `overflow-clip-margin-*` utilities for controlled visual overflow around clipped media and decorative elements.
- Added regression coverage for semantic and arbitrary overflow clip margins.
## 4.41.0 - 2026-08-22

### Added

- Added logical scroll margin and scroll padding utilities for writing-mode-aware interfaces.
- Added East Asian text emphasis utilities, including dot, circle, sesame, triangle, color, and placement variants.
- Added regression coverage for logical scroll offsets and text emphasis.
## 4.42.0 - 2026-08-23

### Added

- Added logical block-start and block-end border color, width, and style utilities using the existing `border-bs` / `border-be` naming family.
- Added `image-resolution-from-image` and `image-resolution-snap` for resolution-aware media rendering.
- Added regression coverage for logical borders and image resolution.
## 4.43.0 - 2026-08-23

### Quality

- Extended `debug()` / `diagnose()` with scan, queue, cache hydration, and rule-resolution performance metrics plus budget warnings.
- Added an independent template performance check covering 1,000 string renders and invariants for the opt-in DOM patch path.
- Added regression assertions for the Core performance diagnostic surface.
## 4.44.0 - 2026-08-23

### Quality

- Safe Preset now supports configurable resource protocols, optional data-image blocking, and a post-sanitization hook that cannot bypass the built-in sanitizer.
- Template bundle reports now include static and dynamic dependencies per template plus aggregate dependency counts.
- Added structural visual regression checks for QA fixtures, responsive viewport metadata, current Core loading, and representative atomic classes.
## Unreleased

- 统一 CSS 文档的高频能力演示规范：说明、最小示例、可视预览、交互控制、实时状态和可复制代码。
- 为“现代 CSS 与迁移”新增原生状态、语言、深色主题和表单校验实验室，帮助开发者直接验证变体效果。
- 为“文本对齐”和“显示类型”新增 Playground、方向切换、display 行为反馈和实时 class 展示。
- 修复“字体粗细”文档路由大小写错误，并将模板构建阶段的路线图状态更新为已完成。

- Migrated Select 1.1 to OverlayManager 1.3 with ownerElement cleanup, shared top-layer Escape/Tab/click, combobox/listbox ARIA, native value synchronization and stable handles.
- Added remote search requestId/AbortController race protection, late-result cancellation on destroy, Select consumer types/importer overload, and synchronized docs/skill.
