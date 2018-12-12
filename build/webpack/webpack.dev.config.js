const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const config = require('./env.config');
const baseWebpackConfig = require('./webpack.base.config');
const utils = require('./webpack.utils');

// some paths
const ROOT_PATH = path.resolve(__dirname, '..', '..');
const APP_PATH = path.resolve(ROOT_PATH, 'src');
const LIB_PATH = path.resolve(ROOT_PATH, 'node_modules');

const { name } = require('../../package.json');

module.exports = merge(baseWebpackConfig, {
  mode: 'development',

  devtool: '#source-map',

  output: {
    filename: utils.assetsPath('js/[name].[hash:8].js'),
    chunkFilename: utils.assetsPath('js/[name].[chunkhash:8].js'),
    publicPath: config.dev.assetsPublicPath,
  },

  devServer: {
    quiet: true,
    hot: true,
    publicPath: config.dev.assetsPublicPath,
    host: '0.0.0.0',
    port: config.dev.port,
    proxy: config.dev.proxyTable,
    open: config.dev.autoOpenBrowser,
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
  },

  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        async: {
          chunks: 'async',
          minChunks: 3,
          minSize: 8000,
        },
      },
    },
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        enforce: 'pre',
        use: [
          {
            loader: 'eslint-loader',
            options: {
              formatter: require('eslint/lib/formatters/codeframe'),
            },
          },
        ],
        exclude: [LIB_PATH],
      },
      {
        test: /\.(sc|c)ss$/,
        use: [
          {
            loader: 'style-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              importLoaders: 2,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new ForkTsCheckerWebpackPlugin({
      async: false,
      formatter: 'codeframe',
    }),
    new HtmlWebpackPlugin({
      template: 'template/index.html',
      title: name,
      inject: true,
    }),
    new FriendlyErrorsPlugin({
      compilationSuccessInfo: {
        messages: [
          'Your application is running',
          `Open browser to http://localhost:${config.dev.port}${config.dev.assetsPublicPath}`,
        ],
      },
    }),
    new StyleLintPlugin({
      formatter: require('stylelint').formatters.string,
      syntax: 'scss',
    }),
    new webpack.DefinePlugin({
      'process.env': config.dev.env,
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
  ],
});
