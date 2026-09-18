import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/**
 * Flat config (ESLint 10). Replaces the old .eslintrc.json, which could not run
 * at all: it extended plugin:prettier/recommended while neither prettier nor
 * eslint-plugin-prettier was installed.
 *
 * The aim is a lint run people will actually act on. Rules that flag real
 * defects are errors; rules that would report thousands of pre-existing stylistic
 * hits across 326 files are off, each with the reason. Turning those on later is
 * a deliberate cleanup, not a prerequisite for using this today.
 */
export default [
  {
    ignores: [
      '**/node_modules/**',
      // Build output: rollup writes these, they are not sources.
      'packages/*/modules/**',
      'packages/*/esm_modules/**',
      'packages/*/dist/**',
      '**/*.min.js',
      // Vendored Ionicons, carried verbatim from upstream.
      'packages/*/src/react-ifef/scss/**',
      // Vendored Snap.js (one a local fork for the side panel). Third-party
      // UMD source; its own `module` shim collides with ours and nobody is
      // going to restyle upstream code.
      'packages/*/src/react-ifef/helpers/snap.js',
      'packages/*/src/lib/snap-invicara.js',
    ],
  },

  js.configs.recommended,
  react.configs.flat.recommended,
  // NOT react.configs.flat['jsx-runtime']. That preset is for the automatic JSX
  // transform, and babel.config.js here is [preset-env, preset-react] with no
  // runtime option, which in Babel 7 means the CLASSIC transform: the build
  // emits React.createElement (69 of them in IpaLayouts alone), so every JSX
  // file genuinely needs React in scope. With the preset on, the linter
  // reported 'React is defined but never used' in 124 files and invited
  // deleting an import the build depends on.

  // Applies to every file rather than only to the JS/JSX block below, because
  // the react configs above are unscoped: without this, linting a file they
  // cover but that block does not (eslint.config.mjs itself, anything under
  // scripts/) prints "React version not specified" on every run.
  { settings: { react: { version: '18.2' } } },

  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        // config.js is written at deploy time and read as a global.
        endPointConfig: 'readonly',
        // version.js is written by build.sh at deploy time and loaded as a
        // plain script, same arrangement as endPointConfig above.
        version: 'readonly',
        // react-ifef carries its Ionic heritage and feature-detects cordova.
        cordova: 'readonly',
        // Supplied by the bundler, not by the browser. require() is used for
        // webpack asset imports (Logo.jsx) and for the dynamic plugin loading
        // in AppProvider that reaches into the consuming app; process and
        // module come from the same shim layer. Declared so genuine typos are
        // still caught while these legitimate uses are not.
        require: 'readonly',
        module: 'readonly',
        process: 'readonly',
        // Optional host global, only ever read behind a typeof guard.
        Meteor: 'readonly',
      },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { 'react-hooks': reactHooks },
    settings: { react: { version: '18.2' } },
    rules: {
      ...reactHooks.configs.recommended.rules,

      // --- real defects, kept as errors -------------------------------------
      // These fail the build because each one is a bug you can hit at runtime.
      // no-undef alone already caught <MenuItem> being rendered in
      // EntityTableContainer.jsx without ever being imported.
      'react-hooks/rules-of-hooks': 'error',
      'react/jsx-key': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-no-target-blank': 'error',
      // item_id is a deliberate DOM attribute, documented in Item.jsx as "our
      // universal identifier" and nothing in the codebase reads it, so it is
      // most likely a hook for external tooling. Allowed by name so that real
      // typos like class-instead-of-className still fail.
      'react/no-unknown-property': ['error', { ignore: ['item_id'] }],

      // --- signal, but too noisy to block on today --------------------------
      // The counts below are from the first run over 326 files. They are warnings
      // so the error list stays actionable; promoting them is a cleanup task,
      // and `eslint --fix` handles most of no-var on its own.
      'no-unused-vars': ['warn', { args: 'none', ignoreRestSiblings: true }], // 255
      'no-var': 'warn', // 206, nearly all auto-fixable
      eqeqeq: ['warn', 'smart'], // 143
      'no-console': ['warn', { allow: ['warn', 'error'] }], // 64
      'react-hooks/exhaustive-deps': 'warn', // 52, often real but predates the rule
      'no-extra-boolean-cast': 'warn', // 25
      'no-prototype-builtins': 'warn', // 18
      'no-useless-assignment': 'warn', // 14
      'react/no-unescaped-entities': 'warn', // 8
      // Both are about expression rather than correctness: children-as-prop
      // renders identically to nesting, and a redundant escape inside a
      // character class matches the same thing. Not worth touching a validated
      // email regex or restructuring working JSX to satisfy.
      'react/no-children-prop': 'warn', // 2
      'no-useless-escape': 'warn', // 2

      // eslint-plugin-react-hooks 7 ships the React Compiler rules in its
      // recommended set. They are good guidance, but they describe compiler
      // readiness rather than defects you can hit in React 18, and they report
      // 45 hits against components written years before the rules existed.
      // Warnings now; promote them if a React Compiler migration is ever on.
      'react-hooks/set-state-in-effect': 'warn', // 24
      'react-hooks/immutability': 'warn', // 14
      'react-hooks/refs': 'warn', // 7
      'react-hooks/use-memo': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',

      // --- off, with reasons ------------------------------------------------
      // This is a JS codebase with no propTypes discipline; enabling it reports
      // essentially every component prop. A types migration would supersede it.
      'react/prop-types': 'off',
      // react-ifef wraps legacy Ionic markup and needs string refs/find-dom-node
      // in places; flagging them does not lead to a fix anyone will make.
      'react/no-find-dom-node': 'off',
      'react/display-name': 'off',
    },
  },

  // Tests and Storybook: jest and node globals, and looser on console.
  {
    files: ['**/*.test.{js,jsx}', '**/*.stories.{js,jsx}', '**/src/test/**'],
    languageOptions: { globals: { ...globals.jest, ...globals.node } },
    rules: { 'no-console': 'off' },
  },

  // Storybook compiles with preset-react { runtime: 'automatic' } of its own
  // (.storybook/main.js), unlike the package build, so stories really do not
  // need React in scope and the rule above does not apply to them.
  {
    files: ['**/*.stories.{js,jsx}', '**/.storybook/**'],
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
    },
  },

  // Tooling that runs in node and is written as CommonJS.
  {
    files: ['**/babel.config.js', '**/jest.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: { 'no-console': 'off' },
  },

  // Tooling that runs in node but is written as ESM, and in several cases
  // mixes in require() as well: the rollup configs load babel plugins that way,
  // and the Storybook and docs files do the same. sourceType stays module so
  // their import/export parses; node globals cover the require() calls.
  {
    files: ['packages/*/rollup*.js', '**/.storybook/**', '**/docs/**'],
    languageOptions: {
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: { 'no-console': 'off' },
  },

  // Repo tooling: ESM, runs in node, and legitimately writes to stdout.
  {
    files: ['scripts/**/*.mjs', 'eslint.config.mjs'],
    languageOptions: {
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: { 'no-console': 'off' },
  },

  // Must stay last: switches off everything that would argue with prettier.
  prettier,
];
