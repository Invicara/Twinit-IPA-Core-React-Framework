import json from '@rollup/plugin-json';
import { nodeResolve as resolve } from '@rollup/plugin-node-resolve';
// Convert CJS modules to ES6 so they can be included in bundle
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';
import cleaner from 'rollup-plugin-cleaner';
import image from '@rollup/plugin-image';
import fs from 'fs';
import path from 'path';

// Symlink the large icon/font folders instead of shipping a second copy.
// Plain function, not a plugin: it is sequenced by copyAndSymlink below.
const createSymlinks = () => {
  const symlinks = [
    { target: 'modules/IpaIcons', link: 'esm_modules/IpaIcons' },
    { target: 'modules/IpaFonts', link: 'esm_modules/IpaFonts' },
  ];

  symlinks.forEach(({ target, link }) => {
    const targetPath = path.resolve(target);
    const linkPath = path.resolve(link);

    // Check if target exists
    if (!fs.existsSync(targetPath)) {
      console.warn(`Warning: Target ${targetPath} does not exist, skipping symlink creation`);
      return;
    }

    // Remove existing symlink or directory if it exists
    try {
      if (fs.existsSync(linkPath)) {
        const stats = fs.lstatSync(linkPath);
        if (stats.isSymbolicLink()) {
          fs.unlinkSync(linkPath);
        } else if (stats.isDirectory()) {
          fs.rmSync(linkPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(linkPath);
        }
      }
    } catch (err) {
      // Ignore errors if file doesn't exist
    }

    // Create the directory structure if needed
    const linkDir = path.dirname(linkPath);
    if (!fs.existsSync(linkDir)) {
      fs.mkdirSync(linkDir, { recursive: true });
    }

    // Create symlink using relative path to ensure portability
    const relativeTarget = path.relative(linkDir, targetPath);
    fs.symlinkSync(relativeTarget, linkPath, 'dir');
    console.log(`Created symlink: ${link} -> ${relativeTarget}`);
  });
};

// Copy assets, then symlink -- in one plugin, on purpose.
//
// Both operations previously raced, from two directions. rollup writes the
// `modules` and `esm_modules` outputs concurrently
// (`await Promise.all(outputOptions.map(bundle.write))`), and writeBundle fires
// once per output, so rollup-plugin-copy ran twice at the same time over the
// same destinations; fs-extra's copy unlinks the destination before writing, so
// one pass would unlink a path the other was mid-copy on, giving intermittent
// ENOENT on unlink or chmod. Separately, writeBundle and closeBundle are both
// PARALLEL hooks across plugins, so a symlink step in either one raced copy and
// skipped silently, leaving esm_modules/IpaIcons and IpaFonts uncreated.
//
// Sequencing them inside a single plugin removes both races: within one hook
// this is ordinary control flow that rollup cannot interleave. copyOnce does
// not help, because rollup-plugin-copy sets its `copied` flag only after its
// awaits, so two concurrent invocations both get past the check.
const copyAndSymlink = targets => {
  // rollup-plugin-copy's hook body is a standalone async function that never
  // touches `this`, so we can hold the instance and invoke it ourselves. The
  // hook name is deliberately one rollup never calls.
  const copier = copy({ targets, hook: 'runManually' });
  return {
    name: 'copy-and-symlink',
    async closeBundle() {
      await copier.runManually();
      createSymlinks();
    },
  };
};

//We use a function and not a variable bc multi-module bundle can have trouble with shared plugin instances as per https://github.com/rollup/rollupjs.org/issues/69#issuecomment-306062235
const getPlugins = () => [
  json(),
  resolve({
    mainFields: ['main'],
    extensions: ['.js', '.jsx', '.css', '.scss', '.svg'],
  }),
  postcss({
    // rollup-plugin-postcss 4.x calls Dart Sass's legacy render() API, which
    // warns once per stylesheet (75 times in a full build). The deprecation is
    // the plugin's to fix, not ours, and the plugin is unmaintained. Loader
    // options are spread straight into sass.render, so this silences that one
    // deprecation without hiding any coming from our own stylesheets.
    use: { sass: { silenceDeprecations: ['legacy-js-api'] } },
  }),
  image({ include: ['src/IpaIcons/**/*'] }),
  babel({
    exclude: 'node_modules/**',
    // Explicit rather than inherited: this is the value the plugin already
    // defaults to, stated so it stops warning on every build.
    babelHelpers: 'bundled',
    sourceMaps: false,
    presets: ['@babel/preset-env', '@babel/preset-react'],
    plugins: [
      require('@babel/plugin-transform-object-rest-spread'),
      require('fast-async'),
      ['@babel/plugin-transform-class-properties', { loose: true }],
      ['@babel/plugin-transform-private-methods', { loose: true }],
      ['@babel/plugin-transform-private-property-in-object', { loose: true }],
      //make sure we do not pull the whole material ui
      //https://github.com/avocadowastaken/babel-plugin-direct-import
      [
        'babel-plugin-direct-import',
        {
          modules: ['@mui/material', '@mui/icons-material', '@mui/styles'],
        },
      ],
    ],
  }),
  commonjs(),
  copyAndSymlink([
    { src: 'src/img/**/*', dest: 'modules/img' },
    { src: 'src/img/twinit.svg', dest: 'modules/IpaIcons' },
    { src: 'src/**/*.scss', dest: 'modules/styles' },
    { src: 'src/IpaIcons/**/*', dest: 'modules/IpaIcons' },
    { src: 'src/IpaFonts/**/*', dest: 'modules/IpaFonts' },
    { src: 'src/react-ifef/img/**/*', dest: 'modules/react-ifef/img' },
    { src: 'src/img/**/*', dest: 'esm_modules/img' },
    { src: 'src/*/*.scss', dest: 'esm_modules/styles' },
  ]),
];

//const external = [...Object.keys(pkg.dependencies), /^node:/];
let pkg = JSON.parse(fs.readFileSync('./package.json')),
  external = [
    ...Object.keys(pkg.dependencies || {}),
    'clsx',
    '@dtplatform/ui-utils',
    'uid',
    'query-string',
    'redux',
  ];
/*
const external = ['lodash', 'lodash-es', 'bootstrap', 'classnames',
    'react', 'react-dom', 'react-router', 'react-router-dom', 'react-transition-group',
    '@mui/material', '@material-ui/icons', '@material-ui/lab', '@material-ui/styles', '@material-ui/icons',
    '@nivo/bar', '@nivo/pie', '@nivo/line',
    'file-saver', 'immer', 'interactjs', 'json-schema-faker', 'jszip',
    'mime-types', 'moment', 'prop-types', 'qs', 'object-assign',
    '@reduxjs/toolkit', 'react-redux',
    'react-autosuggest', 'react-click-outside', 'react-css-modules',
    'react-date-picker', 'react-datetime-picker', 'react-dropzone', 'react-is',
    'react-inspector', 'react-select','react-select/creatable', 'react-table',
    '@dtplatform/platform-api',
    '@invicara/script-data', '@invicara/script-iaf', '@invicara/script-ui',
    'app-root-path', 'json5',

]
*/

export default {
  // ScriptHelper.evalExpressions() evaluates caller-supplied expression
  // strings; that eval is the scripting feature, not an oversight. Scoped to
  // that one module and that one warning code, so an accidental eval
  // anywhere else still shows up.
  onwarn(warning, warn) {
    if (warning.code === 'EVAL' && warning.id && warning.id.includes('IpaUtils/ScriptHelper'))
      return;
    // Entries that export a default alongside named exports. Deliberate:
    // consumers reach the default through .default, which is the published
    // API. Unlike the warning above, rollup does not gate this one on
    // output.exports, and the suggested 'named' would change what the
    // default-only entries emit, so it is filtered here instead.
    if (warning.code === 'MIXED_EXPORTS') return;
    warn(warning);
  },
  input: {
    index: 'src/main.js',
    IpaControls: 'src/IpaControls/main.js',
    IpaUtils: 'src/IpaUtils/main.js',
    IpaDialogs: 'src/IpaDialogs/main.js',
    IpaPageComponents: 'src/IpaPageComponents/main.js',
    IpaRedux: 'src/redux/main.js',
    IpaLayouts: 'src/IpaLayouts/main.js',
    IpaMock: 'src/IpaMock/main.js',
    'react-ifef': 'src/react-ifef/main.js',
  },
  output: [
    {
      dir: 'modules',
      format: 'cjs',
      name: 'IpaControls',
      sourcemap: false,
      // Already the implicit default, stated explicitly. rollup gates its
      // "implicitly using default export mode" warning on this option being
      // unset, so naming it silences that warning and emits identical code.
      // NOT 'named': that would force the two default-only entries
      // (src/main.js and src/react-ifef/main.js) from `module.exports = X`
      // to `exports.default = X`, breaking every CommonJS consumer.
      exports: 'auto',
      // Keep import() as import() in the CommonJS build rather than rewriting
      // it to Promise.resolve().then(() => require(t)) inside an IIFE, which
      // hides the request behind an opaque parameter. A consumer bundling us
      // with webpack then builds no context for it at all and the dynamic
      // import resolves nothing. This is rollup's default from v3 onward and
      // is stated explicitly because the page component loader depends on it;
      // rollup 2 had no such option, which is why that upgrade came with this.
      dynamicImportInCjs: true,
      // Restores the interop helpers rollup 2 emitted. Rollup 3 changed the
      // default of this option from "auto" to "default", which assumes every
      // CommonJS dependency has a real ESM default export and therefore drops
      // the _interopDefaultLegacy wrappers. That is wrong for the many CJS
      // packages that compile to `exports.default = x`: the import then
      // resolves to the module namespace instead of the function.
      //
      // It broke ipa-dt in 3.0.88-alpha.1 with "TypeError: vn is not a
      // function", thrown while the vendor chunk initialised, before React
      // mounted, so the page rendered blank. The call site was
      // `withStyles({...})(Component)` against
      // @mui/styles/withStyles/withStyles.js, which is exactly that shape.
      //
      // "compat" is the setting that matches rollup 2's behaviour: use the
      // default export when the module looks like ESM, fall back to the
      // namespace otherwise.
      interop: 'compat',
      entryFileNames: chunkInfo => {
        // Output index.js at root, others in subdirectories
        return chunkInfo.name === 'index' ? 'index.js' : '[name]/index.js';
      },
      chunkFileNames: '[name]-[hash].js',
    },
    {
      dir: 'esm_modules',
      format: 'esm',
      name: 'IpaControls',
      sourcemap: false,
      entryFileNames: chunkInfo => {
        // Output index.js at root, others in subdirectories
        return chunkInfo.name === 'index' ? 'index.js' : '[name]/index.js';
      },
      chunkFileNames: '[name]-[hash].js',
    },
  ],
  plugins: [
    cleaner({ targets: ['./modules'] }),
    cleaner({ targets: ['./esm_modules'] }),
    cleaner({ targets: ['./dist'] }),
    ...getPlugins(),
  ],
  preserveSymlinks: true,
  //https://gist.github.com/developit/41f088b6294e2591f53b
  //The external key accepts either an array of module names,
  // or a function which takes the module name and returns true if it should be treated as external.
  // For example: external: id => /lodash/.test(id)
  external: id => {
    const declared = external.find(function (pattern) {
      return new RegExp('^' + pattern).test(id);
    });
    if (!declared && id.indexOf('/') !== 0 && id.indexOf('.') !== 0 && id.indexOf('src') !== 0) {
      console.log('not declared dep:', id);
    }
    return declared;
  },
};
