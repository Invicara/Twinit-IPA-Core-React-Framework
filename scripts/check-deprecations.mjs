#!/usr/bin/env node
/**
 * Fail when a package.json/lockfile change introduces a deprecated dependency
 * that is not already on the allowlist.
 *
 * Reads the deprecation flags npm records in package-lock.json rather than
 * parsing `npm install` output. That output is not a usable signal: npm only
 * prints a deprecation for a package it actually fetches, so on a warm cache it
 * prints nothing at all. Measured on this repo, `npm ci --dry-run` reported
 * zero warnings while nine deprecated packages sat in the tree. The lockfile is
 * deterministic, offline and instant.
 *
 *   node scripts/check-deprecations.mjs            check
 *   node scripts/check-deprecations.mjs --update   rewrite the allowlist shape
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const ALLOWLIST = path.join(ROOT, '.deprecations-allowlist.json');
const update = process.argv.includes('--update');

const lock = JSON.parse(fs.readFileSync(path.join(ROOT, 'package-lock.json'), 'utf8'));

/** name -> {version, message} for everything npm flagged deprecated. */
const found = new Map();
for (const [p, meta] of Object.entries(lock.packages ?? {})) {
  if (!meta.deprecated) continue;
  const name = p.split('node_modules/').pop();
  if (!found.has(name)) {
    found.set(name, {
      version: meta.version,
      message: String(meta.deprecated).replace(/\s+/g, ' '),
    });
  }
}

const allow = JSON.parse(fs.readFileSync(ALLOWLIST, 'utf8'));
const allowed = new Set(Object.keys(allow).filter(k => !k.startsWith('_')));

const added = [...found.keys()].filter(n => !allowed.has(n)).sort();
const stale = [...allowed].filter(n => !found.has(n)).sort();

if (update) {
  const next = { _README: allow._README };
  for (const n of [...found.keys()].sort()) {
    next[n] = allow[n] ?? `TODO: explain why ${n} is tolerated and what pins it.`;
  }
  const body = Object.entries(next)
    .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`)
    .join(',\n\n');
  fs.writeFileSync(ALLOWLIST, `{\n${body}\n}\n`);
  console.log(`allowlist updated: ${found.size} deprecated package(s)`);
  process.exit(0);
}

if (stale.length) {
  console.log(`\nNo longer deprecated or no longer installed, drop from the allowlist:`);
  for (const n of stale) console.log(`  ${n}`);
}

if (added.length) {
  console.error(`\nNew deprecated dependencies entered the tree:\n`);
  for (const n of added) {
    const d = found.get(n);
    console.error(`  ${n}@${d.version}`);
    console.error(`    ${d.message.slice(0, 120)}`);
  }
  console.error(
    `\nPrefer upgrading whatever pulls it in. If it is genuinely blocked upstream,\n` +
      `add it to .deprecations-allowlist.json with a reason naming the blocker.\n`
  );
  process.exit(1);
}

console.log(`deprecations ok (${found.size} known, 0 new)`);
