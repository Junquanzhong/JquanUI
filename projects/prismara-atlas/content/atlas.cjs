'use strict';
// Titles and column names reference jquan.win; summaries and bodies are local design samples.
const columns = [
  { id: 'python', title: 'Python In Excel', label: 'PYTHON / EXCEL', description: '把数据集、字段更新与批量处理，整理成能再次使用的工作流。', cover: 'python-in-excel.svg', tags: ['Python', '数据集', '自动化'] },
  { id: 'excel', title: 'Excel 应用化开发', label: 'EXCEL / APPLICATION', description: '从一个公式到一个小型应用，记录表格工具的设计与实现。', cover: 'excel-pagination.svg', tags: ['Excel', '公式', '分页'] },
  { id: 'api', title: 'Excel WEB API', label: 'API / CONNECTIONS', description: '让外部数据进入工作表，把请求、响应与日常工作连接起来。', cover: 'excel-web-api.svg', tags: ['API', '函数', '数据'] },
  { id: 'templates', title: '1CSM 模板开发文档', label: 'TEMPLATE / SYSTEM', description: '围绕栏目、内容与模板，搭建可以持续维护的站点。', cover: '1csm-templates.svg', tags: ['模板', '文档', '站点'] }
];
const articles = [
  { id: 'update-dataset', column: 'python', title: 'Python In Excel：修改数据集指定字段内容', summary: '让一次字段更新，成为下一次可以直接复用的工作流。记录从读取、定位到结果验证的完整思路。', date: '2026-10-26', minutes: 6, tags: ['数据集', '字段更新'], sections: [
    { id: 'before', title: '先明确要修改什么', body: '<p>面对一组数据，先确认目标字段、匹配条件和预期结果，再动手修改。把这三个条件写下来，往往比直接开始编写代码更有帮助。</p><p>例如，需要把待处理记录的状态更新为就绪。除了字段名，还应该确认空值、重复记录和不符合条件的行应该如何处理。</p>' },
    { id: 'update', title: '用一个小样本验证', body: '<p>下面是一个独立的 Python 字典列表示例。先在副本中验证条件，确认结果之后，再将同样的思路用到实际工作表数据。</p><pre class="pr-code-panel overflow-x-auto"><code>rows = [{"id": 1, "status": "pending"},\n        {"id": 2, "status": "done"}]\n\nupdated = [\n    {**row, "status": "ready"}\n    if row["status"] == "pending" else dict(row)\n    for row in rows\n]\nassert updated[0]["status"] == "ready"\nassert updated[1]["status"] == "done"</code></pre>' },
    { id: 'verify', title: '把检查留在流程里', body: '<p>一条可复用的操作路径，应该能回答更新了多少行、哪些内容没有变化、异常数据在哪里。保留修改前的副本，可以让下一次排查有据可依。</p><blockquote class="border-l-2 border-prism-teal pl-5 text-carbon-ink">留下的不只是结果，还有再次找到结果的路径。</blockquote>' }
  ] },
  { id: 'create-dataset', column: 'python', title: 'Python In Excel：创建数据集', summary: '先把数据组织好，再让分析自然发生。从字段、类型和一小组样本开始，建立后续操作的共同底座。', date: '2026-10-18', minutes: 4, tags: ['数据集', '入门'], sections: [
    { id: 'structure', title: '从一张结构清晰的表开始', body: '<p>一个稳定的数据集先要有清晰的字段名。每列只表达一类信息，每行对应一条记录；日期、数字和文本尽量保持各自的类型。</p>' },
    { id: 'sample', title: '先用少量数据建立约定', body: '<p>不要急着导入全部历史数据。先选择几个正常样本与异常样本，检查空值、日期格式和标识字段，再决定如何进行后续更新。</p>' },
    { id: 'reuse', title: '给下一次使用留下说明', body: '<p>记录来源、刷新频率和字段含义。数据集被另一个流程引用时，这些说明会比一次性的操作截图更有用。</p>' }
  ] },
  { id: 'pagination', column: 'excel', title: 'Excel 动态分页器：轻松解决 FILTER 查询“#溢出”问题', summary: '表格变长之后，阅读方式也要跟着改变。用分页组织查询结果，让公式与界面保持轻盈。', date: '2026-10-12', minutes: 8, tags: ['Excel', '公式', '分页'], sections: [
    { id: 'spill', title: '先给动态数组留出空间', body: '<p>FILTER 返回的结果行数可能变化。输出区域存在其他内容、合并单元格或空间不足时，都值得先检查。分页只是展示策略，不能代替对原始溢出原因的确认。</p>' },
    { id: 'page', title: '把页码与查询条件分开', body: '<p>将当前页、每页条数和筛选条件分别保存。筛选条件变化时，回到第一页；数据量变化时，再检查当前页是否仍然有效。</p>' },
    { id: 'empty', title: '给边界情况一个明确的状态', body: '<p>没有查询结果时显示空状态；最后一页不足一页时展示实际条数。让使用者看得出当前处于哪一页，比让按钮一直可以点击更重要。</p>' }
  ] },
  { id: 'ipinfo', column: 'api', title: 'GetIpinfo 函数：调用 API 获取 IP 信息，可批量查询', summary: '从一个 IP 地址开始，理解外部数据如何进入工作表，以及批量查询时必须照顾的细节。', date: '2026-10-04', minutes: 5, tags: ['API', '函数', '批量查询'], sections: [
    { id: 'request', title: '先理解一次请求', body: '<p>先用一个已知输入检查响应结构，确认哪些字段是必需的、哪些可能缺失。将展示字段与原始响应分开，能够减少接口变化时的修改范围。</p>' },
    { id: 'batch', title: '批量查询需要节奏', body: '<p>批量任务要考虑接口限额、超时与重试。相同输入可以复用已有结果，失败记录单独保存，避免一次异常让整组工作丢失。</p>' },
    { id: 'result', title: '把结果变成可追踪的数据', body: '<p>把输入、查询时间和返回状态一起保存。这样下一次看到一条记录时，也能知道它来自哪里，以及是否需要再次刷新。</p>' }
  ] },
  { id: 'rewrite', column: 'templates', title: '伪静态：让内容地址更清晰', summary: '一条链接也是知识库的一部分。为栏目和文章建立稳定地址，方便收藏、引用和长期维护。', date: '2026-09-28', minutes: 4, tags: ['模板', '站点', '链接'], sections: [
    { id: 'address', title: '让地址表达内容层级', body: '<p>栏目与文章应该有各自稳定的入口。读者从搜索或收藏直接打开文章时，也应该能看见返回栏目和完整目录的路径。</p>' },
    { id: 'stable', title: '先保证链接长期可用', body: '<p>修改标题时，尽量保持已有地址可访问。需要迁移时，将旧地址转向新位置，避免引用和收藏失效。</p>' },
    { id: 'navigation', title: '把导航当作内容来维护', body: '<p>为文章补充面包屑、所属栏目和相关内容。一个知识单元既要可以单独阅读，也要有继续探索的方向。</p>' }
  ] }
];
module.exports = { columns, articles };
