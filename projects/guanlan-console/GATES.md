# Gates: Guanlan Console core pages

OWNS: projects/guanlan-console/**, scripts/verify-guanlan-pages.cjs

Scope: build and verify the Guanlan Console core B-end pages around the shared gl-screen canvas

- [x] G1: all required Guanlan pages contain the shared screen canvas and semantic landmarks
  CHECK: node scripts/verify-guanlan-pages.cjs
  EXPECT: guanlan page verification passed
  EVIDENCE: checked 7 Guanlan pages; page verification passed after full-viewport canvas, sidebar flyout navigation, link tabs, native Tabs, and list selection updates

- [x] G2: JquanUI extraction resolves every class used by the Guanlan page set
  CHECK: node ../../dist/cli/jquan-extract.cjs --doctor --input pages --config jquan.config.cjs
  EXPECT: JquanUI doctor ok
  CWD: projects/guanlan-console
  EVIDENCE: classCount 351, ruleCount 406, warningCount 0, unresolvedClassCount 0, failedRuleCount 0, conflictCount 0

- [x] G3: the core page set is visually coherent at the browser surface
  EVIDENCE: local browser checked list and settings at a narrow viewport; stage/screen equal the viewport, sidebar flyout opens on focus and closes by default, Settings hash links select the matching JquanUI panel, list bulk selection works, no horizontal overflow observed, and no page console errors observed. Flyout close behavior includes a 140 ms pointer-leave buffer so users can cross the visual gap between the primary trigger and secondary menu without losing the menu.

- [x] G4: list filters and form controls use the shared Guanlan JquanUI treatment
  CHECK: node scripts/verify-guanlan-pages.cjs
  EXPECT: guanlan page verification passed
  EVIDENCE: the list primary toolbar uses search, type select, and Filters as a three-column desktop row; advanced filters are hidden by default and occupy an independent row when opened; list, form, and settings selects use the JquanUI select component; the form Tags field uses JquanUI tagInput; shared control theming lives in projects/guanlan-console/scripts/guanlan-controls.js.

- [x] G5: the updated Guanlan classes and scripts pass extraction and syntax checks
  CHECK: node dist/cli/jquan-extract.cjs --doctor --input .\projects\guanlan-console\pages --config .\projects\guanlan-console\jquan.config.cjs --json
  EXPECT: JquanUI doctor ok
  EVIDENCE: classCount 352, ruleCount 409, warningCount 0, unresolvedClassCount 0, failedRuleCount 0, conflictCount 0. Node syntax checks passed for guanlan-interactions.js, guanlan-controls.js, jquan.config.cjs, and guanlan-jquan.config.js.
