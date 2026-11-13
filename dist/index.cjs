'use strict';

const extractor = require('./cli/jquan-extract.cjs');
const vitePlugin = require('./cli/jquan-vite-plugin.cjs');
const postcssPlugin = require('./cli/jquan-postcss-plugin.cjs');
const tokens = require('./cli/jquan-tokens.cjs');
const migrate = require('./cli/jquan-migrate.cjs');
const ssr = require('./ssr/jquan-ssr.cjs');

module.exports = Object.assign({}, extractor, ssr, {
    vitePlugin,
    jquanUIVitePlugin: vitePlugin.jquanUIVitePlugin || vitePlugin,
    postcssPlugin,
    jquanUIPostCSSPlugin: postcssPlugin.jquanUIPostCSSPlugin || postcssPlugin,
    tokens,
    migrate,
    ssr
});
