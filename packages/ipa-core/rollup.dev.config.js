import json from 'rollup-plugin-json'
import resolve from 'rollup-plugin-node-resolve'
// Convert CJS modules to ES6 so they can be included in bundle
import commonjs from 'rollup-plugin-commonjs'
import babel from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';
import copy from "rollup-plugin-copy";
import cleaner from 'rollup-plugin-cleaner';
import image from '@rollup/plugin-image';
import pkg from './package.json'

const externals =  [...Object.keys(pkg.dependencies || {}),"clsx","@invicara/ui-utils","uid", "query-string", "redux"];

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/ipa-core.js',
    format: 'cjs',
    name: 'DTFFCore',
    sourcemap: false
  },

  plugins: [
    cleaner({targets: ['./dist']}),
    json(),
    resolve({
      mainFields: ['main'],
      extensions: ['.js', '.jsx', '.css', '.scss', '.svg']
    }),
    postcss(),
    image({include:['src/IpaIcons/**/*']}),
    babel({
      exclude: 'node_modules/**',
      sourceMaps: false,
      presets: [
        "@babel/preset-env",
        "@babel/preset-react"
      ],
      plugins: [
        require("@babel/plugin-proposal-object-rest-spread"),
        require("fast-async"),
        ["@babel/plugin-proposal-class-properties", { "loose": true }]
      ]
    }),
    commonjs(),
    copy({
      targets: [
        {src: 'src/img/**/*', dest: 'dist/img'},
        {src: 'src/*/*.scss', dest: 'dist/styles'}
      ]
    })
  ],
  //https://gist.github.com/developit/41f088b6294e2591f53b
  //The external key accepts either an array of module names,
  // or a function which takes the module name and returns true if it should be treated as external.
  // For example: external: id => /lodash/.test(id)
  external: (id) => {
    const declared = externals.find(function(pattern) {
      return new RegExp("^"+pattern).test(id);
    })
    if(!declared && id.indexOf('/') !== 0 && id.indexOf('.') !== 0 && id.indexOf('src') !==0){
      console.log("not declared dep:",id)
    }
    return declared;
  }
  /*
  external: [
    'lodash', 'bootstrap', 'classnames',
    'react', 'react-dom', 'react-router', 'react-router-dom', 'react-transition-group',
    '@material-ui/core', '@material-ui/icons', '@material-ui/lab', '@material-ui/styles',
    '@nivo/bar', '@nivo/pie', '@nivo/line',
    'file-saver', 'immer', 'interactjs', 'json-schema-faker', 'jszip',
    'mime-types', 'moment', 'prop-types', 'qs', 'object-assign',
    '@reduxjs/toolkit', 'react-redux',
    'react-autosuggest', 'react-click-outside', 'react-css-modules',
    'react-date-picker', 'react-datetime-picker', 'react-dropzone', 'react-is',
    'react-inspector', 'react-select', 'react-table',
    '@invicara/expressions', '@invicara/platform-api',
    '@invicara/script-data', '@invicara/script-iaf', '@invicara/script-ui',
    'app-root-path'
  ]
  */
};
