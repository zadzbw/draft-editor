const path = require('path');
const HappyPack = require('happypack');
const WebpackBar = require('webpackbar');
const utils = require('./webpack.utils');

// some paths
const ROOT_PATH = path.resolve(__dirname, '..', '..');
const APP_PATH = path.resolve(ROOT_PATH, 'src');
const BUILD_PATH = path.resolve(ROOT_PATH, 'dist');
const LIB_PATH = path.resolve(ROOT_PATH, 'node_modules');

module.exports = {
  entry: {
    app: path.resolve(APP_PATH, 'index.tsx'),
  },

  // 输出的文件名 合并以后的js会命名为bundle.js
  output: {
    path: BUILD_PATH,
  },

  module: {
    rules: [
      {
        test: /\.([jt])sx?$/,
        use: [
          'happypack/loader',
        ],
        include: [APP_PATH],
        exclude: [LIB_PATH],
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]'),
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]'),
        },
      },
    ],
  },

  plugins: [
    new HappyPack({
      loaders: ['babel-loader'],
      threads: 4,
    }),
    new WebpackBar(),
  ],

  resolve: {
    extensions: ['.js', '.json', '.ts', '.tsx'],
  },
};
