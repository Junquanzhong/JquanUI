import type { JquanRuntimeApi } from './index';
import type { SelectApi, SelectUpdateDetail } from './components/select';
import type { ModalApi } from './components/modal';
import type { DrawerApi } from './components/drawer';
import type { PopoverApi } from './components/popover';
import type { OverlayManagerApi } from './components/overlayManager';
import type { CarouselApi, CarouselChangeDetail, CarouselPlayDetail, CarouselPauseDetail, CarouselUpdateDetail } from './components/carousel';
import type { TabsApi, TabsChangeDetail } from './components/tabs';
import type { ReviewModeApi } from './components/reviewMode';
export type { ReviewApplyOptions, ReviewApplyResult, ReviewApplyIssue, ReviewApplyIssueCode } from './components/reviewMode';
export type { ReviewModeApi, ReviewModeOptions, ReviewModeSelection, ReviewModeState, ReviewUtilityField, ReviewAttribute, ReviewPlanFormat, ReviewChange, ReviewPlan, ReviewUtilityDescriptor, ReviewNavigationDirection, ReviewCarouselOptions, ReviewTabsOptions, ReviewSelectOptions, ReviewPopoverOptions, ReviewComponentOption } from './components/reviewMode';
export type { SelectApi, SelectHandle, SelectOptions, SelectRemoteContext, SelectState, SelectUpdateDetail } from './components/select';
export type { ModalApi, ModalHandle, ModalState } from './components/modal';
export type { DrawerApi, DrawerHandle, DrawerOptions } from './components/drawer';
export type { PopoverApi, PopoverHandle, PopoverOptions } from './components/popover';
export type { ComponentImportOptions } from './index';
export type { CarouselApi, CarouselHandle, CarouselOptions, CarouselState, CarouselTarget, CarouselChangeDetail, CarouselPlayDetail, CarouselPauseDetail, CarouselUpdateDetail } from './components/carousel';
export type { TabsApi, TabsHandle, TabsOptions, TabsClassOptions, TabsState, TabsTarget, TabsGoToOptions, TabsChangeDetail } from './components/tabs';

export interface FaviconSource {
  href?: string;
  svg?: string;
  canvas?: HTMLCanvasElement;
}

export interface FaviconSetOptions { type?: string; }
export interface FaviconBadgeOptions {
  base?: string | FaviconSource;
  color?: string;
  textColor?: string;
  background?: string;
}
export interface FaviconStatusOptions {
  color?: string;
  background?: string;
  label?: string;
  strokeWidth?: number;
  animate?: boolean;
  interval?: number;
}
export interface FaviconWatchOptions extends FaviconSetOptions {
  light?: string | FaviconSource;
  dark?: string | FaviconSource;
}
export interface FaviconInstance {
  readonly id: string;
  set(source: string | FaviconSource, options?: FaviconSetOptions): FaviconInstance;
  badge(value: string | number | boolean | null, options?: FaviconBadgeOptions): FaviconInstance;
  status(state: 'idle' | 'loading' | 'success' | 'error' | 'warning' | 'info', options?: FaviconStatusOptions): FaviconInstance;
  clear(): FaviconInstance;
  restore(): FaviconInstance;
  watch(options: FaviconWatchOptions): () => void;
  state(): { id: string; destroyed: boolean; baseHref: string | null; currentHref: string | null; watching: boolean; managed: boolean };
  destroy(): void;
}
export interface FaviconApi extends FaviconInstance {
  create(options?: FaviconStatusOptions): FaviconInstance;
}

export interface IframeBridgeContext {
  origin: string;
  role: 'parent' | 'child';
  name: string;
  id: string;
}

export interface IframeBridgeRequestOptions { timeout?: number; }
export interface IframeBridgeOptions {
  iframe?: string | HTMLIFrameElement;
  parentWindow?: Window;
  targetOrigin?: string;
  allowedOrigins?: string[];
  allowAnyOrigin?: boolean;
  namespace?: string;
  timeout?: number;
  handshakeInterval?: number;
  channel?: boolean;
  onError?: (error: unknown) => void;
}
export interface IframeBridge {
  readonly role: 'parent' | 'child';
  readonly namespace: string;
  readonly connected: boolean;
  readonly readyState: boolean;
  ready(): Promise<{ role: 'parent' | 'child'; peerOrigin: string; channel: boolean }>;
  send(name: string, payload?: unknown): boolean;
  request<T = unknown>(name: string, payload?: unknown, options?: IframeBridgeRequestOptions): Promise<T>;
  on(name: string, handler: (payload: unknown, context: IframeBridgeContext) => unknown): () => void;
  off(name: string, handler: Function): IframeBridge;
  state(): { role: 'parent' | 'child'; namespace: string; connected: boolean; ready: boolean; peerOrigin: string; channel: boolean; pending: number };
  destroy(): void;
}
export interface IframeBridgeApi {
  createParent(options: IframeBridgeOptions & { iframe: string | HTMLIFrameElement }): IframeBridge;
  createChild(options?: Omit<IframeBridgeOptions, 'iframe'>): IframeBridge;
}

export interface OverlayPresetValues {
  classes: Record<string, string>;
  tones: Record<'info' | 'success' | 'warning' | 'error' | 'loading', string>;
  icons: Record<'info' | 'success' | 'warning' | 'error' | 'loading', string>;
}
export interface OverlayPreset extends OverlayPresetValues {
  mode: 'legacy' | 'semantic';
  presets: { legacy: OverlayPresetValues; semantic: OverlayPresetValues };
}

declare const JquanUIComponents: {
  selectApi: SelectApi;
  modalApi: ModalApi;
  drawerApi: DrawerApi;
  popoverApi: PopoverApi;
  overlayManagerApi: OverlayManagerApi;
  carouselApi: CarouselApi;
  tabsApi: TabsApi;
  reviewModeApi: ReviewModeApi;
  reviewMode: { name: 'jquanui-review-mode'; version: string; requires: string[]; install(): void; teardown(): void };
  overlayPreset: OverlayPreset;
  faviconApi: FaviconApi;
  favicon: { name: 'jquanui-favicon'; version: string; requires: string[]; install(): void; teardown(): void };
  iframeBridgeApi: IframeBridgeApi;
  iframeBridge: { name: 'jquanui-iframe-bridge'; version: string; requires: string[]; install(): void; teardown(): void };
  [key: string]: unknown;
};

declare global {
  const JquanUI: JquanRuntimeApi;
  interface HTMLElementEventMap {
    'jquan:carousel:change': CustomEvent<CarouselChangeDetail>;
    'jquan:carousel:play': CustomEvent<CarouselPlayDetail>;
    'jquan:carousel:pause': CustomEvent<CarouselPauseDetail>;
    'jquan:carousel:update': CustomEvent<CarouselUpdateDetail>;
    'jquan:tabs:change': CustomEvent<TabsChangeDetail>;
    'jquan:select:update': CustomEvent<SelectUpdateDetail>;
  }
  interface Window {
    JquanUI?: JquanRuntimeApi;
    JquanUIComponents?: typeof JquanUIComponents;
  }
}

export {};
