const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions"
  ],
  "framework": "@storybook/react",
  staticDirs: ['../src/stories/assets'],
  //customize webpack 4 config using 'webpackFinal'
  webpackFinal: async (config, { configType }) => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.

    //only process styles under src/ (you might need to process /node_modules later on)
    config.module.rules.push({
      test: /\.scss$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
      include: path.resolve(__dirname, '../','src/'),
    });

    //we don't use fs in browser
    config.node = config.node || {};
    config.node['fs'] = 'empty';

    //currently, webpack config is not processing styles under /node_modules, so ignore some paths
    config.plugins.push(new webpack.IgnorePlugin(/^\.\.\/img\/invicara-logo_white.svg/));

    config.plugins.push(new CopyWebpackPlugin([
      {from: 'node_modules/@invicara/iaf-viewer/dist/lib/', to: 'digitaltwin/lib/', toType: 'dir'}
    ]));

    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias['../../../../app/ipaCore/scriptPlugins'] = path.resolve(__dirname, "../", "src/scriptPlugins")
    config.resolve.alias['../../../../app/ipaCore/redux'] = path.resolve(__dirname, "../", "src/redux")
    config.resolve.alias['../../../../app/ipaCore/css'] = path.resolve(__dirname, "../", "src/css")
    config.resolve.alias['../../../../app/ipaCore/components'] = path.resolve(__dirname, "../", "src/components")
    config.resolve.alias['../../../../app/ipaCore/pageComponents'] = path.resolve(__dirname, "../", "src/pageComponents")
    config.resolve.alias['../../../../../app/ipaCore/scriptPlugins'] = path.resolve(__dirname, "../", "src/scriptPlugins")
    config.resolve.alias['../../../../../app/ipaCore/redux'] = path.resolve(__dirname, "../", "src/redux")
    config.resolve.alias['../../../../../app/ipaCore/css'] = path.resolve(__dirname, "../", "src/css")
    config.resolve.alias['../../../../../app/ipaCore/components'] = path.resolve(__dirname, "../", "src/components")
    config.resolve.alias['../../../../../app/ipaCore/pageComponents'] = path.resolve(__dirname, "../", "src/pageComponents")

    // Return the altered config
    return config;
  },
}