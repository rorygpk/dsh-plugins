#!/usr/bin/env node
/**
 * Repository documentation check.
 *
 * Verifies every Markdown file in the repository:
 *   - has no UTF-8 BOM,
 *   - has no relative link or image target that does not exist,
 *   - keeps GitHub-safe HTML (no <script>, <style>, on* attributes).
 *
 * External http(s) links and in-page anchors are ignored on purpose: CI has no
 * network and anchors are validated by GitHub's renderer.
 *
 * Usage: node scripts/check-links.mjs
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skipDirs = new Set(['.git', 'node_modules', 'dist']);

function walk(directory, out = []) {
  for (const name of readdirSync(directory)) {
    if (skipDirs.has(name)) continue;
    const path = join(directory, name);
    const stats = statSync(path);
    if (stats.isDirectory()) walk(path, out);
    else if (name.endsWith('.md')) out.push(path);
  }
  return out;
}

const linkPattern = /\]\(([^)\s]+)\)|(?:src|href)="([^"]+)"/g;
const forbidden = [
  { pattern: /<script\b/i, label: '<script>' },
  { pattern: /<style\b/i, label: '<style>' },
  { pattern: /\son[a-z]+\s*=/i, label: 'inline event handler' },
  { pattern: /^\uFEFF/, label: 'UTF-8 BOM' },
];

const problems = [];
const files = walk(repoRoot).sort();

for (const file of files) {
  const relativePath = relative(repoRoot, file).replaceAll('\\', '/');
  const text = readFileSync(file, 'utf8');

  for (const rule of forbidden) {
    if (rule.pattern.test(text)) problems.push(`${relativePath}: ${rule.label}`);
  }

  for (const match of text.matchAll(linkPattern)) {
    const target = match[1] || match[2];
    if (!target) continue;
    if (/^(https?:|mailto:|#|data:)/i.test(target)) continue;
    const pathPart = target.split('#')[0];
    if (!pathPart) continue;
    const resolved = resolve(dirname(file), decodeURIComponent(pathPart));
    if (!existsSync(resolved)) problems.push(`${relativePath}: missing target ${target}`);
  }
}

if (problems.length > 0) {
  for (const problem of problems) console.error('FAIL ' + problem);
  process.exit(1);
}

console.log(`checked ${files.length} Markdown file(s): links, BOM and unsafe HTML are clean`);
