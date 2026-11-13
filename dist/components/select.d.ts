export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  keywords?: string[];
}

export interface SelectRemoteContext {
  /** Advisory cancellation; null when AbortController is unavailable. */
  signal: AbortSignal | null;
  /** Query generation. Invalidations may increase this without issuing a request. */
  requestId: number;
}

export interface SelectState {
  open: boolean;
  multiple: boolean;
  values: string[];
  search: string;
  filteredCount: number;
  requestId: number;
  loading: boolean;
  destroyed: false;
  disabled: boolean;
  searchable: boolean;
  clearable: boolean;
}

export interface SelectUpdateDetail {
  option: 'disabled' | 'searchable' | 'clearable';
  value: boolean;
  instance: SelectHandle;
}

export interface SelectOptions {
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  closeOnSelect?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsText?: string;
  helperText?: string;
  maxSelectionsText?: string;
  maxSelections?: number;
  disabled?: boolean;
  options?: Array<SelectOption | string | number>;
  searchDebounce?: number;
  /** Return options for this query; stale/aborted results are ignored. */
  remoteMethod?: (search: string, handle: SelectHandle, context: SelectRemoteContext) => SelectOption[] | Promise<SelectOption[]>;
  onChange?: (value: string | string[], handle: SelectHandle) => void;
  onOpen?: (handle: SelectHandle) => void;
  onClose?: (handle: SelectHandle) => void;
}

export interface SelectHandle {
  readonly id: string;
  open(): boolean;
  close(): boolean;
  toggle(): boolean;
  /** Starts immediately; async completion is observable through state(). */
  search(keyword: string): boolean;
  select(value: string): boolean;
  deselect(value: string): boolean;
  clear(): boolean;
  setValue(value: string | string[] | null, emit?: boolean): boolean;
  value(): string | string[] | null;
  values(): string[];
  /** Original native source. Old handles return null after destroy/remount. */
  element(): HTMLSelectElement | null;
  /** Existing visible trigger. Read-only access; null after destroy/remount. */
  control(): HTMLButtonElement | null;
  /** Boolean only. Disabling closes an open panel and synchronizes native disabled. */
  setDisabled(value: boolean): boolean;
  /** Toggles the search entry; preserves the query and programmatic search. */
  setSearchable(value: boolean): boolean;
  setClearable(value: boolean): boolean;
  state(): SelectState | null;
  update(patch?: Partial<SelectOptions>): SelectHandle | null;
  destroy(): boolean;
}

export interface SelectApi {
  /** Reuses the live handle for this native node. Old handles never address remounts. */
  mount(target: HTMLSelectElement | string, options?: SelectOptions): SelectHandle;
  get(target: HTMLSelectElement | string | SelectHandle): SelectHandle | null;
  destroy(target: HTMLSelectElement | string | SelectHandle): boolean;
}
