export interface ModalState {
  id: string;
  destroyed: boolean;
  isClosing: boolean;
  busy: boolean;
  closePending: boolean;
  isTop: boolean;
}
export interface ModalContentContext {
  instance: ModalHandle;
  root: HTMLElement;
  panel: HTMLElement;
  body?: HTMLElement;
  footer?: HTMLElement;
  form?: HTMLFormElement;
}
export type ModalContent = string | Node | number | boolean | null | undefined | ((context: ModalContentContext) => ModalContent);
export interface ModalCloseContext extends ModalContentContext { reason: string; }
export interface ModalAction {
  text?: string;
  label?: string;
  variant?: string;
  className?: string;
  disabled?: boolean;
  submit?: boolean;
  keepEnabled?: boolean;
  loadingText?: string;
  close?: boolean;
  closeReason?: string;
  onClick?: (event: MouseEvent, handle: ModalHandle) => unknown | Promise<unknown>;
}
export interface ModalFormField {
  name?: string;
  type?: string;
  id?: string;
  label?: string;
  text?: string;
  value?: unknown;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  multiple?: boolean;
  initialFocus?: boolean;
  matchField?: string;
  rules?: unknown[];
  help?: string;
  options?: Array<string | number | { value: unknown; label?: string; text?: string; disabled?: boolean }>;
}
export interface ModalFormOptions {
  schema?: ModalFormField[];
  values?: Record<string, unknown>;
  validator?: false | Record<string, unknown>;
  submitText?: string;
  cancelText?: string;
  showCancel?: boolean;
  closeOnSubmit?: boolean;
  noValidate?: boolean;
  submitVariant?: string;
  attributes?: Record<string, string | number | boolean | null>;
}
export interface ModalImageOptions {
  src?: string | string[];
  startIndex?: number;
  loop?: boolean;
  zoom?: boolean;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
}
export interface ModalOptions {
  type?: 'dialog' | 'form' | 'image' | 'drawer';
  title?: string;
  description?: string;
  content?: ModalContent;
  footer?: ModalContent;
  actions?: ModalAction[];
  form?: ModalFormOptions | null;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  lockScroll?: boolean;
  trapFocus?: boolean;
  animation?: 'zoom' | 'fade' | 'slide';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  surface?: 'modal' | 'drawer';
  placement?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
  backdropClassName?: string;
  zIndex?: number;
  beforeClose?: ((context: ModalCloseContext) => boolean | void | Promise<boolean | void>) | null;
  imageOptions?: ModalImageOptions;
  onOpen?: ((handle: ModalHandle) => void) | null;
  onClose?: ((handle: ModalHandle, reason: string) => void) | null;
  onDestroy?: ((handle: ModalHandle, reason: string) => void) | null;
  onUpdate?: ((handle: ModalHandle) => void) | null;
  classes?: Record<string, string>;
  onSubmit?: ((context: { event: Event; form: HTMLFormElement; data: Record<string, unknown>; values: Record<string, unknown>; instance: ModalHandle }) => unknown | Promise<unknown>) | null;
}
export interface ModalHandle {
  readonly id: string;
  state(): ModalState;
  /** Resolves when closing begins, before the exit animation ends. */
  close(reason?: string): Promise<boolean>;
  destroy(): boolean;
  update(options: ModalOptions): ModalHandle | null;
  patch(options: ModalPatch): ModalHandle | null;
  setBusy(busy: boolean, busyText?: string): boolean;
  getFormData(): Record<string, FormDataEntryValue | FormDataEntryValue[]> | null;
  element(): HTMLElement | null;
}
export type ModalPatch = Pick<ModalOptions, 'title' | 'description' | 'content' | 'footer' | 'actions' | 'form' | 'imageOptions' | 'className' | 'backdropClassName' | 'surface' | 'placement' | 'size'>;
export type ModalTarget = string | HTMLElement;
export interface ModalMessageOptions extends ModalOptions {
  okText?: string;
  okVariant?: string;
  cancelText?: string;
  cancelVariant?: string;
  confirmText?: string;
  confirmVariant?: string;
}
export interface ModalPromiseStates {
  loadingContent?: ModalContent;
  loading?: ModalOptions;
  success?: ModalOptions | false;
  error?: ModalOptions | false;
}
export interface ModalApi {
  open(options?: ModalOptions | string): ModalHandle;
  drawer(options?: ModalOptions): ModalHandle;
  alert(message: string, options?: ModalMessageOptions): ModalHandle;
  confirm(message: string, options?: ModalMessageOptions): Promise<boolean>;
  promise<T>(promiseLike: T | PromiseLike<T>, states?: ModalPromiseStates): Promise<T>;
  close(target: ModalTarget): Promise<boolean> | false;
  destroy(target: ModalTarget): boolean;
  update(target: ModalTarget, options: ModalOptions): ModalHandle | null;
  patch(target: ModalTarget, options: ModalPatch): ModalHandle | null;
  closeAll(): boolean;
  getOpenCount(): number;
}
