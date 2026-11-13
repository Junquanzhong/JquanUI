import type { CriticalStyleOptions, InjectCriticalCssResult } from '../index';

export interface FrameworkRenderedOutput {
  html: string;
  head?: string;
  css?: string | { code?: string };
  [key: string]: unknown;
}

export type RenderedOutput = string | FrameworkRenderedOutput;

export interface SSRRenderOptions {
  critical?: CriticalStyleOptions;
  document?: boolean | ((rendered: NormalizedRenderedOutput, options: SSRRenderOptions) => string);
  lang?: string;
}

export interface SSRAdapterOptions<TRenderInput = unknown, TContext = unknown> {
  name?: string;
  render?: (input: TRenderInput, context?: TContext) => RenderedOutput | Promise<RenderedOutput>;
  document?: (rendered: NormalizedRenderedOutput, options: SSRRenderOptions) => string;
  critical?: CriticalStyleOptions;
}

export interface NormalizedRenderedOutput {
  html: string;
  head: string;
  css: string;
  output: RenderedOutput;
}

export interface SSRPageResult extends InjectCriticalCssResult {
  framework: string;
  rendered: RenderedOutput;
  frameworkHead: string;
  frameworkCss: string;
}

export interface SSRAdapter<TRenderInput = unknown, TContext = unknown> {
  readonly name: string;
  inject(rendered: RenderedOutput, options?: SSRRenderOptions): SSRPageResult;
  renderPage(input: TRenderInput, context?: TContext, options?: SSRRenderOptions): SSRPageResult | Promise<SSRPageResult>;
  createDocument(rendered: RenderedOutput, options?: { lang?: string }): string;
}

export function normalizeRenderedOutput(value: RenderedOutput): NormalizedRenderedOutput;
export function createHtmlDocument(rendered: RenderedOutput, options?: { lang?: string }): string;
export function createSSRAdapter<TRenderInput = unknown, TContext = unknown>(options?: SSRAdapterOptions<TRenderInput, TContext>): SSRAdapter<TRenderInput, TContext>;
export function createReactSSRAdapter<TRenderInput = unknown, TContext = unknown>(renderer: { renderToString(input: TRenderInput, context?: TContext): string } | ((input: TRenderInput, context?: TContext) => string), options?: Omit<SSRAdapterOptions<TRenderInput, TContext>, 'render'>): SSRAdapter<TRenderInput, TContext>;
export function createVueSSRAdapter<TRenderInput = unknown, TContext = unknown>(renderer: { renderToString(input: TRenderInput, context?: TContext): string | Promise<string> } | ((input: TRenderInput, context?: TContext) => string | Promise<string>), options?: Omit<SSRAdapterOptions<TRenderInput, TContext>, 'render'>): SSRAdapter<TRenderInput, TContext>;
export function createSvelteSSRAdapter<TComponent = unknown, TProps = Record<string, unknown>>(renderer: { render(component: TComponent, props?: TProps): FrameworkRenderedOutput } | ((component: TComponent, props?: TProps) => FrameworkRenderedOutput), options?: Omit<SSRAdapterOptions<TComponent, TProps>, 'render'>): SSRAdapter<TComponent, TProps>;
export function createNextSSRAdapter(options?: Omit<SSRAdapterOptions, 'render'>): SSRAdapter;
export function createNuxtSSRAdapter(options?: Omit<SSRAdapterOptions, 'render'>): SSRAdapter;
