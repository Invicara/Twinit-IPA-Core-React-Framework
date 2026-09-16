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
    ],
  },

  js.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],

  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        // config.js is written at deploy time and read as a global.
        endPointConfig: 'readonly',
        // react-ifef carries its Ionic heritage and feature-detects cordova.
        cordova: 'readonly',
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

      // eslint-plugin-react-hooks 7 ships the React Compiler rules in its
      // recommended set. They are good guidance, but they describe compiler
      // readiness rather than defects you can hit in React 18, and they report
      // 45 hits against components written years before the rules existed.
      // Warnings now; promote them if a React Compiler migration is ever on.
      'react-hooks/set-state-in-effect': 'warn', // 24
      'react-hooks/immutability': 'warn', // 14
      'react-hooks/refs': 'warn', // 7

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

  // Must stay last: switches off everything that would argue with prettier.
  prettier,
];
