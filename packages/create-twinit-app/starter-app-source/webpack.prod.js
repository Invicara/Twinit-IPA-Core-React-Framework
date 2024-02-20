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

const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

const media = [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/];
const fonts = [/\.(eot|ttf|woff)$/];

 
 module.exports = {
   entry: ['regenerator-runtime/runtime', './app/client/index.jsx'],
   output: {
     filename: 'index.[chunkhash:8].js',
     sourceMapFilename: "index.[chunkhash:8].js.map",
     path: path.resolve(__dirname, 'build'),
     publicPath: '',
     clean: true
   },
   mode: 'production',
   optimization: {
     minimizer: [
       new TerserJSPlugin({
         terserOptions: {
           keep_fnames: true,
         },
       }),
     ],
     splitChunks: {
       chunks: 'all',
     },
   },
   plugins: [
     new CleanWebpackPlugin(),
     new HtmlWebpackPlugin({
       template: 'app/public/index.html',
       inject: 'body'
     }),
     //select which assets you need to serve
     new CopyWebpackPlugin({
       patterns: [
       {from: 'app/public/logo_32px.png', to: 'logo_32px.png'},
       {from: 'app/public/config.js', to: 'config.js'},
       {from: 'app/public/version.js', to: 'version.js'},
       {from: 'app/public/helpers.js', to: 'helpers.js'},
       {from: 'app/public/logo.png', to: 'logo.png'},
       {from: 'app/public/assets.png', to: 'assets.png'},
       {from: 'app/public/navigator.png', to: 'navigator.png'},
       {from: 'app/public/spaces.png', to: 'spaces.png'},
       {from: 'app/public/docs.png', to: 'docs.png'},
       {from: 'app/public/icons', to: 'icons'},
       {from: 'app/public/fonts', to: 'fonts'},
       {from: 'node_modules/@invicara/iaf-viewer/dist/lib/', to: 'lib/', toType: 'dir'},
       {from: 'app/public/simple_navigator.png', to: 'simple_navigator.png'},
       {from: 'app/public/simple_buildingPerformance.png', to: 'simple_buildingPerformance.png'},
       {from: 'app/public/simple_comfortWellness.png', to: 'simple_comfortWellness.png'},
       {from: 'app/public/simple_files.png', to: 'simple_files.png'},
       {from: 'app/public/simple_smartBuilding.png', to: 'simple_smartBuilding.png'},
       {from: 'app/public/simple_spaces.png', to: 'simple_spaces.png'},
       {from: 'app/public/simple_assets.png', to: 'simple_assets.png'},
     ]}),
     new NodePolyfillPlugin()
   ],
   resolve: {
     extensions: ['.js', '.jsx', '.json'],
     fallback: {
       fs: false
     },
     symlinks: false, //this will enable npm link
     alias: {
       '../../../../app/ipaCore/scriptPlugins': path.resolve(__dirname, "app/ipaCore/scriptPlugins"),
       '../../../../app/ipaCore/redux': path.resolve(__dirname, "app/ipaCore/redux"),
       '../../../../app/ipaCore/css': path.resolve(__dirname, "app/ipaCore/css"),
       '../../../../app/ipaCore/components': path.resolve(__dirname, "app/ipaCore/components"),
       '../../../../app/ipaCore/pageComponents': path.resolve(__dirname, "app/ipaCore/pageComponents")
     }
   },
   module: {
     rules: [
       {
         exclude: [
           /\.html$/,
           /\.(js|jsx|mjs)$/,
           /\.css$/,
           /\.scss$/,
           /\.less$/,
           /\.json$/,
           /\.(glsl|vs|fs)$/,
         ].concat(media).concat(fonts),
         type: "javascript/auto",
         use: {
           loader: 'file-loader',
           options: {
              name: 'static/media/[name].[hash:8].[ext]',
           },
         }
       },
       {
         test: media,
         type: "javascript/auto",
         use: {
           loader: 'url-loader',
           options: {
             limit: 10000,
             name: 'static/media/[name].[contenthash:8].[ext]',
             esModule: false
           },
         }
       },
       {
         test: fonts,
         type: "javascript/auto",
         use: {
           loader: 'url-loader',
           options: {
             limit: 10000,
             name: 'static/media/[name].[contenthash:8].[ext]',
             esModule: false
           },
         }
       },
       {
         test: /\.mjs$/,
         type: "javascript/auto",
       },
       {
         test: /\.(js|jsx)?$/,
         use: {
           loader: 'babel-loader',
           options: {
             presets: ['@babel/preset-env', '@babel/preset-react'],
             plugins: [
               require("@babel/plugin-external-helpers"),
               require("@babel/plugin-proposal-object-rest-spread"),
               require("@babel/plugin-transform-react-jsx-source"),
               require("fast-async"),
               ["@babel/plugin-proposal-class-properties", { "loose": true }],
               ["@babel/plugin-proposal-private-methods", { "loose": true }],
               ["@babel/plugin-proposal-private-property-in-object", { "loose": true }]
             ]
           },
         },
         include: path.resolve(__dirname, "app"),
         exclude: [/node_modules/]
       },
       {
         test: /\.scss$/i,
         use: [
           {loader: 'style-loader'},
           {loader: 'css-loader'},
           {loader: 'sass-loader'}
         ]
       },
       {
         test: /\.(css)$/,
         use: [
           {loader: 'style-loader'},
           {loader: 'css-loader'},
           {loader: 'sass-loader'}
         ]
       },
       {
         test: /\.less$/,
         use: [
           {loader: "style-loader"},
           {loader: "css-loader"},
           {loader: "less-loader"}
         ]
       },
       {
         test: /\.(glsl|vs|fs)$/,
         loader: 'webpack-glsl-loader'
       }
     ]
   }
 };

 