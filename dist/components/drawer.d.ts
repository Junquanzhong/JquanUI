import type { ModalHandle, ModalOptions, ModalPatch, ModalState } from './modal';

export interface DrawerOptions extends Omit<ModalOptions, 'surface' | 'onOpen' | 'onClose' | 'onDestroy'> {
  id?: string;
  target?: string | HTMLElement;
  onOpen?: ((handle: DrawerHandle) => void) | null;
  onClose?: ((handle: DrawerHandle, reason: string) => void) | null;
  onDestroy?: ((handle: DrawerHandle, reason: string) => void) | null;
}
export interface DrawerHandle extends Omit<ModalHandle, 'update' | 'patch'> {
  state(): ModalState;
  update(options: DrawerOptions): DrawerHandle | null;
  patch(options: ModalPatch & Pick<DrawerOptions, 'target'>): DrawerHandle | null;
}
export type DrawerTarget = string | HTMLElement | DrawerHandle;
export interface DrawerApi {
  open(options?: DrawerOptions): DrawerHandle | null;
  close(target: DrawerTarget): Promise<boolean> | false;
  update(target: DrawerTarget, options: DrawerOptions): DrawerHandle | null;
  patch(target: DrawerTarget, options: ModalPatch & Pick<DrawerOptions, 'target'>): DrawerHandle | null;
  destroy(target: DrawerTarget): boolean;
  closeAll(): true;
}
