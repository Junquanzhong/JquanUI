#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const corePath = path.join(root, 'dist/core/JquanUI@Core.js');
const source = fs.readFileSync(corePath, 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function skipQuoted(text, index, quote) {
  for (let i = index + 1; i < text.length; i += 1) {
    if (text[i] === '\\') { i += 1; continue; }
    if (text[i] === quote) return i + 1;
  }
  return text.length;
}

function collectTopLevelKeys(text, objectStart) {
  const keys = new Map();
  let depth = 1;
  let index = objectStart + 1;

  while (index < text.length && depth > 0) {
    const char = text[index];
    if (char === '/' && text[index + 1] === '/') {
      const end = text.indexOf('\n', index + 2);
      index = end === -1 ? text.length : end + 1;
      continue;
    }
    if (char === '/' && text[index + 1] === '*') {
      const end = text.indexOf('*/', index + 2);
      index = end === -1 ? text.length : end + 2;
      continue;
    }
    if (depth === 1 && (char === "'" || char === '"')) {
      const end = skipQuoted(text, index, char);
      const key = text.slice(index + 1, end - 1);
      const remainder = text.slice(end).match(/^\s*:/);
      if (remainder) {
        const line = text.slice(0, index).split('\n').length;
        if (!keys.has(key)) keys.set(key, []);
        keys.get(key).push(line);
      }
      index = end;
      continue;
    }
    if (char === "'" || char === '"' || char === '`') {
      index = skipQuoted(text, index, char);
      continue;
    }
    if (char === '{') { depth += 1; index += 1; continue; }
    if (char === '}') { depth -= 1; index += 1; continue; }

    index += 1;
  }
  return keys;
}

function checkObject(name, marker, endMarker) {
  const markerIndex = source.indexOf(marker);
  assert(markerIndex >= 0, `Missing ${name} marker`);
  const objectStart = source.indexOf('{', markerIndex);
  assert(objectStart >= 0, `Missing ${name} object`);
  const endIndex = endMarker ? source.indexOf(endMarker, objectStart) : source.length;
  assert(endIndex >= 0, `Missing ${name} end marker`);

  const keys = collectTopLevelKeys(source.slice(0, endIndex), objectStart);
  const duplicates = Array.from(keys.entries()).filter(([, lines]) => lines.length > 1);
  assert(duplicates.length === 0, `${name} has duplicate top-level mappings: ${duplicates.map(([key, lines]) => `${key} (${lines.join(', ')})`).join('; ')}`);
  return keys.size;
}

const variantCount = checkObject('variants', 'const variants = {', 'for (const size of Object.keys(containers))');
const dictionaryCount = checkObject('dictionary', 'const dictionary = {', '// ==================== dictionary 结束');
console.log(`[JquanUI] duplicate mapping check ok (${variantCount} variants, ${dictionaryCount} utilities)`);
