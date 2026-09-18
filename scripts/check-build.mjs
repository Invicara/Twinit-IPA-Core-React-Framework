#!/usr/bin/env node
/**
 * Run the package build and fail if it prints any warning.
 *
 * The build was taken to zero warnings deliberately (rollup circular-dependency
 * and mixed-export notices, and 188 Sass deprecations). Zero is only meaningful
 * if it is enforced, because a single new warning is invisible in a passing log.
 *
 * Patterns are deliberately narrow so ordinary output cannot trip them: rollup
 * prefixes warnings with "(!)", Sass with "Deprecation Warning", npm with
 * "npm warn". Verified against a clean build log, which matches none of them.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PKG = path.join(ROOT, 'packages', 'ipa-core');

const PATTERNS = [
  { re: /^\(!\)/m, what: 'rollup warning' },
  { re: /Deprecation Warning/i, what: 'Sass deprecation' },
  { re: /\bnpm warn\b/i, what: 'npm warning' },
  { re: /\[WARNING\]/i, what: 'tooling warning' },
];

const child = spawn('npm', ['run', 'build'], { cwd: PKG, shell: false });
let out = '';
child.stdout.on('data', d => (out += d));
child.stderr.on('data', d => (out += d));

const code = await new Promise(r => child.on('close', r));

if (code !== 0) {
  process.stdout.write(out);
  console.error(`\nBuild failed with exit code ${code}.`);
  process.exit(code);
}

const hits = [];
for (const line of out.split('\n')) {
  for (const p of PATTERNS) {
    if (p.re.test(line)) hits.push(`  [${p.what}] ${line.trim()}`);
  }
}

if (hits.length) {
  console.error(`\nThe build emitted ${hits.length} warning line(s):\n`);
  console.error(hits.slice(0, 40).join('\n'));
  if (hits.length > 40) console.error(`  ... and ${hits.length - 40} more`);
  console.error(`\nThe build is kept at zero warnings. Fix it, or if it is genuinely`);
  console.error(`unavoidable, silence it at source with a comment saying why.\n`);
  process.exit(1);
}

console.log('build ok (0 warnings)');
