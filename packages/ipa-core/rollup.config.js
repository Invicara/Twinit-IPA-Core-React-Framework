/**
 * ****************************************************************************
 *
 * INVICARA INC CONFIDENTIAL __________________
 *
 * Copyright (C) [2012] - [2019] INVICARA INC, INVICARA Pte Ltd, INVICARA INDIA
 * PVT LTD All Rights Reserved.
 *
 * NOTICE: All information contained herein is, and remains the property of
 * Invicara Inc and its suppliers, if any. The intellectual and technical
 * concepts contained herein are proprietary to Invicara Inc and its suppliers
 * and may be covered by U.S. and Foreign Patents, patents in process, and are
 * protected by trade secret or copyright law. Dissemination of this information
 * or reproduction of this material is strictly forbidden unless prior written
 * permission is obtained from Invicara Inc.
 */

import json from 'rollup-plugin-json'
import resolve from 'rollup-plugin-node-resolve'
// Convert CJS modules to ES6 so they can be included in bundle
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel';
import postcss from 'rollup-plugin-postcss';
import copy from "rollup-plugin-copy";
import cleaner from 'rollup-plugin-cleaner';

//We use a function and not a variable bc multi-module bundle can have trouble with shared plugin instances as per https://github.com/rollup/rollupjs.org/issues/69#issuecomment-306062235
const getPlugins = () => [
    json(),
    resolve({
        mainFields: ['main'],
        extensions: ['.js', '.jsx', '.css', '.scss']
    }),
    postcss(),
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
            ["@babel/plugin-proposal-class-properties", {"loose": true}]
        ]
    }),
    commonjs(),
    copy({
        targets: [
            {src: 'src/img/**/*', dest: 'dist/img'},
            {src: 'src/*/*.scss', dest: 'dist/styles'}
        ]
    })]

const external = ['lodash', 'bootstrap', 'classnames',
    'react', 'react-dom', 'react-router', 'react-router-dom', 'react-transition-group',
    '@material-ui/core', '@material-ui/icons', '@material-ui/lab', '@material-ui/styles',
    '@nivo/bar', '@nivo/pie', '@nivo/line',
    'file-saver', 'immer', 'interactjs', 'json-schema-faker', 'jszip',
    'mime-types', 'moment', 'prop-types', 'qs', 'object-assign',
    '@reduxjs/toolkit', 'react-redux',
    'react-autosuggest', 'react-click-outside', 'react-css-modules',
    'react-date-picker', 'react-datetime-picker', 'react-dropzone', 'react-is',
    'react-inspector', 'react-select', 'react-table',
    '@invicara/expressions', '@invicara/platform-api', '@invicara/react-ifef',
    '@invicara/script-data', '@invicara/script-iaf', '@invicara/script-ui',
    'app-root-path', 'json5']

export default [{
    input: 'src/main.js',
    output: {
        file: 'dist/index.js',
        format: 'cjs',
        name: 'Main',
        sourcemap: false
    },
    plugins: [
        cleaner({targets: ['./dist']}),
        ...getPlugins()
    ],
    external
}, {
    input: 'src/IpaControls/main.js',
    output: {
        file: 'modules/IpaControls/index.js',
        format: 'cjs',
        name: 'IpaControls',
        sourcemap: false
    },
    plugins: [
        cleaner({targets: ['./modules']}),
      ...getPlugins()
    ],
    external
}, {
  input: 'src/IpaDialogs/main.js',
  output: {
    file: 'modules/IpaDialogs/index.js',
    format: 'cjs',
    name: 'IpaDialogs',
    sourcemap: false
  },
  plugins: getPlugins(),
  external
}, {
  input: 'src/IpaPageComponents/main.js',
  output: {
    file: 'modules/IpaPageComponents/index.js',
    format: 'cjs',
    name: 'IpaPageComponents',
    sourcemap: false
  },
  plugins: getPlugins(),
  external
}, {
    input: 'src/IpaUtils/main.js',
    output: {
        file: 'modules/IpaUtils/index.js',
        format: 'cjs',
        name: 'C',
        sourcemap: false
    },
    plugins: getPlugins(),
    external
},{
  input: 'src/redux/main.js',
  output: {
    file: 'modules/IpaRedux/index.js',
    format: 'cjs',
    name: 'IpaRedux',
    sourcemap: false
  },
  plugins: getPlugins(),
  external
}];
