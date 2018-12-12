const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const BrotliPlugin = require('brotli-webpack-plugin');

const config = require('./env.config');
const baseWebpackConfig = require('./webpack.base.config');
const utils = require('./webpack.utils');

const ROOT_PATH = path.resolve(__dirname, '..', '..');
const APP_PATH = path.resolve(ROOT_PATH, 'src');
const BUILD_PATH = path.resolve(ROOT_PATH, 'dist');
const LIB_PATH = path.resolve(ROOT_PATH, 'node_modules');

const { name } = require('../../package.json');

module.exports = (env, argv) => {
  const webpackConfig = merge(baseWebpackConfig, {
    mode: 'production',

    devtool: config.prod.productionSourceMap ? '#hidden-source-map' : false,

    output: {
      filename: utils.assetsPath('js/[name].[hash:8].js'),
      chunkFilename: utils.assetsPath('js/[name].[chunkhash:8].js'),
      publicPath: config.prod.assetsPublicPath,
    },

    performance: {
      // vendor size 过大时不显示警告信息
      hints: false,
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
            minSize: 10000,
          },
        },
      },
    },

    module: {
      rules: [
        {
          test: /\.(sc|c)ss$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: 'css-loader',
              options: {
                importLoaders: 2,
              },
            },
            'postcss-loader',
            'sass-loader',
          ],
        },
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: 'template/index.html',
        title: name,
        inject: true,
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          minifyJS: true,
        },
        chunksSortMode: 'dependency',
      }),
      // 导出css文件
      new MiniCssExtractPlugin({
        filename: utils.assetsPath('css/[name].[contenthash:8].css'),
        chunkFilename: utils.assetsPath('css/[name].[contenthash:8].css'),
      }),
      new OptimizeCSSAssetsPlugin(),
      // inline webpack-runtime
      new InlineManifestWebpackPlugin(),
      new CleanPlugin([BUILD_PATH], {
        root: ROOT_PATH,
      }),
      new webpack.DefinePlugin({
        'process.env': config.prod.env,
      }),
      // 给每个module加上hash
      new webpack.HashedModuleIdsPlugin({
        hashDigestLength: 6,
      }),
      new CompressionWebpackPlugin({
        filename: '[path].gz[query]',
        algorithm: 'gzip',
        test: new RegExp(`\\.(${config.prod.productionGzipExtensions.join('|')})$`),
        threshold: 10240,
        minRatio: 0.8,
      }),
      new BrotliPlugin({
        asset: '[path].br[query]',
        test: new RegExp(`\\.(${config.prod.productionGzipExtensions.join('|')})$`),
        threshold: 10240,
        minRatio: 0.8,
      }),
    ],
  });

  if (config.prod.bundleAnalyzerReport) {
    const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
    webpackConfig.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerPort: 9999,
      }),
    );
  }

  return webpackConfig;
};
