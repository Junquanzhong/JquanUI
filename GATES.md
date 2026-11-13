# Gates: Guanlan B-end showcase

OWNS: projects/guanlan-console/pages/**, projects/guanlan-console/scripts/**, scripts/verify-guanlan-pages.cjs, scripts/verify-guanlan-scripts.cjs

Scope: complete the Guanlan B-end showcase with content operations, data governance, account management, recycle workflows, task and notification centers, and system status screens.

- [x] G1: all required Guanlan pages exist and pass structural verification
  CHECK: node scripts/verify-guanlan-pages.cjs
  EXPECT: guanlan page verification passed
  EVIDENCE: `node scripts/verify-guanlan-pages.cjs` passed on September 18, 2026: 20 pages checked.

- [x] G2: showcase and navigation scripts pass JavaScript syntax checks
  CHECK: node scripts/verify-guanlan-scripts.cjs
  EXPECT: guanlan script syntax passed
  EVIDENCE: `node scripts/verify-guanlan-scripts.cjs` passed.

- [x] G3: JquanUI extraction and doctor checks pass for the expanded page set
  CHECK: node dist/cli/jquan-extract.cjs --doctor --input .\projects\guanlan-console\pages --config .\projects\guanlan-console\jquan.config.cjs --json
  EXPECT: "ok": true
  EVIDENCE: Doctor passed on September 18, 2026 with warningCount 0, unresolvedClassCount 0, failedRuleCount 0, conflictCount 0.

- [x] G4: browser review confirms the new showcase pages render their component surfaces without blank mount points
  EVIDENCE: Browser DOM review on September 18, 2026 confirmed visible mounts for the field designer, media picker/upload, permission matrix/role assigner, and review queue.

- [x] G5: reusable JquanUI date and time picker component is present and registered
  CHECK: node scripts/verify-date-time-picker.cjs
  EXPECT: date time picker verification passed
  EVIDENCE: `node scripts/verify-date-time-picker.cjs` passed; component manifest includes `dateTimePicker.js`.

- [x] G6: Guanlan forms use the custom picker instead of native date/time controls
  CHECK: node scripts/verify-guanlan-pages.cjs
  EXPECT: guanlan page verification passed
  EVIDENCE: Form page contains three marked picker inputs for date, time, and datetime-local modes.

- [x] G7: date and time picker scripts pass syntax checks
  CHECK: node scripts/verify-guanlan-scripts.cjs
  EXPECT: guanlan script syntax passed
  EVIDENCE: `node scripts/verify-guanlan-scripts.cjs` passed.

- [x] G8: browser review confirms date, time, and datetime picker interactions render correctly
  EVIDENCE: Browser review on September 18, 2026 confirmed date calendar, stepped time columns, datetime selection, Apply/Cancel/Clear, and native value sync (`10:45`, `2026-09-18T11:15`).

- [x] G9: governance, account, task, notification, import/export, recycle, and status pages are structurally complete
  CHECK: node scripts/verify-guanlan-pages.cjs
  EXPECT: guanlan page verification passed
  EVIDENCE: Browser and structural verification on September 18, 2026 confirmed audit log, notifications, task center, import/export, profile, recycle bin, and 403/404/500 pages render their required content and components. The page verifier also passed with 20 pages.
