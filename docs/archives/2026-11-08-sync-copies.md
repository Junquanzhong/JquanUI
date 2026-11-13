# 同步副本归档记录

日期：2026-11-08。正式 Core、压缩版和 Full 已先做行为对账。下表 canonical 哈希是归档前的核对快照，不声明同步副本与正式版等价。

已归档 21 份可读取文件；逐份保存原始字节、SHA256 和相对路径，ZIP 解压到独立副本后全部哈希相同。
归档：`archives/sync-copies-2026-11-08.zip`。完整哈希/差异：`verification/core-distribution-2026-11-08/sync-copy-audit.json`、`sync-copy-diffs.patch`。
恢复：Python zipfile 或系统解压工具，将 ZIP 中所需的相对路径恢复到项目根目录。恢复前检查同路径新文件，避免覆盖后续修改。

引用核对：可读取的项目代码和文档未引用这些副本作为入口；原始 ISSUES 文档中 6 个名称仅为历史诊断清单，原文保留。项目外的引用不在本次扫描范围。
读取限制：`.jquan-home.html`、`config/mcporter.json` 为不可读取的云占位文件，引用扫描未覆盖其内容；常规页面、构建脚本和 package exports 均已核对。

| 原路径 | 正式对应文件 | 字节 | 与正式快照相同 |
| --- | --- | ---: | --- |
| `content/plugin-system-DESKTOP-064SV5C.js` | `content/plugin-system.js` | 21157 | 否，保留独立差异 |
| `dist/browser-globals.d-DESKTOP-064SV5C.ts` | `dist/browser-globals.d.ts` | 4272 | 否，保留独立差异 |
| `dist/core/JquanUI@Core-DESKTOP-064SV5C-2.js` | `dist/core/JquanUI@Core.js` | 276848 | 否，保留独立差异 |
| `dist/core/JquanUI@Core-DESKTOP-064SV5C.js` | `dist/core/JquanUI@Core.js` | 268070 | 否，保留独立差异 |
| `dist/full/JquanUI@full-DESKTOP-064SV5C-2.js` | `dist/full/JquanUI@full.js` | 1071236 | 否，保留独立差异 |
| `dist/full/JquanUI@full-DESKTOP-064SV5C.js` | `dist/full/JquanUI@full.js` | 978780 | 否，保留独立差异 |
| `dist/index.d-DESKTOP-064SV5C.ts` | `dist/index.d.ts` | 21087 | 否，保留独立差异 |
| `dist/manifest-DESKTOP-064SV5C.json` | `dist/manifest.json` | 7015 | 否，保留独立差异 |
| `dist/release-summary-DESKTOP-064SV5C.md` | `dist/release-summary.md` | 2892 | 否，保留独立差异 |
| `docs/5.0-ITERATION-PLAN-DESKTOP-064SV5C.md` | `docs/5.0-ITERATION-PLAN.md` | 27466 | 否，保留独立差异 |
| `js/components-docs-DESKTOP-064SV5C.js` | `js/components-docs.js` | 377300 | 否，保留独立差异 |
| `js/JquanUI@core.min-DESKTOP-064SV5C.js` | `js/JquanUI@core.min.js` | 161170 | 否，保留独立差异 |
| `package-DESKTOP-064SV5C.json` | `package.json` | 12352 | 否，保留独立差异 |
| `README-DESKTOP-064SV5C.md` | `README.md` | 50113 | 否，保留独立差异 |
| `ROADMAP-DESKTOP-064SV5C.md` | `ROADMAP.md` | 38009 | 否，保留独立差异 |
| `scripts/check-component-documentation-DESKTOP-064SV5C.cjs` | `scripts/check-component-documentation.cjs` | 5609 | 否，保留独立差异 |
| `scripts/check-documentation-DESKTOP-064SV5C.cjs` | `scripts/check-documentation.cjs` | 25893 | 否，保留独立差异 |
| `scripts/check-types-surface-DESKTOP-064SV5C.cjs` | `scripts/check-types-surface.cjs` | 8042 | 否，保留独立差异 |
| `skills/jquanui/SKILL-DESKTOP-064SV5C-2.md` | `skills/jquanui/SKILL.md` | 75450 | 否，保留独立差异 |
| `skills/jquanui/SKILL-DESKTOP-064SV5C.md` | `skills/jquanui/SKILL.md` | 66652 | 否，保留独立差异 |
| `src/runtime/component-import-DESKTOP-064SV5C.js` | `src/runtime/component-import.js` | 6850 | 否，保留独立差异 |

## 原位保留

- `CHANGELOG-DESKTOP-064SV5C.md`：44232 字节的云占位条目；OneDrive 云文件提供程序未运行，未取得内容/哈希，原位保留。待文件可读取后才能差异核对与归档，不计为已完成清理。

ZIP SHA256：`be381f212d995c0631eb8a0523793ddb975e25b1667860a321218edf44fad947`。
公开 `core-archive-v4.5` 导出及其正式历史文件保留；npm 的 DESKTOP 排除规则继续保留。
