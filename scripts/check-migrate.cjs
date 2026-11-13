#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const migrate = require('../dist/cli/jquan-migrate.cjs');
const extractor = require('../dist/cli/jquan-extract.cjs');

const root = path.resolve(__dirname, '..');
const fixtureDir = path.join(root, '.tmp', 'migrate-fixture');
const fixture = path.join(fixtureDir, 'app.css');
const sourceFixture = path.join(fixtureDir, 'app.html');
const reportPath = path.join(fixtureDir, 'report.json');
const config = {
  theme: {
    extend: {
      colors: { brand: '#3366ff' },
      breakpoints: { tablet: '900px' },
      fluid: { spacing: { section: ['3rem', '6vw', '6rem'] } }
    }
  }
};
const tailwindConfig = {
  content: ['./src/**/*.{html,js}'],
  theme: {
    extend: {
      colors: { brand: '#3366ff' },
      screens: { tablet: { min: '900px' } },
      borderRadius: { panel: '10px' },
      fontSize: { caption: '13px' },
      fontWeight: { display: 650 },
      lineHeight: { compact: 1.25 }
    }
  },
  plugins: [{ name: 'example-plugin' }]
};
const css = `
.card {
  display: flex;
  padding: 15px;
  font-size: 15px;
  background-color: #3366ff;
  background-image: linear-gradient(red, blue);
  width: calc(100% - 2rem);
}
.card:hover { gap: 16px !important; }
@media (min-width: 900px) { .card::before { opacity: .5; } }
@supports (display: grid) { .feature { display: grid; } }
.section { padding-block: clamp(3rem, 6vw, 6rem); }
.card .child { margin: 16px; }
`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

fs.mkdirSync(fixtureDir, { recursive: true });

try {
  fs.writeFileSync(fixture, css, 'utf8');
  const report = migrate.auditCss(css, { config, source: fixture });
  assert(report.totals.rules === 6, 'migration parser should discover nested rules');
  assert(report.totals.declarations === 11, 'migration parser declaration count mismatch');

  const card = report.findings.find(item => item.selector === '.card');
  const cardClasses = card.declarations.map(item => item.className).filter(Boolean);
  assert(cardClasses.includes('flex'), 'display:flex should map to flex');
  assert(cardClasses.includes('p-4'), '15px spacing should prefer the nearest semantic token');
  assert(cardClasses.includes('text-md'), '15px font size should prefer text-md');
  assert(cardClasses.includes('bg-brand'), 'configured colors should map to semantic color classes');
  assert(cardClasses.includes('[width:calc(100%_-_2rem)]'), 'safe unmatched values should be reported as arbitrary candidates');
  assert(card.declarations.some(item => item.property === 'background-image' && item.kind === 'manual'), 'complex visual declarations should require manual review');

  const hover = report.findings.find(item => item.selector === '.card:hover');
  assert(hover.declarations[0].className === '!hover:gap-4', 'pseudo and important modifiers should be preserved');
  const responsive = report.findings.find(item => item.selector === '.card::before');
  assert(responsive.declarations[0].className === 'tablet:before:opacity-50', 'configured breakpoint and pseudo-element variants should compose');
  const supports = report.findings.find(item => item.selector === '.feature');
  assert(supports.declarations[0].className === 'supports-[display:_grid]:grid', '@supports contexts should become variants');
  const fluid = report.findings.find(item => item.selector === '.section');
  assert(fluid.declarations[0].className === 'pb-block-fluid-section', 'fluid spacing should map back to its semantic token');
  const compound = report.findings.find(item => item.selector === '.card .child');
  assert(compound.declarations.every(item => item.kind === 'manual' && item.reason === 'complex-selector'), 'compound selectors should not receive unsafe migration advice');
  const tailwindReport = migrate.auditCss('.panel { border-radius: 10px; font-size: 13px; font-weight: 650; line-height: 1.25; } @media (min-width: 900px) { .panel { display: flex; } }', { config: tailwindConfig });
  const tailwindClasses = tailwindReport.findings.flatMap(item => item.declarations.map(declaration => declaration.className).filter(Boolean));
  assert(tailwindClasses.includes('rounded-panel'), 'Tailwind borderRadius token should map to rounded-panel');
  assert(tailwindClasses.includes('text-caption'), 'Tailwind fontSize token should map to text-caption');
  assert(tailwindClasses.includes('font-display'), 'Tailwind fontWeight token should map to font-display');
  assert(tailwindClasses.includes('leading-compact'), 'Tailwind lineHeight token should map to leading-compact');
  assert(tailwindClasses.includes('tablet:flex'), 'Tailwind screens token should map to a JquanUI breakpoint');
  assert(tailwindReport.unsupportedTailwindTokens.includes('plugins'), 'Tailwind plugin configuration should be called out');
  assert(tailwindReport.configWarnings.length > 0, 'Tailwind configuration warnings should be reported');
  assert(tailwindReport.configFormat === 'tailwind-compatible', 'Tailwind configuration format should be identified');
  assert(card.declarations.every(item => item.before), 'Every migration declaration should include its original CSS');

  const semanticClasses = report.findings.flatMap(item => item.declarations.filter(declaration => declaration.kind === 'semantic').map(declaration => declaration.className));
  const compiled = extractor.renderCssFromClasses(semanticClasses, { config });
  assert(compiled.report.unresolvedClassCount === 0, `migration emitted unresolved semantic classes: ${JSON.stringify(compiled.report.unresolvedClasses)}`);

  const semanticOnly = migrate.auditCss('.x { width: 13.37px; }', { includeArbitrary: false });
  assert(semanticOnly.totals.arbitrary === 0 && semanticOnly.totals.manual === 1, 'semantic-only mode should suppress arbitrary suggestions');
  const markdown = migrate.formatMigrationReport(migrate.auditCssFiles([fixture], { config }));
  assert(markdown.includes('# JquanUI CSS Migration Audit'), 'markdown report heading missing');
  assert(markdown.includes('Suggested classes:'), 'markdown report should include class suggestions');

  const cli = spawnSync(process.execPath, ['dist/cli/jquan-migrate.cjs', '--input', fixture, '--output', reportPath], { cwd: root, encoding: 'utf8' });
  assert(cli.status === 0, `migration CLI failed: ${cli.stderr}`);
  assert(JSON.parse(fs.readFileSync(reportPath, 'utf8')).totals.files === 1, 'migration CLI report should include one file');

  const threshold = spawnSync(process.execPath, ['dist/cli/jquan-migrate.cjs', '--input', fixture, '--min-semantic', '100'], { cwd: root, encoding: 'utf8' });
  assert(threshold.status === 2, 'migration CLI should use exit code 2 when the semantic threshold fails');
  fs.writeFileSync(sourceFixture, '<div class="pt-2 p-4 md:hover:text-white flex"></div>\n<div class="flex items-center gap-2"></div>', 'utf8');
  const orderReport = migrate.auditClassFiles(sourceFixture, { root });
  assert(orderReport.total === 1, 'class order audit should report one unsorted class string');
  assert(orderReport.files[0].audits[0].sorted === 'flex p-4 pt-2 md:hover:text-white', 'class order audit should provide a stable utility order');
  const darkSource = '<div class="bg-white text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-100"></div>\n<div class="bg-gray-50 text-gray-700 shadow-md"></div>\n<div class="bg-surface text-text border-border"></div>';
  const darkReport = migrate.auditDarkSource(darkSource, { source: sourceFixture });
  assert(darkReport.summary.hardcodedColors === 6, 'dark audit should find literal color utilities');
  assert(darkReport.summary.shadows === 2, 'dark audit should find shadow utilities');
  assert(darkReport.summary.semanticRoles === 3, 'dark audit should identify semantic role utilities');
  assert(darkReport.summary.missingDarkVariants === 4, 'dark audit should identify missing dark variants');
  fs.writeFileSync(sourceFixture, darkSource, 'utf8');
  const darkFiles = migrate.auditDarkFiles(sourceFixture, { root });
  assert(darkFiles.summary.missingDarkVariants === 4, 'dark file audit should aggregate candidates');
  const darkMarkdown = migrate.formatMigrationReport(Object.assign(migrate.auditCssFiles([fixture], { config }), { darkAudit: darkFiles }));
  assert(darkMarkdown.includes('Dark-mode migration audit') && darkMarkdown.includes('Missing dark variants: 4'), 'markdown should include dark audit');
  const sourceOnly = spawnSync(process.execPath, ['dist/cli/jquan-migrate.cjs', '--source', sourceFixture, '--max-order', '0', '--output', reportPath], { cwd: root, encoding: 'utf8' });
  assert(sourceOnly.status === 2, `source-only class order threshold should fail with status 2: ${sourceOnly.stderr}`);
  const sourceOnlyReport = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  assert(sourceOnlyReport.classOrder.total === 1 && sourceOnlyReport.thresholds.orderCount === 1, 'source-only CLI report should include order audit and threshold result');
  fs.writeFileSync(sourceFixture, darkSource, 'utf8');
  const darkCli = spawnSync(process.execPath, ['dist/cli/jquan-migrate.cjs', '--source', sourceFixture, '--dark-audit', '--max-dark-missing', '3', '--output', reportPath], { cwd: root, encoding: 'utf8' });
  assert(darkCli.status === 2, `dark audit threshold should fail with status 2: ${darkCli.stderr}`);
  const darkCliReport = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  assert(darkCliReport.darkAudit.summary.missingDarkVariants === 4 && darkCliReport.thresholds.maxDarkMissing === 3, 'dark CLI report should include audit and threshold');
  assert(fs.readFileSync(sourceFixture, 'utf8') === darkSource, 'dark audit must leave its source unchanged');
  const missing = value => migrate.auditDarkSource(`<div class="${value}"></div>`).candidates.filter(item => item.missingDarkVariant).map(item => item.token);
  assert(missing('bg-white dark:hover:bg-slate-900').includes('bg-white'), 'hover dark color must not cover the base state');
  assert(missing('hover:bg-white dark:bg-slate-900').includes('hover:bg-white'), 'base dark color must not hide a hover candidate');
  assert(missing('md:hover:bg-white dark:md:hover:bg-slate-900').length === 0, 'matching responsive/state chain should pair');
  assert(missing('md:bg-white dark:lg:bg-slate-900').includes('md:bg-white'), 'different responsive ranges must remain separate');
  assert(missing('border-red-500 dark:border-2').includes('border-red-500'), 'border width must not count as a color override');
  assert(missing('shadow-sm dark:shadow-red-500').includes('shadow-sm'), 'shadow color must not cover shadow intensity');
  assert(missing('bg-white dark:bg-cover').includes('bg-white'), 'background sizing must not count as a color override');
  assert(missing('bg-white dark:bg-surface/90').length === 0, 'semantic role with opacity should cover the same property');
  assert(missing('!bg-white dark:bg-slate-900').includes('!bg-white'), 'normal dark color must not cover important base color');
  assert(missing('[&:hover]:bg-white dark:[&:hover]:bg-slate-900').length === 0, 'arbitrary selector colons must stay intact');
  assert(missing('hover:(bg-white text-gray-700) dark:hover:(bg-slate-900 text-slate-100)').length === 0, 'variant groups must pair expanded classes');
  assert(missing('bg-white dark-class:bg-slate-900').length === 0 && missing('bg-white dark-media:bg-slate-900').length === 0, 'explicit dark strategies should be recognized');
  const arbitraryDark = migrate.auditDarkSource('<div class="bg-[#fff]/90 text-[color:rgb(1_2_3)] bg-[url(foo.png)] text-sm shadow-none"></div>');
  assert(arbitraryDark.summary.hardcodedColors === 2 && arbitraryDark.summary.shadows === 1, 'arbitrary colors should be distinguished from images, typography and shadow shape');
  const configuredRole = migrate.auditDarkSource('<div class="bg-brand-surface/90"></div>', { config: { theme: { semantic: { 'brand-surface': { light: 'white', dark: 'black' } } } } });
  assert(configuredRole.summary.semanticRoles === 1 && configuredRole.summary.missingDarkVariants === 0, 'configured semantic roles must be recognized');
  const duplicate = migrate.auditDarkSource('<div class="bg-white"></div>\n<div class="bg-white"></div>');
  assert(duplicate.summary.classStrings === 1 && duplicate.candidates[0].line === 1, 'identical source class strings are counted once at their first location');
  const equalsCli = spawnSync(process.execPath, ['dist/cli/jquan-migrate.cjs', '--source', sourceFixture, '--dark-audit', '--max-dark-missing=4', '--output', reportPath], { cwd: root, encoding: 'utf8' });
  assert(equalsCli.status === 0, `equals threshold at count should pass: ${equalsCli.stderr}`);
  for (const value of ['-1', 'NaN', '', '1.5', '9007199254740992']) {
    const invalid = spawnSync(process.execPath, ['dist/cli/jquan-migrate.cjs', '--source', sourceFixture, '--dark-audit', `--max-dark-missing=${value}`], { cwd: root, encoding: 'utf8' });
    assert(invalid.status === 1 && invalid.stderr.includes('non-negative integer'), `invalid dark threshold should fail: ${value}`);
  }
  for (const argv of [['--input', fixture, '--dark-audit'], ['--source', sourceFixture, '--max-dark-missing', '0'], ['--source', path.join(fixtureDir, 'missing'), '--dark-audit']]) {
    const invalid = spawnSync(process.execPath, ['dist/cli/jquan-migrate.cjs', ...argv], { cwd: root, encoding: 'utf8' });
    assert(invalid.status === 1, `invalid dark-audit inputs must fail: ${argv}`);
  }
  const esm = spawnSync(process.execPath, ['--input-type=module', '-e', `import { auditDarkSource, auditDarkFiles } from './dist/cli/jquan-migrate.mjs'; import { migrate } from './dist/index.mjs'; if (auditDarkFiles !== migrate.auditDarkFiles || auditDarkSource('<div class="bg-white"></div>').summary.missingDarkVariants !== 1) process.exit(1);`], { cwd: root, encoding: 'utf8' });
  assert(esm.status === 0, `root and subpath ESM dark audit exports must work: ${esm.stderr}`);
  const collidingOutput = spawnSync(process.execPath, ['dist/cli/jquan-migrate.cjs', '--source', sourceFixture, '--dark-audit', '--output', sourceFixture], { cwd: root, encoding: 'utf8' });
  assert(collidingOutput.status === 1 && fs.readFileSync(sourceFixture, 'utf8') === darkSource, 'report output must not overwrite an audited source file');
  const markdownWithOrder = migrate.formatMigrationReport(Object.assign(migrate.auditCssFiles([fixture], { config }), { classOrder: orderReport }));
  assert(markdownWithOrder.includes('Class order audit') && markdownWithOrder.includes('pt-2 p-4'), 'Markdown report should include class order comparison');

  const rootApi = require('../dist/index.cjs');
  assert(rootApi.migrate && rootApi.migrate.auditCss === migrate.auditCss, 'root CJS entry should expose migrate API');
  console.log('[JquanUI] migrate check ok');
} finally {
  fs.rmSync(fixtureDir, { recursive: true, force: true });
}
