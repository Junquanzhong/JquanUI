export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right';
export interface PopoverClasses {
  root?: string;
  panel?: string;
  panelClosed?: string;
  panelOpen?: string;
  arrow?: string;
  close?: string;
  focus?: string;
}
export interface PopoverOptions {
  classes?: PopoverClasses;
  /** Click mode focuses panel contents by default; hover never moves initial focus. */
  autoFocus?: boolean;
  /** Default true for click mode, false for hover mode. */
  trapFocus?: boolean;
  closeOnEscape?: boolean;
  closeOnOutside?: boolean;
  /** Finite minimum; subsequent shared layers are always placed above it. */
  zIndex?: number;
  onClose?: (reason: string) => void;
}
export interface PopoverHandle {
  readonly id: string;
  open(): boolean;
  close(): boolean;
  toggle(): boolean;
  destroy(): boolean;
  /** Existing boolean state contract; null after destruction/replacement. */
  state(): boolean | null;
  element(): HTMLElement | null;
}
export type PopoverTarget = HTMLElement | string | PopoverHandle;
export interface PopoverEventDetail { placement: PopoverPlacement; reason?: string; }
export interface PopoverApi {
  /** Read-only existing instance lookup using normal Popover target resolution; null for missing/destroyed/invalid targets. Does not mount. */
  getHandle(target: PopoverTarget): PopoverHandle | null;
  mount(target: HTMLElement | string, options?: PopoverOptions): PopoverHandle | null;
  open(target: PopoverTarget): boolean;
  close(target: PopoverTarget): boolean;
  toggle(target: PopoverTarget): boolean;
  closeAll(): void;
  getState(target: PopoverTarget): boolean;
  destroy(target: PopoverTarget): boolean;
}
