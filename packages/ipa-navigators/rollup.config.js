import json from 'rollup-plugin-json'
import resolve from 'rollup-plugin-node-resolve'
// Convert CJS modules to ES6 so they can be included in bundle
import commonjs from 'rollup-plugin-commonjs'
import babel from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';
import copy from "rollup-plugin-copy";
import cleaner from 'rollup-plugin-cleaner';
import fs from 'fs';
//import pkg from './package.json'

//We use a function and not a variable bc multi-module bundle can have trouble with shared plugin instances as per https://github.com/rollup/rollupjs.org/issues/69#issuecomment-306062235
const getPlugins = () => [
    json(),
    resolve({
        mainFields: ['main'],
        extensions: ['.js', '.jsx', '.css', '.scss', '.svg']
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
            {src: 'src/img/**/*', dest: 'modules/img'},
            {src: 'src/*/*.scss', dest: 'modules/styles'}
        ]
    })]

//const external = [...Object.keys(pkg.dependencies), /^node:/];
let pkg = JSON.parse(fs.readFileSync('./package.json')),
    external = [...Object.keys(pkg.dependencies || {}),"clsx","@invicara/ui-utils","uid", "query-string", "redux"];

export default {
    input: {
        'IpaNavigators':'src/navigators/main.js',
    },
    output: {
        dir: 'modules',
        format: 'cjs',
        name: 'IpaNavigators',
        sourcemap: false,
        entryFileNames: '[name]/index.js',
    },
    plugins: [
        cleaner({targets: ['./modules']}),
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
