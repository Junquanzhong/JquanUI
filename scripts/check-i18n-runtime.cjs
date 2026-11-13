'use strict';
const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.resolve(__dirname, '..');

function fixture(file = 'dist/components/i18n.js') {
    const document = { querySelectorAll: () => [], documentElement: { lang: '', dir: '' } };
    const context = { document, console, URL, Intl, CustomEvent: class {}, dispatchEvent() {}, location: { href: 'http://localhost/' } };
    context.window = context;
    vm.runInNewContext(fs.readFileSync(path.resolve(root, file), 'utf8'), context);
    return { api: context.JquanUIComponents.i18nApi, document };
}

async function main() {
    const file = process.argv[2] || 'dist/components/i18n.js';
    if (process.argv[3] === '--probe') {
        const { api } = fixture(file);
        api.registerMessages({ 'zh-CN': { common: { greeting: '你好' } } });
        await api.setLocale('zh-CN');
        console.log(`greeting=${api.t('greeting')}; common.greeting=${api.t('common.greeting')}`);
        return;
    }
    let count = 0;
    const equal = (actual, expected, label) => { assert.equal(actual, expected, label); count++; };
    const { api, document } = fixture(file);
    api.config({ persist: false, autoObserve: false, fallbackLocale: 'en-US', detectOrder: ['default'] });
    api.registerMessages({
        'zh-CN': { common: { greeting: '你好，{{name}}', nested: { title: '标题' } }, account: { title: '账户' } },
        'en-US': { common: { greeting: 'Hello, {{name}}', onlyEnglish: 'Fallback' }, account: { title: 'Account' } }
    });
    await api.init({ locale: 'zh-CN' });
    equal(api.t('greeting', { name: 'Ada' }), '你好，Ada', 'Nested default namespace');
    equal(api.t('common.greeting', { name: 'Ada' }), '你好，Ada', 'Qualified default namespace');
    equal(api.t('nested.title'), '标题', 'Nested message paths');
    equal(api.t('account.title'), '账户', 'Qualified custom namespace');
    equal(api.t('title', {}, { namespace: 'account' }), '账户', 'Explicit namespace');
    equal(api.t('onlyEnglish'), 'Fallback', 'Language fallback');
    equal(api.t('common.onlyEnglish'), 'Fallback', 'Qualified language fallback');
    equal(api.t('missing'), 'missing', 'Missing key behavior');
    equal(api.t('greeting', { name: '<b>Ada</b>' }), '你好，&lt;b&gt;Ada&lt;/b&gt;', 'Escaped interpolation');
    equal(api.translate(), true, 'Translate return value');
    equal(api.observe(), true, 'Observe facade return value');
    equal(api.disconnect(), true, 'Disconnect facade return value');
    let change;
    const off = api.on('change', payload => { change = payload; });
    equal(await api.setLocale('en-US'), 'en-US', 'setLocale returns locale');
    equal(change.previousLocale, 'zh-CN', 'Change previous locale');
    equal(document.documentElement.lang, 'en-US', 'HTML language synchronization');
    equal(document.documentElement.dir, 'ltr', 'LTR synchronization');
    off();
    api.registerMessages({ 'zh-CN': { greeting: '平铺', profile: { title: '资料' } } });
    await api.setLocale('zh-CN');
    equal(api.t('greeting'), '平铺', 'Flat registration retained');
    equal(api.t('profile.title'), '资料', 'Legacy nested paths retained');
    api.registerLocale('zh-CN', { 'flat.title': '点号平铺' });
    equal(api.t('flat.title'), '点号平铺', 'Literal dotted message key');
    api.registerLocale('zh-CN', { account: { title: '旧路径' } });
    equal(api.t('account.title'), '旧路径', 'Existing literal path wins over namespace shorthand');
    equal(api.t('title', {}, { namespace: 'account' }), '账户', 'Explicit namespace remains unambiguous');
    api.registerMessages({ 'zh-CN': { catalog: { item: '目录' } } }, { nested: true });
    equal(api.t('catalog.item'), '目录', 'Explicit nested resource mode');
    api.registerMessages({ 'zh-CN': { common: { literal: '原结构' } } }, { nested: false });
    equal(api.t('common.literal'), '原结构', 'Explicit legacy mode');
    api.registerMessages({ 'zh-CN': { common: { title: '内部路径' } } }, { namespace: 'feature' });
    equal(api.t('common.title', {}, { namespace: 'feature' }), '内部路径', 'Explicit namespace disables automatic splitting');
    api.registerLocale('zh-CN', { items: { one: '{{count}} 项', other: '{{count}} 项' }, amount: '{{value}} 元' });
    equal(api.t('items', { count: 2 }), '2 项', 'Plural uses count with t');
    equal(api.tn('amount', 2), '2 元', 'tn formats value');
    await api.setLocale('ar');
    equal(document.documentElement.dir, 'rtl', 'RTL synchronization');
    console.log(`[JquanUI] i18n runtime check ok (${count} assertions)`);
}

if (require.main === module) main().catch(error => { console.error(error.stack); process.exitCode = 1; });
module.exports = { fixture };
