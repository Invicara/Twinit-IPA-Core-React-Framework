#!/usr/bin/env node
/**
 * Per-file ESLint warning ratchet.
 *
 * Errors are never allowed. Warnings are allowed only up to the count already
 * recorded for that file in .lint-baseline.json, so existing debt is tolerated
 * but can never grow, and any file not in the baseline (i.e. new) must be clean.
 *
 * A repo-wide total was the other option and is worse: it is a single shared
 * counter, so every concurrent branch conflicts on it, and it blames whoever
 * commits next rather than whoever regressed.
 *
 *   node scripts/lint-ratchet.mjs [files...]   check (all files if none given)
 *   node scripts/lint-ratchet.mjs --update     rewrite the baseline
 */
import { ESLint } from 'eslint';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const BASELINE = path.join(ROOT, '.lint-baseline.json');

const args = process.argv.slice(2);
const update = args.includes('--update');
const files = args.filter(a => !a.startsWith('--'));

const rel = p => path.relative(ROOT, p).split(path.sep).join('/');

/** One key per line and sorted, so concurrent edits conflict on single lines. */
const writeBaseline = counts => {
  const body = Object.keys(counts)
    .sort()
    .map(k => `  ${JSON.stringify(k)}: ${counts[k]}`)
    .join(',\n');
  fs.writeFileSync(BASELINE, `{\n${body}\n}\n`);
};

const readBaseline = () =>
  fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : {};

const eslint = new ESLint({ errorOnUnmatchedPattern: false });

// Explicit paths that are ignored by eslint.config.mjs must be dropped, or
// lintFiles reports them as errors instead of skipping them.
let targets = files.length ? files : ['.'];
if (files.length) {
  const kept = [];
  for (const f of files) if (!(await eslint.isPathIgnored(f))) kept.push(f);
  if (!kept.length) process.exit(0);
  targets = kept;
}

const results = await eslint.lintFiles(targets);

if (update) {
  // A partial run must not erase files it never looked at.
  const counts = files.length ? readBaseline() : {};
  for (const r of results) {
    const k = rel(r.filePath);
    if (r.warningCount > 0) counts[k] = r.warningCount;
    else delete counts[k];
  }
  // Drop entries for files that no longer exist.
  for (const k of Object.keys(counts)) {
    if (!fs.existsSync(path.join(ROOT, k))) delete counts[k];
  }
  writeBaseline(counts);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log(`lint baseline updated: ${Object.keys(counts).length} files, ${total} warnings`);
  process.exit(0);
}

const baseline = readBaseline();
const regressed = [];
const improved = [];
let errorFiles = 0;

for (const r of results) {
  const k = rel(r.filePath);
  const allowed = baseline[k] ?? 0;

  if (r.errorCount > 0) {
    errorFiles++;
    console.error(`\n  ${k}: ${r.errorCount} error(s)`);
    for (const m of r.messages.filter(m => m.severity === 2)) {
      console.error(`    ${m.line}:${m.column}  ${m.message}  (${m.ruleId ?? 'parse'})`);
    }
  }

  if (r.warningCount > allowed) {
    regressed.push({ k, was: allowed, now: r.warningCount, messages: r.messages });
  } else if (r.warningCount < allowed) {
    improved.push({ k, was: allowed, now: r.warningCount });
  }
}

if (regressed.length) {
  console.error('\nESLint warnings increased in these files:\n');
  for (const f of regressed) {
    console.error(`  ${f.k}: ${f.was} -> ${f.now}`);
    for (const m of f.messages.filter(m => m.severity === 1)) {
      console.error(`    ${m.line}:${m.column}  ${m.message}  (${m.ruleId})`);
    }
  }
  console.error(
    '\nFix them, or if the increase is genuinely justified run:\n' + '  npm run lint:baseline\n'
  );
}

if (improved.length) {
  const saved = improved.reduce((a, f) => a + (f.was - f.now), 0);
  console.log(`\n${improved.length} file(s) improved, ${saved} warning(s) fewer than baseline.`);
  console.log('Run `npm run lint:baseline` to lock that in.\n');
}

if (errorFiles || regressed.length) process.exit(1);
console.log(`lint ratchet ok (${results.length} file(s) checked)`);
