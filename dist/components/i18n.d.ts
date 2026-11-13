export type I18nParams = Record<string, unknown>;
export type I18nMessage = string | number | null | I18nMessages | ((params: I18nParams, context: { locale: string; key: string; i18n: I18nEngine }) => string);
export interface I18nMessages { [key: string]: I18nMessage; }
export interface I18nRegistrationOptions {
  namespace?: string;
  replace?: boolean;
  /** true: locale -> namespace -> messages; false: preserve all paths in the default namespace. */
  nested?: boolean;
}
export interface I18nTranslateOptions {
  locale?: string;
  fallbackLocale?: string;
  namespace?: string;
  namespaces?: string[];
  escapeInterpolation?: boolean;
  params?: I18nParams;
}
export interface I18nSetLocaleOptions { previousLocale?: string; reason?: string; silent?: boolean; }
export interface I18nConfig {
  locale?: string;
  fallbackLocale?: string;
  defaultNamespace?: string;
  fallbackNamespaces?: string | string[];
  storageKey?: string;
  storageDriver?: string;
  persist?: boolean;
  syncDocument?: boolean;
  syncUrl?: boolean;
  urlParamKey?: string;
  localesPath?: string;
  autoLoad?: boolean;
  autoObserve?: boolean;
  debug?: boolean;
  missingKey?: 'key' | 'empty' | 'bracket' | ((key: string, params: I18nParams, options: I18nTranslateOptions) => string);
  escapeInterpolation?: boolean;
  detectOrder?: Array<'url' | 'storage' | 'html' | 'navigator' | 'default'>;
  availableLocales?: string[];
  loader?: (locale: string, options: { namespace?: string }) => I18nMessages | Promise<I18nMessages>;
  observeDebounce?: number;
}
export interface I18nState { locale: string; fallbackLocale: string; defaultNamespace: string; availableLocales: string[]; }
export interface I18nChange { locale: string; previousLocale: string | null; reason: string; }
export interface I18nFormatOptions extends Intl.NumberFormatOptions, Intl.DateTimeFormatOptions {
  type?: 'string' | 'number' | 'currency' | 'date' | 'relativeTime' | 'list';
  locale?: string;
  unit?: string;
}
export interface I18nScope {
  namespace: string;
  t(key: string, params?: I18nParams, options?: I18nTranslateOptions): string;
  has(key: string, options?: I18nTranslateOptions): boolean;
}
export interface I18nEngine {
  getState(): I18nState;
  getLocale(): string;
  config(options?: I18nConfig): I18nState;
  registerLocale(locale: string, resources: I18nMessages, options?: I18nRegistrationOptions): I18nEngine;
  registerMessages(payload: Record<string, I18nMessages>, options?: I18nRegistrationOptions): I18nEngine;
  t(key: string, params?: I18nParams, options?: I18nTranslateOptions): string;
  setLocale(locale: string, options?: I18nSetLocaleOptions): Promise<string>;
}
export interface I18nApi {
  config(options?: I18nConfig): I18nState;
  init(options?: I18nConfig): Promise<I18nEngine>;
  state(): I18nState;
  getLocale(): string;
  setLocale(locale: string, options?: I18nSetLocaleOptions): Promise<string>;
  registerLocale(locale: string, resources: I18nMessages, options?: I18nRegistrationOptions): I18nEngine;
  registerMessages(payload: Record<string, I18nMessages>, options?: I18nRegistrationOptions): I18nEngine;
  loadLocale(locale: string, options?: { namespace?: string }): Promise<Record<string, I18nMessages>>;
  has(key: string, options?: I18nTranslateOptions): boolean;
  t(key: string, params?: I18nParams, options?: I18nTranslateOptions): string;
  format(key: string, params?: I18nParams, options?: I18nTranslateOptions): string;
  tn(key: string, value: number, formatOptions?: I18nFormatOptions, translateOptions?: I18nTranslateOptions): string;
  td(key: string, value: Date | number | string, formatOptions?: I18nFormatOptions, translateOptions?: I18nTranslateOptions): string;
  tc(key: string, value: number, formatOptions?: I18nFormatOptions, translateOptions?: I18nTranslateOptions): string;
  formatValue(value: unknown, options?: I18nFormatOptions): string;
  scope(namespace: string, options?: I18nTranslateOptions): I18nScope;
  translate(root?: Document | Element): true;
  bindSwitchers(root?: Document | Element): true;
  observe(root?: Document | Element): true;
  disconnect(): true;
  on(event: string, handler: (event: I18nChange) => void): () => void;
  off(event: string, handler: (event: I18nChange) => void): void;
}
