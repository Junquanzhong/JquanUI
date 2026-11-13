export type CarouselTarget = string | HTMLElement | CarouselHandle;

export interface CarouselOptions {
  direction?: 'horizontal' | 'vertical';
  autoplay?: boolean;
  interval?: number;
  speed?: number;
  easing?: string;
  pauseOnHover?: boolean;
  pauseOnVisibilityHidden?: boolean;
  arrows?: boolean;
  indicators?: boolean;
  keyboard?: boolean;
  drag?: boolean;
  infinite?: boolean;
  visibleCount?: number;
  slidesPerScroll?: number;
  startIndex?: number;
  gap?: number;
  dragThreshold?: number;
  adaptiveHeight?: boolean;
  progress?: boolean;
  thumbnails?: boolean;
  thumbnailsTarget?: string | HTMLElement | null;
  indicatorsTarget?: string | HTMLElement | null;
  syncTarget?: CarouselTarget | null;
  onChange?: ((index: number, handle: CarouselHandle) => void) | null;
}

export interface CarouselState {
  currentIndex: number;
  currentPage: number;
  pageCount: number;
  total: number;
  isPlaying: boolean;
  isDragging: boolean;
  visibleCount: number;
  interval: number;
  autoplay: boolean;
  indicators: boolean;
  progress: boolean;
  thumbnails: boolean;
  syncTarget: CarouselTarget | null;
  progressPercent: number;
}

/** Stable for one mounted instance; state/element return null after destruction. */
export interface CarouselHandle {
  readonly id: string;
  next(): boolean;
  prev(): boolean;
  goTo(index: number, animate?: boolean): boolean;
  goToPage(page: number, animate?: boolean): boolean;
  play(): boolean;
  pause(): boolean;
  setInterval(interval: number): boolean;
  setAutoplay(autoplay: boolean): boolean;
  setIndicators(indicators: boolean): boolean;
  setProgress(progress: boolean): boolean;
  update(next?: Partial<CarouselOptions>): CarouselHandle | null;
  destroy(): boolean;
  state(): CarouselState | null;
  element(): HTMLElement | null;
}

export interface CarouselChangeDetail {
  index: number;
  total: number;
  state: CarouselState;
  instance: CarouselHandle;
}
export interface CarouselPlayDetail extends CarouselChangeDetail { interval: number; }
export interface CarouselPauseDetail extends CarouselChangeDetail { remainingMs: number; }
export interface CarouselUpdateDetail extends CarouselChangeDetail { interval: number; autoplay: boolean; indicators?: boolean; progress?: boolean; }

export interface CarouselApi {
  /** Read an existing instance without mounting it. A descendant resolves its containing carousel; null when absent. */
  getHandle(target: CarouselTarget): CarouselHandle | null;
  /** Reuses an existing root's handle; apply later options with update(). */
  mount(target: HTMLElement | string, options?: CarouselOptions): CarouselHandle | null;
  next(target: CarouselTarget): boolean;
  prev(target: CarouselTarget): boolean;
  goTo(target: CarouselTarget, index: number, animate?: boolean): boolean;
  goToPage(target: CarouselTarget, page: number, animate?: boolean): boolean;
  play(target: CarouselTarget): boolean;
  pause(target: CarouselTarget): boolean;
  setInterval(target: CarouselTarget, interval: number): boolean;
  setAutoplay(target: CarouselTarget, autoplay: boolean): boolean;
  setIndicators(target: CarouselTarget, indicators: boolean): boolean;
  setProgress(target: CarouselTarget, progress: boolean): boolean;
  update(target: CarouselTarget, next?: Partial<CarouselOptions>): CarouselHandle | null;
  destroy(target: CarouselTarget): boolean;
  getState(target: CarouselTarget): CarouselState | null;
}

