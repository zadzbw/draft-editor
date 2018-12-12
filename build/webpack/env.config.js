const path = require('path');
const { version } = require('../../package.json');

const commonEnv = {
  VERSION: JSON.stringify(`v${version}`),
};

module.exports = {
  dev: {
    env: Object.assign({}, commonEnv, {
      NODE_ENV: JSON.stringify('development'),
    }),
    port: 5006,
    autoOpenBrowser: false,
    errorOverlay: true,
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {},
  },
  prod: {
    env: Object.assign({}, commonEnv, {
      NODE_ENV: JSON.stringify('production'),
    }),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    productionSourceMap: true,
    productionGzipExtensions: ['js', 'css'],
    bundleAnalyzerReport: process.env.npm_config_report,
  },
};
