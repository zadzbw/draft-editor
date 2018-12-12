const autoprefixer = require('autoprefixer');
// this file to fixed this bug：https://github.com/postcss/postcss-loader/issues/204
module.exports = () => ({
  plugins: [
    autoprefixer({
      remove: false,
    }),
  ],
});
