export type TabsTarget = string | HTMLElement | TabsHandle;

export interface TabsClassOptions {
  root?: string; list?: string; tab?: string; tabActive?: string; tabInactive?: string;
  tabContent?: string; panel?: string; panelHidden?: string; track?: string; panelSlide?: string; focus?: string;
}
export interface TabsOptions {
  mode?: 'static' | 'fade' | 'slide';
  trigger?: 'click' | 'hover';
  defaultIndex?: number;
  keyboard?: boolean;
  swipeable?: boolean;
  swipeThreshold?: number;
  hashSync?: boolean;
  autoplay?: boolean;
  interval?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  duration?: number;
  classes?: TabsClassOptions;
  onChange?: ((index: number, panel: HTMLElement, handle: TabsHandle) => void) | null;
}
export interface TabsState {
  currentIndex: number;
  total: number;
  mode: 'static' | 'fade' | 'slide';
  isPlaying: boolean;
  interval: number;
  autoplay: boolean;
  loop: boolean;
}
export interface TabsGoToOptions {
  animate?: boolean;
  focus?: boolean;
  force?: boolean;
}
/** Stable for one mounted instance; state/element return null after destruction. */
export interface TabsHandle {
  readonly id: string;
  goTo(index: number, options?: TabsGoToOptions): boolean;
  next(): boolean;
  prev(): boolean;
  play(): boolean;
  pause(): boolean;
  setInterval(interval: number): boolean;
  setAutoplay(autoplay: boolean): boolean;
  /** Changes boundary wrapping without rebuilding panels, moving the active tab or restarting playback. */
  setLoop(loop: boolean): boolean;
  update(next?: Partial<TabsOptions>): TabsHandle | null;
  destroy(): boolean;
  state(): TabsState | null;
  element(): HTMLElement | null;
}
export interface TabsChangeDetail {
  index: number;
  panel: HTMLElement;
  instance: TabsHandle;
}
export interface TabsApi {
  /** Read an existing instance without mounting it. */
  getHandle(target: TabsTarget): TabsHandle | null;
  /** Reuses an existing root's handle; apply later options with update(). */
  mount(target: HTMLElement | string, options?: TabsOptions): TabsHandle | null;
  goTo(target: TabsTarget, index: number, options?: TabsGoToOptions): boolean;
  next(target: TabsTarget): boolean;
  prev(target: TabsTarget): boolean;
  play(target: TabsTarget): boolean;
  pause(target: TabsTarget): boolean;
  update(target: TabsTarget, next?: Partial<TabsOptions>): TabsHandle | null;
  destroy(target: TabsTarget): boolean;
  getState(target: TabsTarget): TabsState | null;
}
