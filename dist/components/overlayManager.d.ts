export interface OverlayOptions {
  /** Connected element in the current document; the caller controls visibility. */
  element: HTMLElement;
  panel?: HTMLElement;
  /** Logical owner of a separately mounted panel; detachment releases the layer. */
  ownerElement?: HTMLElement;
  initialFocus?: HTMLElement | string | null;
  /** Suppress initial focus without disabling the subsequent focus trap. */
  autoFocus?: boolean;
  /** Extra click-inside regions, e.g. an anchored overlay's trigger. */
  outsideElements?: HTMLElement[];
  returnFocus?: HTMLElement | false | null;
  trapFocus?: boolean;
  lockScroll?: boolean;
  closeOnEscape?: boolean;
  closeOnOutside?: boolean;
  /** Minimum z-index; higher stack entries remain above lower entries. */
  zIndex?: number;
  /** Own the async close request; call handle.close() when actually releasing. */
  onRequestClose?: (reason: string, handle: OverlayHandle) => boolean | Promise<boolean>;
  onClose?: (reason: string, handle: OverlayHandle) => void;
}

export interface OverlayState {
  id: string;
  element: HTMLElement;
  panel: HTMLElement;
  ownerElement: HTMLElement | null;
  isTop: boolean;
  closed: boolean;
  lockScroll: boolean;
  trapFocus: boolean;
}

export interface OverlayHandle {
  readonly id: string;
  close(reason?: string): boolean;
  requestClose(reason?: string): Promise<boolean>;
  update(options: OverlayUpdateOptions): OverlayHandle | null;
  focus(): boolean;
  destroy(): boolean;
  isTop(): boolean;
  state(): OverlayState;
}

export type OverlayUpdateOptions = Pick<OverlayOptions, 'trapFocus' | 'lockScroll' | 'closeOnEscape' | 'closeOnOutside' | 'initialFocus' | 'onRequestClose' | 'zIndex' | 'autoFocus' | 'outsideElements' | 'returnFocus'>;

export interface OverlayManagerApi {
  open(options: OverlayOptions): OverlayHandle;
  top(): OverlayHandle | null;
  stack(): OverlayState[];
  /** Release the current stack. The service can be reused afterward. */
  destroy(): number;
}
