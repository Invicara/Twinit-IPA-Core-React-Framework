#!/usr/bin/env node
/**
 * Resolve the dependency tree the way CI does, and fail on a peer conflict.
 *
 * Both workflows install with `npm install --no-package-lock`, so CI ignores
 * package-lock.json and re-resolves from scratch. A tree that installs fine
 * locally can therefore fail outright in CI: the lockfile can record a nested
 * placement that satisfies an awkward peer range, while a fresh resolve hoists
 * a different version and hits ERESOLVE.
 *
 * That is not hypothetical. Upgrading rollup to 4 left @rollup/plugin-image at
 * 2.x, which peers rollup "^1.20.0 || ^2.0.0". Locally rollup 2.80 stayed at the
 * root for it and rollup 4 sat nested under packages/ipa-core, so every build
 * passed. CI failed on install, before building anything, and none of the other
 * checks noticed because they all run against the installed tree.
 *
 * --dry-run resolves without writing to node_modules or the lockfile.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

const child = spawn('npm', ['install', '--no-package-lock', '--dry-run'], {
  cwd: ROOT,
  shell: false,
});

let out = '';
child.stdout.on('data', d => (out += d));
child.stderr.on('data', d => (out += d));

const code = await new Promise(r => child.on('close', r));

if (code !== 0) {
  console.error(out.trim());
  console.error(
    `\nThe dependency tree does not resolve without the lockfile, which is how CI\n` +
      `installs. Fix the peer range rather than the lockfile: bump whichever package\n` +
      `declares the conflicting peer, since a lockfile that happens to place things\n` +
      `acceptably will not save the CI install.\n`
  );
  process.exit(1);
}

console.log('resolve ok (lockfile-less tree resolves, as CI installs it)');
