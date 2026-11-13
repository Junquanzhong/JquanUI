import cjs from './jquan-migrate.cjs';

export const VERSION = cjs.VERSION;
export const auditCss = cjs.auditCss;
export const auditCssFiles = cjs.auditCssFiles;
export const auditClassFiles = cjs.auditClassFiles;
export const auditDarkSource = cjs.auditDarkSource;
export const auditDarkFiles = cjs.auditDarkFiles;
export const collectCssFiles = cjs.collectCssFiles;
export const collectSourceFiles = cjs.collectSourceFiles;
export const formatMigrationReport = cjs.formatMigrationReport;
export const normalizeMigrationConfig = cjs.normalizeMigrationConfig;
export const parseCss = cjs.parseCss;
export const sortClassTokens = cjs.sortClassTokens;
export const suggestAtomicClass = cjs.suggestAtomicClass;
export const main = cjs.main;

export default cjs;
