import React from 'react';

/**
 * The header and side navigation this framework ships, so that a userConfig can
 * name one without the application declaring anything.
 *
 * It mirrors how page components resolve (AppProvider.getPageComponent): the
 * name is tried against the application first, and falls back to the framework.
 * An application that wants the supplied chrome names it and writes no code; an
 * application that wants its own puts a file at that path, and its file wins.
 *
 *   "headerComponent": "GlobalHeader"                     the supplied one
 *   "headerComponent": "components/MyHeader"           the application's own
 *
 * They are imported by this package's own subpath rather than relatively. That
 * looks redundant but it is what keeps the import() dynamic: rollup preserves
 * import() only for specifiers it treats as external, and rewrites an internal
 * one to a static require in the CJS build, which a webpack consumer then loads
 * eagerly whatever the userConfig says. The subpaths are declared in this
 * package's exports and built as their own entry points.
 *
 * The entries are import() thunks rather than imported components on purpose.
 * InternalPages imports its pages at the top of the file, which is fine because
 * they are already part of this bundle, but GlobalHeader pulls ipa-ui's
 * stylesheet, and that stylesheet sets rules on `*` and `body`. Imported
 * eagerly here it would reach every application through AppProvider, including
 * the ones that never render it. As thunks, webpack keeps each in its own chunk
 * and nothing is fetched until a userConfig asks for it.
 */
const INTERNAL_CHROME = {
  GlobalHeader: () => import('@invicara/ipa-core/GlobalHeader'),
  GlobalNav: () => import('@invicara/ipa-core/GlobalNav'),
};

/**
 * React.lazy returns a new component type on each call, and callers resolve
 * inside render(), so an uncached lazy would give React a different type every
 * render and remount the chrome each time.
 */
const cache = new Map();

/** The names a userConfig can use, for error messages. */
export const internalChromeNames = Object.keys(INTERNAL_CHROME);

/**
 * The framework component for this name, or null if the name is not one of
 * ours. Callers try the application's own folder first and come here only when
 * that lookup fails, so an application can still shadow these names.
 */
export default function getInternalChrome(name) {
  if (!name || !INTERNAL_CHROME[name]) return null;
  if (!cache.has(name)) cache.set(name, React.lazy(INTERNAL_CHROME[name]));
  return cache.get(name);
}
