# Gates: Clarity Editorial

OWNS: projects/clarity-editorial/**, scripts/verify-clarity-pages.cjs

Scope: build and verify the second JquanUI editorial-style instance.

- [x] G1: all clarity pages contain the full-screen canvas and shared runtime
  CHECK: node scripts/verify-clarity-pages.cjs
  EXPECT: clarity page verification passed
  EVIDENCE: checked 8 Clarity pages; each page has `ce-screen`, shared Clarity config before JquanUI Core, no page-level style tag, no inline style, and primary navigation.

- [x] G2: the JquanUI extractor resolves the clarity page set
  CHECK: node ../../dist/cli/jquan-extract.cjs --doctor --input pages --config jquan.config.cjs --json
  EXPECT: "unresolvedClassCount":0
  CWD: projects/clarity-editorial
  EVIDENCE: JquanUI doctor passed with warningCount 0, unresolvedClassCount 0, failedRuleCount 0, conflictCount 0 after resolving ratio utilities into Clarity shortcuts.

- [x] G3: all project JavaScript and configuration files pass syntax checks
  CHECK: node scripts/verify-clarity-scripts.cjs
  EXPECT: clarity script verification passed
  EVIDENCE: syntax checks passed for `jquan.config.cjs`, `clarity-jquan.config.js`, `clarity-interactions.js`, and `scripts/verify-clarity-pages.cjs`.

- [x] G4: the core content surfaces expose the intended JquanUI behaviors
  CHECK: node scripts/verify-clarity-pages.cjs
  EXPECT: component coverage passed
  EVIDENCE: browser checked Articles, Blog, Media Library, and Profile. Articles defaulted to 6 Months with JquanUI Tabs and pagination; desktop Articles rendered 5 columns, Blog rendered 4 first-row columns; Media Picker mounted; 390px mobile had no document horizontal overflow and no console errors.
