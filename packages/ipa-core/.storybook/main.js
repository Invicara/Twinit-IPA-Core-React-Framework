const path = require("path");
const webpack = require("webpack");

module.exports = {
    stories: [
        "../src/stories/**/*.stories.@(js|jsx|ts|tsx)",
    ],
    addons: [
        "@storybook/addon-links",
        "@storybook/addon-essentials",
        "@storybook/addon-interactions",
    ],
    framework: {
        name: "@storybook/react-webpack5",
        options: {
            strictMode: false // this will enable Legacy Context
        },
    },
    staticDirs: [
        "../src/stories/assets",
        { from: "../src/stories/assets/digitaltwin/icons", to: "/icons" },
        { from: "../src/IpaFonts", to: "/fonts" },
    ],
    webpackFinal: async (config) => {
        config.module.rules.push({
            test: /\.scss$/,
            use: [
                "style-loader",
                {
                    loader: "css-loader",
                    options: {
                        url: false, // ✅ don't resolve url(...) during webpack build
                    },
                },
                "sass-loader",
            ],
            include: path.resolve(__dirname, "../"),
        });


        // resolve url('fonts/...') without changing SCSS
        config.resolve = config.resolve || {};
        config.resolve.alias = {
            ...(config.resolve.alias || {}),
            fonts: path.resolve(__dirname, "../src/IpaFonts"),
            "@storybook/client-api": require.resolve("@storybook/preview-api"),
        };

        config.module.rules.push({
            test: /\.(ttf|otf|woff|woff2|eot|svg)(\?.*)?$/i,
            type: "asset/resource",
            generator: { filename: "fonts/[name][ext]" },
        });

        config.module.rules.push({
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
                loader: require.resolve("babel-loader"),
                options: {
                    presets: [
                        [require.resolve("@babel/preset-env"), { targets: "defaults" }],
                        [require.resolve("@babel/preset-react"), { runtime: "automatic" }],
                    ],
                },
            },
        });

        config.resolve = config.resolve || {};
        config.resolve.fallback = {
            ...(config.resolve.fallback || {}),
            fs: false,
            os: false,
            path: false,
            crypto: false,
            util: false,
            canvas: false,
            zlib: false,
            http: require.resolve("stream-http"),
            https: require.resolve("https-browserify"),
            stream: require.resolve("stream-browserify"),
            buffer: require.resolve("buffer/"),
            process: require.resolve("process/browser"),
        };


        config.plugins.push(
            new webpack.ProvidePlugin({
                process: "process/browser",
                Buffer: ["buffer", "Buffer"],
            })
        );


        return config;
    },

};
