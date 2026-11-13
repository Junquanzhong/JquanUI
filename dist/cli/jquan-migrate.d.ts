import type { JquanConfig } from '../index';
import type { migrate as RootMigrate } from '../index';
export type DarkAuditOptions = RootMigrate.DarkAuditOptions;
export type DarkAuditCandidate = RootMigrate.DarkAuditCandidate;
export type DarkAuditFileReport = RootMigrate.DarkAuditFileReport;
export type DarkAuditReport = RootMigrate.DarkAuditReport;

export type MigrationKind = 'semantic' | 'arbitrary' | 'manual';

export interface MigrationDeclaration {
  property: string;
  value: string;
  important: boolean;
  kind: MigrationKind;
  className?: string;
  reason?: string;
  before?: string;
  after?: string | null;
}

export interface MigrationFinding {
  selector: string;
  targetClass: string | null;
  contexts: string[];
  line: number;
  declarations: MigrationDeclaration[];
}

export interface MigrationReport {
  version: string;
  source?: string | null;
  generatedAt?: string;
  totals: {
    files?: number;
    rules: number;
    declarations: number;
    semantic: number;
    arbitrary: number;
    manual: number;
    important: number;
  };
  coverage: { semantic: number; expressible: number };
  configSource?: string | null;
  configFormat?: string;
  configWarnings?: string[];
  unsupportedTailwindTokens?: string[];
  thresholds?: { minSemantic: number | null; minExpressible: number | null; maxManual: number | null; maxOrder: number | null; maxDarkMissing?: number | null; manualRatio: number; orderCount: number; passed: boolean; failures: string[] };
  classOrder?: ClassOrderReport;
  migrationSuggestions?: Array<{ source?: string | null; selector: string; line: number; before?: string; after?: string | null; kind: MigrationKind; reason?: string | null }>;
  findings?: MigrationFinding[];
  files?: MigrationReport[];
  darkAudit?: DarkAuditReport;
}

export interface ClassOrderAudit { original: string; sorted: string; changed: true; tokens: string[]; line: number | null; }
export interface ClassOrderFileReport { source: string; audits: ClassOrderAudit[]; }
export interface ClassOrderReport { files: ClassOrderFileReport[]; total: number; }

export interface MigrationOptions {
  root?: string;
  source?: string;
  config?: JquanConfig;
  includeArbitrary?: boolean;
  configSource?: string | null;
}

export declare const VERSION: string;
export declare function auditCss(source: string, options?: MigrationOptions): MigrationReport;
export declare function auditCssFiles(inputs: string | string[], options?: MigrationOptions): MigrationReport;
export declare function auditClassFiles(inputs: string | string[], options?: { root?: string }): ClassOrderReport;
export declare function auditDarkSource(source: string, options?: DarkAuditOptions): DarkAuditFileReport;
export declare function auditDarkFiles(inputs: string | string[], options?: DarkAuditOptions): DarkAuditReport;
export declare function collectCssFiles(inputs: string | string[], root?: string): string[];
export declare function collectSourceFiles(inputs: string | string[], root?: string): string[];
export declare function normalizeMigrationConfig(config?: Record<string, unknown>): { config: Record<string, unknown>; format: string; warnings: string[]; unsupportedTailwindTokens: string[] };
export declare function formatMigrationReport(report: MigrationReport): string;
export declare function parseCss(source: string): Array<{ selector: string; declarations: Array<{ property: string; value: string; important: boolean }>; contexts: string[]; line: number }>;
export declare function suggestAtomicClass(property: string, value: string, options?: Record<string, unknown>): { className: string; kind: Exclude<MigrationKind, 'manual'> } | null;
export declare function sortClassTokens(tokens: string[]): string[];
export declare function main(argv?: string[]): { ok: boolean; help?: boolean; thresholdFailed?: boolean; report?: MigrationReport };

declare const migrate: {
  VERSION: typeof VERSION;
  auditCss: typeof auditCss;
  auditCssFiles: typeof auditCssFiles;
  auditClassFiles: typeof auditClassFiles;
  auditDarkSource: typeof auditDarkSource;
  auditDarkFiles: typeof auditDarkFiles;
  collectCssFiles: typeof collectCssFiles;
  collectSourceFiles: typeof collectSourceFiles;
  normalizeMigrationConfig: typeof normalizeMigrationConfig;
  formatMigrationReport: typeof formatMigrationReport;
  parseCss: typeof parseCss;
  suggestAtomicClass: typeof suggestAtomicClass;
  sortClassTokens: typeof sortClassTokens;
  main: typeof main;
};

export default migrate;
