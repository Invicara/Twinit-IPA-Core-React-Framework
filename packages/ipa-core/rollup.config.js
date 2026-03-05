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
import path from 'path';

const rootDir = path.resolve(__dirname);

// Custom plugin to create symlinks for large folders to avoid duplication
const createSymlinksPlugin = () => ({
    name: 'create-symlinks',
    writeBundle() {
        const symlinks = [
            { target: 'modules/IpaIcons', link: 'esm_modules/IpaIcons' },
            { target: 'modules/IpaFonts', link: 'esm_modules/IpaFonts' }
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
    }
});

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
            ["@babel/plugin-transform-private-methods", { "loose": true }],
            ["@babel/plugin-transform-private-property-in-object", { "loose": true }],
            //make sure we do not pull the whole material ui
            //https://github.com/avocadowastaken/babel-plugin-direct-import
            [
                "babel-plugin-direct-import",
                {
                    "modules": [
                        "@mui/material",
                        "@mui/icons-material",
                        "@mui/styles"
                    ]
                }
            ]
        ]
    }),
    commonjs(),
    copy({
        targets: [
            { src: path.join(rootDir, 'src/img/**/*'), dest: path.join(rootDir, 'modules/img') },
            { src: path.join(rootDir, 'src/img/twinit.svg'), dest: path.join(rootDir, 'modules/IpaIcons') },
            { src: path.join(rootDir, 'src/**/*.scss'), dest: path.join(rootDir, 'modules/styles') },
            { src: path.join(rootDir, 'src/IpaIcons/**/*'), dest: path.join(rootDir, 'modules/IpaIcons') },
            { src: path.join(rootDir, 'src/IpaFonts/**/*'), dest: path.join(rootDir, 'modules/IpaFonts') },
            { src: path.join(rootDir, 'src/react-ifef/img/**/*'), dest: path.join(rootDir, 'modules/react-ifef/img') },
            { src: path.join(rootDir, 'src/img/**/*'), dest: path.join(rootDir, 'esm_modules/img') },
            { src: path.join(rootDir, 'src/*/*.scss'), dest: path.join(rootDir, 'esm_modules/styles') },
        ],
        hook: 'writeBundle',
        copySync: true
    }),
    // Create symlinks after copying to avoid duplicating large folders
    createSymlinksPlugin()]

//const external = [...Object.keys(pkg.dependencies), /^node:/];
let pkg = JSON.parse(fs.readFileSync('./package.json')),
    external = [...Object.keys(pkg.dependencies || {}),"clsx","@dtplatform/ui-utils","uid", "query-string", "redux"];
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
    input: {
        'index': 'src/main.js',
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
        entryFileNames: (chunkInfo) => {
            // Output index.js at root, others in subdirectories
            return chunkInfo.name === 'index' ? 'index.js' : '[name]/index.js';
        },
        chunkFileNames: '[name]-[hash].js',
    },{
        dir: 'esm_modules',
        format: 'esm',
        name: 'IpaControls',
        sourcemap: false,
        entryFileNames: (chunkInfo) => {
            // Output index.js at root, others in subdirectories
            return chunkInfo.name === 'index' ? 'index.js' : '[name]/index.js';
        },
        chunkFileNames: '[name]-[hash].js',
    }],
    plugins: [
        cleaner({targets: ['./modules']}),
        cleaner({targets: ['./esm_modules']}),
        cleaner({targets: ['./dist']}),
        ...getPlugins()
    ],
    preserveSymlinks: true,
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
