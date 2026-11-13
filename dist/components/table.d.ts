import '../browser-globals';

export interface TableState {
  sort: { key: string; order: '' | 'asc' | 'desc' };
  filters: Record<string, string>;
  pagination: { page: number; pageSize: number } | null;
  selection: string[];
  hiddenColumns: string[];
  loading: boolean;
  error: Error | null;
  destroyed: boolean;
  /** Monotonic sequence; also increments when a request is invalidated. */
  requestId: number;
}

export interface TableRemotePayload {
  page: number;
  pageSize: number;
  sort: TableState['sort'];
  filters: TableState['filters'];
  reason: string;
  requestId: number;
  /** null in environments without AbortController. */
  signal: AbortSignal | null;
}

/** Existing renderer context; selection and hiddenColumns are Sets. */
export interface TableRenderState {
  sort: TableState['sort'];
  filters: TableState['filters'];
  pagination: TableState['pagination'];
  selection: Set<string>;
  hiddenColumns: Set<string>;
  remoteTotal: number;
  error: Error | null;
}

export interface TableColumn<Row extends object = Record<string, unknown>> {
  /** Supports dotted paths as well as direct row keys. */
  key?: Extract<keyof Row, string> | (string & {});
  title?: string;
  width?: number | string | null;
  sortable?: boolean;
  filterable?: boolean;
  filter?: (query: string, row: Row, value: unknown) => boolean;
  hidden?: boolean;
  permission?: string | string[] | null;
  permissionMode?: 'some' | 'every';
  emptyText?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: Row, state: TableRenderState) => unknown;
  actions?: TableRowAction[] | null;
  classes?: Record<string, string>;
}

export interface TableRowAction {
  key: string;
  label?: string;
  className?: string;
  permission?: string | string[];
  permissionMode?: 'some' | 'every';
}

export interface TableChangeEvent {
  sort: TableState['sort'];
  filters: TableState['filters'];
  pagination: ({ page: number; pageSize: number; total: number }) | null;
  selection: string[];
  visibleColumns: string[];
  reason: string;
}

export interface TableOptions<Row extends object = Record<string, unknown>> {
  columns?: TableColumn<Row>[];
  data?: Row[];
  rowKey?: string | ((row: Row) => string | number | null | undefined);
  rowActions?: TableRowAction[];
  striped?: boolean;
  hover?: boolean;
  bordered?: boolean;
  selectable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  loading?: boolean;
  emptyText?: string;
  loadingText?: string;
  errorText?: string;
  pagination?: { page?: number; pageSize?: number } | null;
  remote?: {
    enabled: boolean;
    load: (payload: TableRemotePayload, handle: TableHandle<Row>) => Row[] | { data: Row[]; total?: number } | null | Promise<Row[] | { data: Row[]; total?: number } | null>;
  } | null;
  toolbar?: { refresh?: boolean; columnToggle?: boolean; selectionInfo?: boolean };
  classes?: Record<string, string>;
  summary?: (context: { rows: Row[]; total: number; selection: string[]; sort: TableState['sort']; filters: TableState['filters'] }) => unknown;
  onChange?: (event: TableChangeEvent) => void;
  onError?: (error: Error, handle: TableHandle<Row>) => void;
  onRowClick?: (row: Row | undefined, rowId: string, handle: TableHandle<Row>) => void;
  onAction?: (event: { key: string; row: Row | undefined; rowId: string }) => void;
}

export interface TableHandle<Row extends object = Record<string, unknown>> {
  readonly id: string;
  state(): TableState;
  /** Rejects current remote errors; returns null after destruction. */
  reload(reason?: string): Promise<TableHandle<Row> | null>;
  update(patch?: Partial<TableOptions<Row>>, reason?: string): TableHandle<Row> | null;
  setLoading(loading?: boolean): TableHandle<Row> | null;
  setFilter(key: string, value: string): TableHandle<Row> | null;
  clearSelection(): TableHandle<Row> | null;
  selectedRows(): Row[];
  /** true on the first active destruction; false on subsequent calls. */
  destroy(): boolean;
}

export interface TableApi {
  /** null when destroyed/replaced before asynchronous initialization finishes. */
  mount<Row extends object = Record<string, unknown>>(target: string | HTMLElement, options?: TableOptions<Row>): Promise<TableHandle<Row> | null>;
  get<Row extends object = Record<string, unknown>>(target: string | HTMLElement): TableHandle<Row> | null;
  /** String targets are instance IDs (without '#'). */
  update<Row extends object = Record<string, unknown>>(target: string | { id: string }, patch?: Partial<TableOptions<Row>>, reason?: string): TableHandle<Row> | null;
  destroy(target: string | HTMLElement): boolean;
}
