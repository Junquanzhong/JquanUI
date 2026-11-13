#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const TYPE_MAP = {
    color: 'color',
    spacing: 'dimension',
    radius: 'dimension',
    fontFamily: 'fontFamily'
};

function printHelp() {
    console.log(`JquanUI Design Tokens bridge

Usage:
  node dist/cli/jquan-tokens.cjs import --input ./design.tokens.json --output ./jquan.config.json
  node dist/cli/jquan-tokens.cjs export --input ./jquan.config.json --output ./design.tokens.json

Commands:
  import    Convert W3C Design Tokens JSON to JquanUI config JSON.
  export    Convert JquanUI config JSON to W3C Design Tokens JSON.
`);
}

function parseArgs(argv) {
    const args = { command: argv[0], input: null, output: null };
    if (argv[0] === '--help' || argv[0] === '-h') {
        args.help = true;
        args.command = null;
        return args;
    }
    for (let i = 1; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--help' || arg === '-h') args.help = true;
        else if (arg === '--input' || arg === '-i') args.input = argv[++i];
        else if (arg.startsWith('--input=')) args.input = arg.slice('--input='.length);
        else if (arg === '--output' || arg === '-o') args.output = argv[++i];
        else if (arg.startsWith('--output=')) args.output = arg.slice('--output='.length);
    }
    return args;
}

function isToken(node) {
    return node && typeof node === 'object' && ('$value' in node || 'value' in node);
}

function tokenValue(node) {
    return node.$value !== undefined ? node.$value : node.value;
}

function tokenType(node, fallback = null) {
    return node.$type || node.type || fallback;
}

function setDeep(target, pathParts, value) {
    let cursor = target;
    pathParts.forEach((part, index) => {
        if (index === pathParts.length - 1) cursor[part] = value;
        else {
            cursor[part] = cursor[part] || {};
            cursor = cursor[part];
        }
    });
}

function walkTokens(node, visitor, trail = [], inheritedType = null) {
    if (!node || typeof node !== 'object') return;
    const nextType = tokenType(node, inheritedType);
    if (isToken(node)) {
        visitor(trail, tokenValue(node), nextType, node);
        return;
    }
    for (const [key, value] of Object.entries(node)) {
        if (key === '$type' || key === 'type' || key === '$description' || key === 'description') continue;
        walkTokens(value, visitor, trail.concat(key), nextType);
    }
}

function importTokens(tokens) {
    const config = { theme: { extend: {}, semantic: {} } };

    walkTokens(tokens, (trail, value, type) => {
        const [group, ...rest] = trail;
        if (!group || rest.length === 0) return;

        if (group === 'semantic') {
            const name = rest.join('-');
            config.theme.semantic[name] = value;
            return;
        }

        if (group === 'color' || group === 'colors' || type === 'color') {
            setDeep(config.theme.extend.colors = config.theme.extend.colors || {}, group === 'color' || group === 'colors' ? rest : trail, value);
            return;
        }

        if (group === 'radius') {
            setDeep(config.theme.extend.radius = config.theme.extend.radius || {}, rest, value);
            return;
        }

        if (group === 'spacing' || type === 'dimension') {
            if (group === 'spacing') setDeep(config.theme.extend.spacing = config.theme.extend.spacing || {}, rest, value);
            return;
        }

        if (group === 'fontFamily' || group === 'font-family' || type === 'fontFamily') {
            setDeep(config.theme.extend.fontFamily = config.theme.extend.fontFamily || {}, rest.length ? rest : trail, value);
        }
    });

    for (const key of ['colors', 'spacing', 'radius', 'fontFamily']) {
        if (config.theme.extend[key] && Object.keys(config.theme.extend[key]).length === 0) delete config.theme.extend[key];
    }
    if (Object.keys(config.theme.semantic).length === 0) delete config.theme.semantic;
    if (Object.keys(config.theme.extend).length === 0) delete config.theme.extend;
    return config;
}

function makeToken(value, type) {
    return { $type: type, $value: value };
}

function exportObjectTokens(source, type) {
    if (!source || typeof source !== 'object') return {};
    const output = {};
    for (const [key, value] of Object.entries(source)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) output[key] = exportObjectTokens(value, type);
        else output[key] = makeToken(value, type);
    }
    return output;
}

function exportTokens(config) {
    const theme = config.theme || {};
    const extend = theme.extend || {};
    const output = {};
    const colors = theme.colors || extend.colors;
    if (colors) output.color = exportObjectTokens(colors, TYPE_MAP.color);
    if (extend.spacing) output.spacing = exportObjectTokens(extend.spacing, TYPE_MAP.spacing);
    if (extend.radius) output.radius = exportObjectTokens(extend.radius, TYPE_MAP.radius);
    if (extend.fontFamily) output.fontFamily = exportObjectTokens(extend.fontFamily, TYPE_MAP.fontFamily);
    if (theme.semantic) {
        output.semantic = {};
        for (const [key, value] of Object.entries(theme.semantic)) output.semantic[key] = makeToken(value, 'color');
    }
    return output;
}

function readJson(file) {
    return JSON.parse(fs.readFileSync(path.resolve(file), 'utf8').replace(/^\uFEFF/, ''));
}

function writeJson(file, data) {
    const output = path.resolve(file);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function main(argv = process.argv.slice(2)) {
    const args = parseArgs(argv);
    if (args.help || !args.command) {
        printHelp();
        return { ok: true };
    }
    if (!args.input || !args.output) {
        printHelp();
        return { ok: false, error: 'Missing --input or --output.' };
    }
    const input = readJson(args.input);
    let output;
    if (args.command === 'import') output = importTokens(input);
    else if (args.command === 'export') output = exportTokens(input);
    else throw new Error(`Unknown command: ${args.command}`);
    writeJson(args.output, output);
    console.log(`[JquanUI] Tokens ${args.command} -> ${path.resolve(args.output)}`);
    return { ok: true, output };
}

module.exports = {
    exportTokens,
    importTokens,
    main
};

if (require.main === module) {
    try {
        const result = main();
        if (result && result.ok === false) process.exitCode = 1;
    } catch (error) {
        console.error(`[JquanUI] Tokens failed: ${error.message}`);
        process.exitCode = 1;
    }
}
