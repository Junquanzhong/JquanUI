import type { DrawerApi } from './components/drawer';
import type { PopoverApi } from './components/popover';
import type { ModalApi } from './components/modal';
import type { SelectApi } from './components/select';
import type { OverlayManagerApi } from './components/overlayManager';
import type { CarouselApi } from './components/carousel';
import type { TabsApi } from './components/tabs';
import type { ReviewModeApi, ReviewModeOptions } from './components/reviewMode';
export type { ReviewApplyOptions, ReviewApplyResult, ReviewApplyIssue, ReviewApplyIssueCode } from './components/reviewMode';
export type { ReviewModeApi, ReviewModeOptions, ReviewModeSelection, ReviewModeState, ReviewUtilityField, ReviewAttribute, ReviewPlanFormat, ReviewChange, ReviewPlan, ReviewUtilityDescriptor, ReviewNavigationDirection, ReviewCarouselOptions, ReviewTabsOptions, ReviewSelectOptions, ReviewPopoverOptions, ReviewComponentOption } from './components/reviewMode';
export type { DrawerApi, DrawerHandle, DrawerOptions, DrawerTarget } from './components/drawer';
export type { PopoverApi, PopoverHandle, PopoverOptions, PopoverTarget } from './components/popover';
export type { ModalApi, ModalHandle, ModalOptions, ModalState } from './components/modal';
export type { SelectApi, SelectHandle, SelectOptions, SelectState, SelectUpdateDetail } from './components/select';
export type { CarouselApi, CarouselHandle, CarouselOptions, CarouselState, CarouselTarget, CarouselChangeDetail, CarouselPlayDetail, CarouselPauseDetail, CarouselUpdateDetail } from './components/carousel';
export type { TabsApi, TabsHandle, TabsOptions, TabsClassOptions, TabsState, TabsTarget, TabsGoToOptions, TabsChangeDetail } from './components/tabs';
export type ContentEntry = string | string[] | { files?: ContentEntry; paths?: ContentEntry };

export interface SafelistEntryObject {
  class?: string;
  classes?: string;
  raw?: string;
  value?: string;
  variants?: string[];
}

export type SafelistEntry = string | SafelistEntryObject | SafelistEntry[];
export type BlocklistEntry = string | RegExp | { class?: string; pattern?: string | RegExp } | BlocklistEntry[];

export type SemanticColor = string | { light: string; dark: string };

export type FontSizeToken = string | [string, string | { lineHeight?: string; letterSpacing?: string; fontWeight?: string | number }];
export interface ConfigWarning {
  path: string;
  code: 'unknown-key' | 'invalid-type' | 'invalid-value' | 'invalid-name';
  message: string;
}

export interface ThemeTokens {
  colors?: Record<string, unknown>;
  spacing?: Record<string, string>;
  breakpoints?: Record<string, string>;
  containers?: Record<string, string>;
  fontFamily?: Record<string, string | string[]>;
  /** Compatibility alias; borderRadius wins for duplicate names at the same level. */
  radius?: Record<string, string>;
  borderRadius?: Record<string, string>;
  boxShadow?: Record<string, string>;
  /** DEFAULT and fluid-* names are reserved; use base to override text-base. */
  fontSize?: Record<string, FontSizeToken>;
  [key: string]: unknown;
}

export interface DarkMappingConfig {
  /** Generate dark and prefers-color-scheme overrides for explicitly mapped legacy color classes. */
  enabled?: boolean;
  /** Map a color token without opacity (white, slate-700) to an existing theme.semantic role. Applies across color properties; sizes, arbitrary values and shadows are excluded. */
  map?: Record<string, string>;
}

export interface JquanConfig {
  reviewMode?: ReviewModeOptions;
  /** Select before loading components; overlay inherits ui when omitted. */
  componentPresets?: { ui?: 'legacy' | 'semantic'; overlay?: 'legacy' | 'semantic' };
  content?: ContentEntry;
  safelist?: SafelistEntry;
  blocklist?: BlocklistEntry;
  shortcuts?: Record<string, string>;
  customUtilities?: Record<string, unknown>;
  plugins?: unknown[];
  constructableStylesheets?: boolean;
  darkMapping?: DarkMappingConfig;
  theme?: ThemeTokens & {
    extend?: ThemeTokens;
    semantic?: Record<string, SemanticColor>;
    shortcuts?: Record<string, string>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface ExtractOptions {
  core?: string;
  config?: JquanConfig;
  configFile?: string | false;
  root?: string;
  minify?: boolean;
  header?: string | false;
  runtime?: RuntimeHandle;
}

export interface CriticalStyleOptions extends ExtractOptions {
  attribute?: string | false;
  attributes?: Record<string, string | number | boolean | null | undefined>;
  id?: string;
  nonce?: string;
  replaceExisting?: boolean;
}

export interface RuntimeHandle {
  api: JquanRuntimeApi;
  insertedRules: string[];
  getBaseCss(): string;
}

export interface AdoptionOptions {
  /** Compile classes already present in the root. Defaults to true. */
  scan?: boolean;
  /** Observe later class, state-attribute, and child mutations. Defaults to true. */
  observe?: boolean;
}

export interface AdoptionStatus {
  adopted: boolean;
  observed: boolean;
  styleMode: 'style' | 'constructable';
  /** Number of JquanUI-owned sheets currently mounted on this root. */
  sheetCount: number;
}

export interface CompileOptions {
  /** Drain the requested classes synchronously. Use only for small, known batches. */
  sync?: boolean;
}

export interface CompileResult {
  requested: string[];
  /** Classes whose resolver/insertion attempt finished (including unresolved/failed classes). */
  processed: string[];
  unresolved: string[];
  failed: string[];
  /** Classes still waiting in the shared compile queue for this request. */
  pending: string[];
  durationMs: number;
  /** True when every requested class has an attempted outcome. */
  complete: boolean;
  /** True when destroy() or late configuration cancelled the request. */
  cancelled: boolean;
  /** busy means flush was called reentrantly while a resolver was running. */
  reason: 'stylesheet-unavailable' | 'budget' | 'busy' | 'destroyed' | 'config-changed' | null;
  remaining: number;
}

export interface FlushOptions {
  /** Maximum synchronous budget for this flush. Omit to drain the current queue completely. */
  maxMs?: number;
}

export interface JquanRuntimeApi {
  /** Historical display version, including the label; retained for compatibility. */
  version: string;
  /** Pure semver, equal to debug/metrics/ready version and package.json version. */
  engineVersion: string;
  /** Descriptive label without the version or parentheses. */
  versionLabel: string;
  import(name: 'drawer', options?: ComponentImportOptions): Promise<DrawerApi>;
  import(name: 'popover', options?: ComponentImportOptions): Promise<PopoverApi>;
  import(name: 'modal', options?: ComponentImportOptions): Promise<ModalApi>;
  import(name: 'select', options?: ComponentImportOptions): Promise<SelectApi>;
  import(name: 'overlayManager', options?: ComponentImportOptions): Promise<OverlayManagerApi>;
  import(name: 'carousel', options?: ComponentImportOptions): Promise<CarouselApi>;
  import(name: 'tabs', options?: ComponentImportOptions): Promise<TabsApi>;
  import(name: 'reviewMode', options?: ComponentImportOptions): Promise<ReviewModeApi>;
  /** Load one or more local components from the browser component directory. */
  import<T = unknown>(names: string | string[], options?: ComponentImportOptions): Promise<T | T[]>;
  /** Queue explicit classes and resolve when those classes have been processed. */
  compile(classNames: Iterable<string> | string, options?: CompileOptions): Promise<CompileResult>;
  /** Drain the currently queued classes; maxMs returns a partial result when the budget expires. */
  flush(options?: FlushOptions): Promise<CompileResult>;
  /** Resolve explicit classes without writing CSS, queues, diagnostics or metrics. */
  checkClasses(classNames: Iterable<string> | string, options?: ClassCheckOptions): ClassCheckReport;
  /** Single resolver query; user resolver exceptions propagate. */
  resolve(className: string): UtilityResolution | null;
  prefetch?(classNames: Iterable<string> | string, options?: PrefetchOptions): PrefetchResult;
  adopt?(root?: Document | ShadowRoot, options?: AdoptionOptions): boolean;
  detach?(root?: Document | ShadowRoot): boolean;
  getAdoptionStatus?(root?: Document | ShadowRoot): AdoptionStatus;
  getStyleSheet?(): CSSStyleSheet | null;
  styleMode?: 'style' | 'constructable';
  expandSyntax?(classString: string): string;
  isReady?(): boolean;
  debug?(options?: DebugOptions): DebugReport;
  diagnose?(options?: DebugOptions): DebugReport;
  getMetrics?(): MetricsSnapshot;
  [key: string]: unknown;
}

export interface DebugOptions {
  /** Explicitly enables conflict tracking and triggers a scan. Omit for a query. */
  track?: boolean;
}

export interface UtilityResolution {
  className: string;
  css: string;
  mediaQuery: string[] | null;
}

export interface ClassCheckOptions {
  /** Maximum unique expanded classes to attempt. Default 1000; Infinity disables the limit. */
  maxClasses?: number;
  /** Cooperative synchronous resolver budget in milliseconds. Default 50; normalization is excluded. */
  timeoutMs?: number;
}

export interface ClassCheckItem {
  className: string;
  /** Resolution result now; never a guarantee that browser CSSOM accepts or applies CSS. */
  status: 'resolved' | 'unresolved' | 'error' | 'ignored' | 'skipped';
  css: string | null;
  error: { name: string; message: string } | null;
  reason: 'max-classes' | 'timeout' | null;
  /** Recorded runtime state at call entry, independent of current resolution. */
  runtime: 'unprocessed' | 'pending' | 'processed' | 'unresolved' | 'resolve-error' | 'insert-error';
}

export interface ClassCheckReport {
  requested: string[];
  results: ClassCheckItem[];
  /** No skipped classes. Errors/unresolved entries can still be present. */
  complete: boolean;
  /** All entries resolved or were ignored, with no skipped work. */
  ok: boolean;
  reason: 'max-classes' | 'timeout' | null;
  maxClasses: number;
  timeoutMs: number;
  durationMs: number;
}

export interface ComponentImportOptions {
  /** Component directory; inferred from the Core script when omitted. */
  baseURL?: string;
  /** Script load timeout in milliseconds. Defaults to 15000. */
  timeout?: number;
  /** Install plugins after loading. Defaults to true. */
  install?: boolean;
  /** CSP nonce for dynamically inserted scripts. */
  nonce?: string;
}

export interface MetricsSnapshot {
  version?: string;
  scans?: number;
  totalResolves?: number;
  processedClassCount?: number;
  dynamicRuleCount?: number;
  insertedRuleCount?: number;
  unresolvedClassCount?: number;
  failedRuleCount?: number;
  queueSize?: number;
  isProcessingQueue?: boolean;
  cacheHitRate?: number;
  cacheHydrate?: 'pending' | 'hit' | 'miss' | 'invalid' | 'error';
  cacheHydrateMs?: number;
  cacheBytes?: number;
  slowestResolve?: { className: string; durationMs: number } | null;
  prefetchCount?: number;
  prefetchResolved?: number;
  prefetchSkipped?: number;
  prefetchBytes?: number;
  performance?: {
    lastScanMs?: number;
    maxScanMs?: number;
    averageScanMs?: number;
    lastQueueMs?: number;
    maxQueueMs?: number;
    averageQueueMs?: number;
    cacheHydrateMs?: number;
    budgets?: { scanMs: number; queueMs: number };
    warnings?: string[];
  };
}

export interface PrefetchOptions {
  maxClasses?: number;
  maxBytes?: number;
  timeoutMs?: number;
}

export interface PrefetchSkippedItem {
  className: string;
  reason: 'max-classes' | 'max-bytes' | 'timeout';
}

export interface PrefetchResult {
  requested: string[];
  accepted: string[];
  skipped: PrefetchSkippedItem[];
  ruleCount: number;
  bytes: number;
  durationMs: number;
  maxClasses: number;
  maxBytes: number;
  timeoutMs: number;
  reason: PrefetchSkippedItem['reason'] | null;
  truncated: boolean;
}

export interface DebugItem {
  at?: number;
  className?: string;
  css?: string;
  message?: string;
  [key: string]: unknown;
}

export interface DebugReport {
  version?: string;
  /** Detached diagnostics for theme/extend and customUtilities shape; no per-class console warnings. */
  configWarnings?: ConfigWarning[];
  unresolvedClasses?: DebugItem[];
  failedRules?: DebugItem[];
  conflicts?: DebugItem[];
  unresolvedClassCount?: number;
  failedRuleCount?: number;
  conflictCount?: number;
  metrics?: MetricsSnapshot;
  [key: string]: unknown;
}

export interface ExtractionReport {
  generatedAt: string;
  core: string | null;
  files: string[];
  classCount: number;
  ruleCount: number;
  cssBytes: number;
  baselineCssBytes: number;
  utilityCssBytes: number;
  warnings: number;
  unresolvedClassCount: number;
  failedRuleCount: number;
  conflictCount: number;
  unresolvedClasses: DebugItem[];
  failedRules: DebugItem[];
  conflicts: DebugItem[];
  configWarnings: ConfigWarning[];
}

export interface ExtractResult {
  css: string;
  baselineCss: string;
  utilityCss: string;
  classes: string[];
  runtime: RuntimeHandle;
  ruleCount: number;
  report: ExtractionReport;
  files?: string[];
}

export interface InjectCriticalCssResult extends ExtractResult {
  html: string;
  styleTag: string;
  attributes: Record<string, string | number | boolean | null | undefined>;
}

export interface DoctorReport {
  ok: boolean;
  generatedAt: string;
  root: string;
  core: string;
  coreVersion: string | null;
  configFile: string | null;
  configLoaded: boolean;
  contentEntries: string[];
  inputCount: number;
  files: string[];
  classCount: number;
  ruleCount: number;
  cssBytes: number;
  warningCount: number;
  unresolvedClassCount: number;
  failedRuleCount: number;
  conflictCount: number;
  warnings: string[];
  recommendations: string[];
}

export interface DoctorOptions extends ExtractOptions {
  inputs?: string | string[];
}

export interface CliResult extends ExtractResult {
  ok: boolean;
  output?: string;
  baselineOutput?: string | null;
  utilitiesOutput?: string | null;
  reportPath?: string | null;
  configPath?: string;
}

export interface NodeTemplateRuntime {
  api: {
    renderAsync(template: string, data?: Record<string, unknown>, options?: Record<string, unknown>): Promise<string>;
    renderToString(template: string, data?: Record<string, unknown>, options?: Record<string, unknown>): string;
    renderToStringAsync(template: string, data?: Record<string, unknown>, options?: Record<string, unknown>): Promise<string>;
    dependencyGraph(name: string, options?: Record<string, unknown>): Promise<unknown>;
    [key: string]: unknown;
  };
  component: string;
  templateRoot: string;
}

export interface TemplateBuildOptions {
  root?: string;
  output?: string;
  templates?: string;
  templateRoot?: string;
  component?: string;
  data?: Record<string, unknown>;
  cache?: boolean;
  cacheLimit?: number;
  safeExpressions?: boolean;
  sanitize?: boolean;
  patch?: boolean;
  safe?: boolean;
  safeFilters?: string[];
  extensions?: string[];
  registeredTemplates?: Record<string, string>;
  filters?: Record<string, (...args: unknown[]) => unknown>;
  runtime?: NodeTemplateRuntime;
}

export interface TemplatePageResult {
  entry: string;
  output: string;
  bytes: number;
}

export interface TemplateBuildResult {
  files: TemplatePageResult[];
  count: number;
  output: string;
  templateRoot: string;
}

export interface TemplateBundleOptions {
  root?: string;
  templates?: string;
  templateRoot?: string;
  output?: string;
}

export interface TemplateBundleResult {
  code: string;
  templates: Record<string, string>;
  files: string[];
  count: number;
  bytes: number;
  templateRoot: string;
  output?: string;
  report: {
    generatedAt: string;
    templateRoot: string;
    count: number;
    bundleBytes: number;
    entries: Array<{ name: string; file: string; bytes: number }>;
  };
}

export {
  type FrameworkRenderedOutput,
  type NormalizedRenderedOutput,
  type RenderedOutput,
  type SSRAdapter,
  type SSRAdapterOptions,
  type SSRPageResult,
  type SSRRenderOptions,
  createHtmlDocument,
  createNextSSRAdapter,
  createNuxtSSRAdapter,
  createReactSSRAdapter,
  createSSRAdapter,
  createSvelteSSRAdapter,
  createVueSSRAdapter,
  normalizeRenderedOutput
} from './ssr/jquan-ssr';

export interface VitePluginOptions extends ExtractOptions {
  input?: string | string[];
  output?: string;
  split?: boolean;
  baselineOutput?: string | false;
  utilitiesOutput?: string | false;
  emit?: boolean;
  inject?: 'style' | 'link' | false;
  warmup?: boolean;
  report?: string;
  failOnWarn?: boolean;
  templateHmr?: boolean;
  templateInput?: string | string[];
  templateRoot?: string;
  templates?: string;
  templateBundle?: string | false;
  templateBundleInject?: boolean;
  templateBundleReport?: string;
}

export interface PostCSSPluginOptions extends ExtractOptions {
  input?: string | string[];
  split?: boolean;
  baselineOutput?: string | false;
  utilitiesOutput?: string | false;
  inject?: boolean;
  report?: string;
  failOnWarn?: boolean;
  templateInput?: string | string[];
  templateRoot?: string;
  templates?: string;
  templateBundle?: string | false;
  templateBundleReport?: string;
}

export type TokenObject = Record<string, unknown>;

export const DEFAULT_EXTENSIONS: Set<string>;
export const DEFAULT_CONFIG_FILES: string[];
export function collectClassesFromSource(source: string, expandSyntax?: ((classString: string) => string) | null): Set<string>;
export function buildExtractionReport(result: Partial<ExtractResult>, options?: { core?: string | null }): ExtractionReport;
export function createBlocklistMatcher(blocklist?: BlocklistEntry): (token: string) => boolean;
export function createConfigTemplate(): string;
export function createCriticalStyleTag(css: string, options?: CriticalStyleOptions): string;
export function createRuntime(coreFile: string, options?: ExtractOptions): RuntimeHandle;
export function decodeHtmlEntities(value: string): string;
export function diagnoseProject(options?: DoctorOptions): DoctorReport;
export function escapeHtmlAttribute(value: string | number | boolean): string;
export function extractClassStrings(source: string): string[];
export function extractFromFiles(inputs: string | string[], options?: ExtractOptions): ExtractResult;
export function extractFromSource(source: string, options?: ExtractOptions): ExtractResult;
export function findConfigFile(root?: string): string | null;
export function formatDoctorReport(report: DoctorReport): string;
export function injectCriticalCss(html: string, options?: CriticalStyleOptions): InjectCriticalCssResult;
export function initConfigFile(options?: { root?: string; configFile?: string; force?: boolean }): string;
export function loadConfigFile(configFile: string, options?: { root?: string }): JquanConfig;
export function main(argv?: string[]): Promise<CliResult | TemplateBuildResult | TemplateBundleResult | { ok: boolean; error?: string; configPath?: string }>;
export function minifyCss(css: string): string;
export function normalizeContentEntries(content?: ContentEntry): string[];
export function normalizeSafelistEntries(safelist?: SafelistEntry, expandSyntax?: ((classString: string) => string) | null): string[];
export function normalizeStyleAttributes(options?: CriticalStyleOptions): Record<string, string | number | boolean | null | undefined>;
export function readJsonFile(file: string, options?: { root?: string }): Record<string, unknown>;
export function renderStyleAttributes(attributes: Record<string, string | number | boolean | null | undefined>): string;
export function resolveGlobFiles(entries: ContentEntry, options?: { root?: string }): string[];
export function resolveConfig(options?: ExtractOptions): JquanConfig;
export function resolveConfigFile(options?: ExtractOptions): string | null;
export function renderCriticalCss(html: string, options?: ExtractOptions): ExtractResult;
export function renderCssFromClasses(classNames: Iterable<string> | string[], options?: ExtractOptions): ExtractResult;
export function createNodeTemplateRuntime(options?: TemplateBuildOptions): NodeTemplateRuntime;
export function renderTemplateFile(entry: string, options?: TemplateBuildOptions): Promise<{ html: string; entry: string; runtime: NodeTemplateRuntime }>;
export function resolveTemplateEntries(inputs: string | string[], options?: { root?: string }): string[];
export function buildTemplatePages(inputs: string | string[], options: TemplateBuildOptions & { output: string }): Promise<TemplateBuildResult>;
export function createTemplateBundle(inputs: string | string[], options?: TemplateBundleOptions): TemplateBundleResult;
export function writeTemplateBundle(inputs: string | string[], options: TemplateBundleOptions & { output: string }): TemplateBundleResult & { output: string };
export function writeTemplateBundleReport(result: TemplateBundleResult, reportFile: string, root?: string): string | null;
export * as ssr from './ssr/jquan-ssr';
export function splitTokens(value: string, expandSyntax?: ((classString: string) => string) | null): string[];
export function walkInput(target: string, files?: string[]): string[];

export function vitePlugin(options?: VitePluginOptions): unknown;
export const jquanUIVitePlugin: typeof vitePlugin;
export function postcssPlugin(options?: PostCSSPluginOptions): unknown;
export const jquanUIPostCSSPlugin: typeof postcssPlugin;

export namespace tokens {
  export function exportTokens(config: JquanConfig): TokenObject;
  export function importTokens(tokens: TokenObject): JquanConfig;
  export function main(argv?: string[]): { ok: boolean; output?: unknown; error?: string };
}

export namespace migrate {
  export type MigrationKind = 'semantic' | 'arbitrary' | 'manual';
  export interface MigrationOptions {
    root?: string;
    source?: string;
    config?: JquanConfig;
    includeArbitrary?: boolean;
    configSource?: string | null;
  }
  export interface MigrationDeclaration {
    property: string;
    value: string;
    important: boolean;
    kind: MigrationKind;
    className?: string;
    reason?: string;
    before?: string;
    after?: string | null;
  }
  export interface MigrationReport {
    version: string;
    source?: string | null;
    generatedAt?: string;
    totals: { files?: number; rules: number; declarations: number; semantic: number; arbitrary: number; manual: number; important: number };
    coverage: { semantic: number; expressible: number };
    configSource?: string | null;
    configFormat?: string;
    configWarnings?: string[];
    unsupportedTailwindTokens?: string[];
    thresholds?: { minSemantic: number | null; minExpressible: number | null; maxManual: number | null; maxOrder: number | null; maxDarkMissing?: number | null; manualRatio: number; orderCount: number; passed: boolean; failures: string[] };
    classOrder?: ClassOrderReport;
    migrationSuggestions?: Array<{ source?: string | null; selector: string; line: number; before?: string; after?: string | null; kind: MigrationKind; reason?: string | null }>;
    findings?: Array<{ selector: string; targetClass: string | null; contexts: string[]; line: number; declarations: MigrationDeclaration[] }>;
    files?: MigrationReport[];
    darkAudit?: DarkAuditReport;
  }
  export interface DarkAuditCandidate {
    token: string;
    kind: 'hardcoded-color' | 'shadow' | 'semantic-role';
    property: string;
    role: string;
    reason: string;
    hasDarkVariant: boolean;
    missingDarkVariant: boolean;
    source?: string | null;
    classString?: string;
    line?: number | null;
  }
  export interface DarkAuditFileReport {
    version: string;
    source?: string | null;
    summary: { classStrings: number; candidates: number; hardcodedColors: number; shadows: number; semanticRoles: number; missingDarkVariants: number };
    candidates: DarkAuditCandidate[];
    findings: Array<{ source?: string | null; classString: string; line: number | null; candidates: DarkAuditCandidate[] }>;
  }
  export interface DarkAuditReport {
    version: string;
    generatedAt?: string;
    summary: { classStrings: number; candidates: number; hardcodedColors: number; shadows: number; semanticRoles: number; missingDarkVariants: number };
    files: DarkAuditFileReport[];
    candidates: DarkAuditCandidate[];
  }
  export interface ClassOrderAudit { original: string; sorted: string; changed: true; tokens: string[]; line: number | null; }
  export interface ClassOrderFileReport { source: string; audits: ClassOrderAudit[]; }
  export interface ClassOrderReport { files: ClassOrderFileReport[]; total: number; }
  export const VERSION: string;
  export function auditCss(source: string, options?: MigrationOptions): MigrationReport;
  export function auditCssFiles(inputs: string | string[], options?: MigrationOptions): MigrationReport;
  export function auditClassFiles(inputs: string | string[], options?: { root?: string }): ClassOrderReport;
  export interface DarkAuditOptions { root?: string; source?: string | null; config?: JquanConfig; }
  export function auditDarkSource(source: string, options?: DarkAuditOptions): DarkAuditFileReport;
  export function auditDarkFiles(inputs: string | string[], options?: DarkAuditOptions): DarkAuditReport;
  export function collectCssFiles(inputs: string | string[], root?: string): string[];
  export function collectSourceFiles(inputs: string | string[], root?: string): string[];
  export function normalizeMigrationConfig(config?: Record<string, unknown>): { config: Record<string, unknown>; format: string; warnings: string[]; unsupportedTailwindTokens: string[] };
  export function parseCss(source: string): Array<{ selector: string; declarations: Array<{ property: string; value: string; important: boolean }>; contexts: string[]; line: number }>;
  export function formatMigrationReport(report: MigrationReport): string;
  export function sortClassTokens(tokens: string[]): string[];
  export function main(argv?: string[]): { ok: boolean; help?: boolean; thresholdFailed?: boolean; report?: MigrationReport };
}
