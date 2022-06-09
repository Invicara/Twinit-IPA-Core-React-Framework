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
import babel from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';
import copy from "rollup-plugin-copy";
import cleaner from 'rollup-plugin-cleaner';
import image from '@rollup/plugin-image';
import pkg from './package.json'

//We use a function and not a variable bc multi-module bundle can have trouble with shared plugin instances as per https://github.com/rollup/rollupjs.org/issues/69#issuecomment-306062235
const getPlugins = () => [
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
            ["@babel/plugin-proposal-class-properties", {"loose": true}]
        ]
    }),
    commonjs(),
    copy({
        targets: [
            {src: 'src/img/**/*', dest: 'modules/img'},
            {src: 'src/*/*.scss', dest: 'modules/styles'},
            {src: 'src/IpaIcons/**/*', dest: 'modules/IpaIcons'}
        ]
    })]

const external = [...Object.keys(pkg.dependencies), /^node:/];
/*
const external = ['lodash', 'lodash-es', 'bootstrap', 'classnames',
    'react', 'react-dom', 'react-router', 'react-router-dom', 'react-transition-group',
    '@material-ui/core', '@material-ui/icons', '@material-ui/lab', '@material-ui/styles', '@material-ui/icons',
    '@nivo/bar', '@nivo/pie', '@nivo/line',
    'file-saver', 'immer', 'interactjs', 'json-schema-faker', 'jszip',
    'mime-types', 'moment', 'prop-types', 'qs', 'object-assign',
    '@reduxjs/toolkit', 'react-redux',
    'react-autosuggest', 'react-click-outside', 'react-css-modules',
    'react-date-picker', 'react-datetime-picker', 'react-dropzone', 'react-is',
    'react-inspector', 'react-select','react-select/creatable', 'react-table',
    '@invicara/expressions', '@invicara/platform-api', '@invicara/react-ifef',
    '@invicara/script-data', '@invicara/script-iaf', '@invicara/script-ui',
    'app-root-path', 'json5',
]
*/

export default {
    input: {
        'IpaControls':'src/IpaControls/main.js',
        'IpaUtils':'src/IpaUtils/main.js',
        'IpaDialogs':'src/IpaDialogs/main.js',
        'IpaPageComponents':'src/IpaPageComponents/main.js',
        'IpaRedux':'src/redux/main.js',
        'IpaLayouts':'src/IpaLayouts/main.js',
    },
    output: {
        dir: 'modules',
        format: 'cjs',
        name: 'IpaControls',
        sourcemap: false,
        entryFileNames: '[name]/index.js',
    },
    plugins: [
        cleaner({targets: ['./modules']}),
        cleaner({targets: ['./dist']}),
        ...getPlugins()
    ],
    //https://stackoverflow.com/questions/44844088/how-to-set-as-external-all-node-modules-in-rollup
    external: external.filter(
        // Bundle modules that do not properly support ES
        (dep) => !["@sendgrid/mail", "http-errors"].includes(dep),
    ),

    // Suppress warnings in 3rd party libraries
    onwarn(warning, warn) {
        if (
            !(
                warning.id?.includes("node_modules") ||
                warning.message?.startsWith("Unknown CLI flags: env.")
            )
        ) {
            warn(warning);
        }
    },
};
