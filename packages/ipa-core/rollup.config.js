import json from 'rollup-plugin-json'
import resolve from 'rollup-plugin-node-resolve'
// Convert CJS modules to ES6 so they can be included in bundle
import commonjs from 'rollup-plugin-commonjs'
import babel from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';
import copy from "rollup-plugin-copy";
import cleaner from 'rollup-plugin-cleaner';
import image from '@rollup/plugin-image';
import fs from 'fs';

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
            ["@babel/plugin-proposal-class-properties", {"loose": true}],
            //make sure we do not pull the whole material ui
            //https://github.com/avocadowastaken/babel-plugin-direct-import
            [
                "babel-plugin-direct-import",
                {
                    "modules": [
                        "@material-ui/lab",
                        "@material-ui/core",
                        "@material-ui/icons",
                        "@material-ui/system"
                    ]
                }
            ]
        ]
    }),
    commonjs(),
    copy({
        targets: [
            {src: 'src/img/**/*', dest: 'modules/img'},
            {src: 'src/**/*.scss', dest: 'modules/styles'},
            {src: 'src/IpaIcons/**/*', dest: 'modules/IpaIcons'},
            {src: 'src/IpaFonts/**/*', dest: 'modules/IpaFonts'},
            {src: 'src/react-ifef/img/**/*', dest: 'modules/react-ifef/img'},
            {src: 'src/img/**/*', dest: 'esm_modules/img'},
            {src: 'src/*/*.scss', dest: 'esm_modules/styles'},
            {src: 'src/IpaIcons/**/*', dest: 'esm_modules/IpaIcons'},
            {src: 'src/IpaFonts/**/*', dest: 'esm_modules/IpaFonts'},
        ]
    })]

//const external = [...Object.keys(pkg.dependencies), /^node:/];
let pkg = JSON.parse(fs.readFileSync('./package.json')),
    external = [...Object.keys(pkg.dependencies || {}),"clsx","@dtplatform/ui-utils","uid", "query-string", "redux"];
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
    '@dtplatform/platform-api',
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
        'IpaMock':'src/IpaMock/main.js',
        'react-ifef':'src/react-ifef/main.js',
    },
    output: [{
        dir: 'modules',
        format: 'cjs',
        name: 'IpaControls',
        sourcemap: false,
        entryFileNames: '[name]/index.js',
    },{
        dir: 'esm_modules',
        format: 'esm',
        name: 'IpaControls',
        sourcemap: false,
        entryFileNames: '[name]/index.js',
    }],
    plugins: [
        cleaner({targets: ['./modules']}),
        cleaner({targets: ['./esm-modules']}),
        cleaner({targets: ['./dist']}),
        ...getPlugins()
    ],
    //https://gist.github.com/developit/41f088b6294e2591f53b
    //The external key accepts either an array of module names,
    // or a function which takes the module name and returns true if it should be treated as external.
    // For example: external: id => /lodash/.test(id)
    external: (id) => {
        const declared = external.find(function(pattern) {
            return new RegExp("^"+pattern).test(id);
        })
        if(!declared && id.indexOf('/') !== 0 && id.indexOf('.') !== 0 && id.indexOf('src') !==0){
            console.log("not declared dep:",id)
        }
        return declared;
    }
};
