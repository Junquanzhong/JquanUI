export interface ReviewModeOptions {
  /** Required opt-in. Omitted/false disables all entries. URL parameters alone do not enable the mode. */
  enabled?: boolean;
  /** Connected same-document light DOM HTML root. Defaults to document.body; invalid roots leave configuration unchanged. */
  root?: HTMLElement | string;
  /** Honor ?jqui-review=1 when enabled; defaults to true. */
  allowURL?: boolean;
}

export type ReviewNavigationDirection = 'parent' | 'first-child' | 'previous-sibling' | 'next-sibling';

export interface ReviewModeSelection {
  tag: string;
  label: string;
  /** Trimmed text summary, at most 240 characters; no HTML rewriting. */
  text: string;
  /** Direct text nodes with their childNodes indices. Editing these preserves nested elements. */
  textNodes: { index: number; value: string }[];
  target: { selector: string; stable: boolean };
  /** Current eligible relatives within the configured root. Detached snapshot; hidden HTML elements remain eligible. */
  navigation: Record<ReviewNavigationDirection, boolean>;
  classes: string[];
  attributes: { name: string; value: string }[];
  /** jq-* and data-jq-* markers on the selected node; not an options schema. */
  components: string[];
  computed: { display: string; fontSize: string; color: string; backgroundColor: string; padding: string; margin: string; width: string; height: string };
}

export interface ReviewModeState {
  enabled: boolean;
  active: boolean;
  picking: boolean;
  selection: ReviewModeSelection | null;
  changeCount: number;
  canUndo: boolean;
  canRedo: boolean;
}

export type ReviewUtilityField = 'font-size' | 'color' | 'background-color' | 'font-weight' | 'text-align' | 'border-radius'
  | 'line-height' | 'letter-spacing' | 'font-style' | 'text-transform' | 'font-family' | 'text-decoration-line' | 'white-space'
  | 'display' | 'flex-direction' | 'flex-wrap' | 'align-items' | 'justify-content' | 'grid-template-columns'
  | 'width' | 'height' | 'min-width' | 'max-width' | 'min-height' | 'max-height'
  | 'padding' | 'margin' | 'gap' | 'border-color' | 'border-width' | 'box-shadow' | 'opacity'
  | 'overflow' | 'object-fit' | 'aspect-ratio';
export interface ReviewUtilityDescriptor {
  field: ReviewUtilityField;
  label: string;
  group: 'typography' | 'layout' | 'sizing' | 'spacing' | 'appearance' | 'media';
  /** Semantic candidates validated by Core.resolve. Includes configured colors/spacing and up to 64 configured font-size/font-family/radius/shadow candidates per field, including fluid font sizes and the radius alias. Cross-field compounds (including truncate) are excluded. Detached snapshots. */
  options: { token: string; label: string }[];
}
export type ReviewAttribute = 'title' | 'aria-label' | 'aria-description' | 'alt' | 'href';
export type ReviewPlanFormat = 'text' | 'json';
export interface ReviewCarouselOptions { autoplay: boolean; interval: number; indicators: boolean; progress: boolean; }
export interface ReviewTabsOptions { autoplay: boolean; interval: number; loop: boolean; }
export interface ReviewSelectOptions { disabled: boolean; searchable: boolean; clearable: boolean; }
export interface ReviewPopoverOptions { open: boolean; }
export type ReviewComponentOption =
  | { component: 'carousel'; option: 'autoplay'; label: string; type: 'boolean'; value: boolean }
  | { component: 'carousel'; option: 'interval'; label: string; type: 'number'; value: number; min: 1200 }
  | { component: 'tabs'; option: 'autoplay' | 'loop'; label: string; type: 'boolean'; value: boolean }
  | { component: 'tabs'; option: 'interval'; label: string; type: 'number'; value: number; min: 1200 }
  | { component: 'select'; option: 'disabled' | 'searchable' | 'clearable'; label: string; type: 'boolean'; value: boolean }
  | { component: 'popover'; option: 'open'; label: string; type: 'boolean'; value: boolean };
export interface ReviewChange {
  target: { selector: string; stable: boolean };
  label: string;
  tag: string;
  /** utility:<CSS property>, attribute:<name>, or text:<childNodes index>. */
  field: `utility:${ReviewUtilityField}` | `attribute:${ReviewAttribute}` | `text:${number}` | `component:carousel.${keyof ReviewCarouselOptions}` | `component:tabs.${keyof ReviewTabsOptions}` | `component:select.${keyof ReviewSelectOptions}` | `component:popover.${keyof ReviewPopoverOptions}`;
  before: string | string[] | number | boolean | null;
  after: string | string[] | number | boolean | null;
  status: 'ready' | 'conflict' | 'detached';
}
export interface ReviewPlan {
  /** Version 2 when component option changes exist; otherwise the original version 1. */
  schemaVersion: 1 | 2;
  createdAt: string | null;
  page: string;
  changes: ReviewChange[];
}
export type ReviewApplyIssueCode = 'not-configured' | 'not-active' | 'busy' | 'session-not-empty' | 'invalid-plan' | 'page-mismatch' | 'unstable-target' | 'non-ready-status' | 'duplicate-field' | 'invalid-selector' | 'target-not-found' | 'target-ambiguous' | 'invalid-value' | 'schema-mismatch' | 'invalid-component' | 'invalid-field' | 'before-mismatch' | 'write-failed' | 'rollback-conflict';
export interface ReviewApplyIssue {
  index: number;
  code: ReviewApplyIssueCode;
  field: string | null;
  selector: string | null;
  expected: string | string[] | number | boolean | null;
  actual: string | string[] | number | boolean | null;
}
export interface ReviewApplyOptions { /** Defaults to true; set false only after reviewing a successful preflight. */ dryRun?: boolean; }
export interface ReviewApplyResult {
  ok: boolean;
  dryRun: boolean;
  applied: number;
  issues: ReviewApplyIssue[];
  changes: ReviewChange[];
}

/** Page review with transient preview edits and final-value export. One session per document. */
export interface ReviewModeApi {
  /** Restores uncontested preview fields and replaces the session. Invalid roots leave the current session unchanged. */
  configure(options?: ReviewModeOptions): boolean;
  open(): boolean;
  close(): boolean;
  toggle(): boolean;
  /** Select 1.5+ visible triggers/descendants resolve to their native source inside root; other nodes retain their identity. */
  select(target: HTMLElement | string): boolean;
  /** Select an eligible direct parent/first child or nearest eligible sibling and scroll into view. No edit/history entry. False at boundaries or while closed. */
  navigate(direction: ReviewNavigationDirection): boolean;
  state(): ReviewModeState;
  /** Direct text only. Omit index only for a single direct text node or an empty element. No HTML parsing. */
  setText(value: string, index?: number): boolean;
  /** Replaces base utility tokens in this field. Core validates semantic class names; variants remain independent. null removes the field. */
  setUtility(property: ReviewUtilityField, token: string | null): boolean;
  /** Six groups / 35 fields by default. Optional case-insensitive substring query (max 120 chars) filters fields/options. */
  utilities(query?: string): ReviewUtilityDescriptor[];
  /** Snapshot for the selected mounted root: Carousel 1.7+, Tabs 2.4+, native Select 1.4+, Popover 1.6+. Never loads or mounts business components. */
  componentOptions(): ReviewComponentOption[];
  /** Edit only the selected original instance, using public setters. Interval is finite and >=1200 ms; Carousel 1.8+ also supports indicators/progress without rebuilding content. */
  setComponentOption<K extends keyof ReviewCarouselOptions>(component: 'carousel', option: K, value: ReviewCarouselOptions[K]): boolean;
  /** Edit Tabs autoplay or interval through its existing stable handle and public setters. */
  setComponentOption<K extends keyof ReviewTabsOptions>(component: 'tabs', option: K, value: ReviewTabsOptions[K]): boolean;
  /** Edit Select disabled/searchable/clearable through its existing stable handle. */
  setComponentOption<K extends keyof ReviewSelectOptions>(component: 'select', option: K, value: ReviewSelectOptions[K]): boolean;
  /** Captures Popover 1.6+ getHandle() identity; edits open through open/close/getState(handle). Destroy/remount makes old records conflict. */
  setComponentOption<K extends keyof ReviewPopoverOptions>(component: 'popover', option: K, value: ReviewPopoverOptions[K]): boolean;
  /** Restore one tracked field by original node identity; undoable. False for detached/conflicting/no-op fields. */
  revert(target: HTMLElement | string, field: ReviewChange['field']): boolean;
  /** alt/href apply to suitable image/link elements. null removes the attribute. Event/id/key/class/style attributes stay read-only. */
  setAttribute(name: ReviewAttribute, value: string | null): boolean;
  /** Undo an applied review edit. Ctrl/Cmd+Z outside editing controls invokes the same conflict checks. */
  undo(): boolean;
  /** Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y outside editing controls. Native input undo is preserved. */
  redo(): boolean;
  /** Restore all tracked changes atomically; false if a field conflicts or its node was removed. */
  reset(): boolean;
  /** Detached snapshot; one final value per node/field; original values/no-op fields are omitted. */
  changes(): ReviewChange[];
  /** Human summary plus JSON by default; 'json' returns serialized ReviewPlan. No source-file write. */
  exportPlan(format?: ReviewPlanFormat): string;
  /** Uses the Copy component. False for empty plans or clipboard failure. Only the latest valid request updates UI; a new request clears manual fallback. Each Promise returns its own result. */
  copyPlan(format?: ReviewPlanFormat): Promise<boolean>;
  /** Stores the current final-value plan in localStorage under a 1–80 ASCII key (default "default"); false for empty/disabled, >1,048,576 code units or storage failure. Does not alter the preview. */
  saveDraft(key?: string): boolean;
  /** Reads a detached persisted plan; returns null for a missing, invalid, unavailable or malformed draft. */
  loadDraft(key?: string): ReviewPlan | null;
  /** Removes a persisted draft and reports whether it existed. */
  clearDraft(key?: string): boolean;
  /** Requires a clean configured session. Defaults to preflight; explicit dryRun:false requires open(). Applies through tracked editing/history. Interrupted writes restore still-owned fields and report external rollback conflicts. Never writes source files. */
  applyPlan(plan: ReviewPlan | string, options?: ReviewApplyOptions): ReviewApplyResult;
  /** Restores uncontested fields, preserves external updates, clears history and UI, disables entries. */
  destroy(): void;
}
