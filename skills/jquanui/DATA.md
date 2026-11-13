# JquanUI Data

## 定位

完整本地 CRM 组合示例见 `../../projects/lanse-crm/README.md`。它使用每业务集合的 IndexedDB 快照、`createCrudDataSource()` 写入和 Query 筛选/排序/分页，Table/Pagination 负责渲染，业务层校验关系和金额余额。每次操作等待 `flush()` 才展示成功，页面销毁调用 `close()`。该项目没有新增 Data API，也没有业务网络同步；JSON 批量导入失败由应用层恢复操作前的集合快照。

`jquanui/data` 当前独立版本为 `0.2.0`，用于本地列表、草稿、离线工作区、Mock 数据和页面视图模型。它不进入 Core，不是服务端数据库，也不负责权限、敏感数据和最终数据源。

优先复用已有生态能力：Table 负责表格渲染，Pagination 负责分页控件，CRUD 负责请求协议，FilterBuilder 负责筛选 UI，Storage 负责通用持久化，HTTP 负责网络请求。

## 入口与基本流程

```html
<script src="./dist/data/JquanUI@Data.js"></script>
<script>
  const contacts = JquanUIData.createCollection('contacts');
</script>
```

```js
import { createCollection } from 'jquanui/data';

const contacts = createCollection('contacts', {
  primaryKey: 'id', indexes: ['status'], unique: ['email'],
  data: [{ id: 1, name: 'Ada', status: 'active', email: 'ada@example.com' }]
});
contacts.insert({ id: 2, name: 'Lin', status: 'paused', email: 'lin@example.com' });
contacts.update({ id: 2 }, { status: 'active' });
const page = contacts.query({ status: 'active' }).orderBy({ name: 'asc' }).paginate(1, 20);
contacts.remove(2);
```

查询支持 `$eq`、`$ne`、`$gt`、`$gte`、`$lt`、`$lte`、`$in`、`$nin`、`$contains`、`$exists`、`$regex`，以及 `$and` / `$or`。常用结果方法包括 `first()`、`count()`、`exists()`、`sum()`、`average()`、`min()`、`max()`、`distinct()`、`groupBy()` 和 `paginate()`。

## Schema、迁移与快照

```js
const users = createCollection('users', {
  schemaVersion: 2,
  schema: {
    name: { type: 'string', required: true },
    active: { type: 'boolean', default: true }
  },
  migrations: { 2(record) { return { ...record, name: record.label || record.name }; } }
});
users.import(oldRows, { version: 1 });
const snapshot = users.exportSnapshot();
users.importSnapshot(snapshot);
```

迁移函数按目标版本执行并返回新记录。默认值只在字段缺失时填充。Schema 是轻量运行时校验，不是完整 ORM。

## 持久化与生态适配

可用适配器：`createMemoryAdapter()`、`createStorageAdapter()`、`createIndexedDBAdapter()`。默认内存模式不写入浏览器存储。

```js
const persistence = await contacts.persist(
  createIndexedDBAdapter({ name: 'crm', store: 'snapshots', key: 'contacts' }),
  {
    debounce: 100,
    onError(error) { reportStorageError(error); },
    onCorrupt(context) { reportRecovery(context); }
  }
);
await persistence.flush();
await persistence.close();
```

持久化值使用版本化状态包 `format: 'jquanui-data-state'`，包含 `records`、`sequence`、`revision`、`changeLog`、`pendingChanges`、`seenEventIds` 和 `acknowledgedEventIds`。恢复过程是静默的：不会把已有记录重新当作 `insert`，也不会让已确认事件再次进入待同步队列。旧版适配器中直接保存的记录数组仍可读取，并会在下一次保存时升级为状态包。

需要自定义存储时仍实现现有 `load()` / `save()` 适配器协议；不要在 Data 内复制 Storage 或 IndexedDB 逻辑。状态包属于本地缓存，不能替代服务端数据源、权限校验或备份。

自动持久化和 IndexedDB 写入按调用顺序串行执行，较慢的旧写入不会覆盖较新的状态。后台保存失败使用 `persist(adapter, { onError(error) { ... } })` 接收；初始化保存失败仍由 `await persist()` 直接抛出。

返回值保持可调用停止函数兼容，同时提供 `flush()`、`close()`、`status()`。页面卸载或组件销毁前优先 `await persistence.close()`，它会先提交尚未执行的 debounce 保存；只需要立即落盘而继续监听时使用 `await persistence.flush()`。

官方 Memory、Storage、IndexedDB 适配器默认维护独立备份槽。主状态校验失败时自动尝试最近有效备份，并通过 `onCorrupt({ collection, error, recovered, backupError })` 报告结果。已有同等级外部备份机制时可设 `backup: false`。自定义适配器若需要自动恢复，应实现 `loadBackup()` 与 `saveBackup()`。

复用已有 Table、CRUD、FilterBuilder、Pagination：

```js
const tableSource = createTableDataSource(contacts);
const result = await tableSource.load({ page: 1, pageSize: 10, filters: { name: 'ada' } });
const crudSource = createCrudDataSource(contacts);
const matcher = createFilterBuilderMatcher(event.detail.payload);
const rows = contacts.find(matcher);
```

Data 只计算数据结果；不要在 Data 内复制分页器、表格、筛选器或 `fetch()`。

## 响应式与关系查询

```js
const stop = contacts.liveQuery({ status: 'active' }, rows => renderRows(rows));
stop();

const rows = orders.query().join(customers, {
  local: 'customerId', foreign: 'id', as: 'customer'
}).all();
```

`join()` 默认返回单个关联记录或 `null`，`many: true` 返回数组。它是客户端内存视图 join，不提供服务端事务和引用完整性。

## 同步与恢复

```js
const transport = createHttpSyncAdapter({ pull: '/api/sync/pull', push: '/api/sync/push' });
const result = await contacts.sync(transport, { cursor: lastCursor });
```

自定义 transport 必须实现 `pull({ collection, since })`，可选实现 `push()` 和 `pullSnapshot()`。`resolveConflict({ local, incoming, event, collection })` 返回合并记录、`true` 接受远端，或 `false` / `null` 拒绝远端；`onConflict()` 接收 `merged` / `rejected` 状态。

`changesSince(cursor).gap` 为 `true` 时，历史已被 `historyLimit` 截断。提供 `pullSnapshot()` 后使用 `{ recoverOnGap: true }` 自动恢复；恢复后不会推送恢复前的旧增量。

生产同步可配置 `{ timeout, retries, retryDelay, retryOn, signal }`。捕获 `DataSyncError` 并按 `code` 处理超时、取消和普通失败；重试只应针对临时网络错误。

多标签页使用 `createBroadcastAdapter({ channel: 'contacts' })` 与 `collection.connect(adapter)`；不要同时把远端事件再次 publish，连接层已处理回声抑制。

同步事件带有 `eventId` 并自动去重；使用 `collection.syncStatus()` 展示同步状态。IndexedDB 适配器支持 `stores`、`estimate()`、`deleteDatabase()`，捕获 `DataStorageError` 处理存储失败或配额不足。它会读取已有数据库的实际版本：若传入版本过低则继续使用现有版本；若请求的 Store 缺失则自动升级数据库并创建它，避免多模块共享数据库时因版本不一致而失败。

服务端应在 push 响应中返回 `accepted` 或 `acceptedEventIds`。使用 `pendingChanges(cursor)` 展示独立 Outbox；它不受 `historyLimit` 裁剪影响。失败事件不会丢失，也不会被假定为已确认，已确认事件会从 Outbox 删除。

## AI 使用规则

1. 先判断需求属于 Data、Table、CRUD、Storage、HTTP 还是 Pagination，优先调用现有 API。
2. 不在 Core 中复制 Data 逻辑，不在 Data 中重写网络、分页器、表格和筛选器。
3. 先使用语义 API；只有已有能力不足时才新增参数或适配器。
4. 新增公开 API 必须同时更新类型、README、CHANGELOG 和 `scripts/check-data-layer.cjs`。
5. 不把 Data 当权限边界或服务端数据库；敏感数据和最终一致性由服务端负责。
6. 大数据量先加索引并运行 `npm run benchmark:data`，不要凭感觉优化。

真实浏览器回归使用 `npm run check:data:browser`，覆盖 IndexedDB 和 BroadcastChannel；Node 闸门使用 `npm run check:data`。

开发调试可用 `collection.diagnose()` 查看索引、历史窗口、Outbox 和操作计数；不要把诊断结果当作业务数据，也不要在生产热路径循环调用。`transaction(callback)` 失败时会恢复记录、索引、revision、变更历史、Outbox、事件去重和确认状态；不要在回调外假设失败事务留下了部分事件。

查询性能：重复使用同一查询实例时可开启 `{ cache: true }`；高频变更的 `liveQuery()` 可开启 `{ debounce: 16 }`。默认关闭，先用 `benchmark:data` 验证收益。

多字段等值查询使用 `compositeIndexes: [['tenantId', 'status']]` 或 `indexComposite(['tenantId', 'status'])`；范围条件不强行使用复合索引。

开发调试可使用 `createDataInspector(collection).snapshot()`，浏览器中使用 `.render(target)` 输出诊断面板；这是 opt-in 工具，不应在默认生产路径自动挂载。

Schema 校验失败会抛出 `DataValidationError`，读取其 `field`、`expected`、`value`；字段可配置 `validate(value, record)` 执行自定义规则。

新增或删除公开 API 时同步更新 `dist/data/data-api-surface.json`，再运行 `npm run check:data:surface`。该闸门会逐项核对 CJS、ESM、浏览器入口和类型声明；当前 Data 入口必须保持 17 个公开导出一致。

规模验证使用 `npm run benchmark:data`；需要百万级基准时单独运行 `npm run benchmark:data:large`，不要把它加入普通检查流程。

发布前运行 `npm run check:data:browser`，它通过 Edge CDP 验证真实 IndexedDB 和同频道 BroadcastChannel；该检查需要本机安装 Microsoft Edge。

单条和小批量变更使用增量索引，大批量导入自动使用一次性重建；性能判断以 `npm run benchmark:data` 的实际基线为准。

## CRM 应用层升级示例

澜序 CRM 的 followups/appointments/knowledge/messages 集合沿用每集合 IndexedDB 状态包；现有集合恢复后，仅初始化缺少的集合。历史客户沟通由应用 settings.collaborationVersion 标记和稳定迁移编号一次导入，旧日志保留，不更改 Data 的 schema/迁移协议。tasks.followupId 由应用维护，用于任务去重、删除保护及日历聚合去重。messages 的 readBy/trashedBy/hiddenBy 数组表达每位演示成员的视图状态；当前业务集合的 atomic 快照恢复仍为应用事务方案。详见 `../../projects/lanse-crm/docs/COLLABORATION.md`，不新增 Data 公共 API或网络同步。

## CRM 制造流程与快照组合

`projects/lanse-crm/src/workflow.js` 在应用层保存 workflowTemplates/workflowRuns，通过当前节点/审核人/预期索引校验推进顺序审批，并保留模板、业务记录快照与历史。制造服务维护项目、设计、采购、询报价的关联门禁及版本；所有制造新建/编辑与多集合流程使用应用 atomic 快照恢复，持久化仍为原有 persist/flush/close。首次升级只增补缺少的演示依赖，不覆写旧集合。金额币种与跨集合引用由应用检查，不是 Data 的数据库约束。组件 approvalFlow 仅渲染业务快照，关闭时 destroy。入口、参数、实际示例和限制见 `../../projects/lanse-crm/docs/MANUFACTURING.md`。
