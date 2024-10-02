const esModules = [
  "@dtplatform/platform-api",
  "lodash-es",
  "@invicara/core-utils",
  "@dtplatform/ui-utils",
].join("|");

const config = {
  verbose: true,
  moduleNameMapper: {
    "\\.(css|less|scss)$": "identity-obj-proxy",
  },
  transform: {
    "^.+\\.(js|jsx)?$": "babel-jest",
    ".+\\.(png|jpg|gif|ttf|woff|woff2|svg)$": "jest-transform-stub",
  },
  transformIgnorePatterns: [
    // add to esModules module that isn't being compiled
    //`/node_modules/(?!${esModules}).+\\.js$`,
    "node_modules/(?!@ngrx|(?!deck.gl)|ng-dynamic)",
  ],
  testEnvironment: "jsdom",
  globals: {
    endPointConfig: {
      itemServiceOrigin: "https://dt-dev.invicara.com",
      passportServiceOrigin: "https://dt-dev.invicara.com",
      fileServiceOrigin: "https://dt-dev.invicara.com",
      datasourceServiceOrigin: "https://dt-dev.invicara.com",
      graphicsServiceOrigin: "https://dt-dev.invicara.com",
      pluginBaseUrl: "http://dt-dev.invicara.com/downloads/IPAPlugins/",
      baseRoot: "http://localhost:8083/digitaltwin",
    },
  },
  setupFilesAfterEnv: ["<rootDir>/src/test/jest.setup.js"],
};

module.exports = config;
