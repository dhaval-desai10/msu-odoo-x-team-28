const webpack = require('webpack');
const dotenv = require('dotenv');

module.exports = () => {
  const env = dotenv.config().parsed;

  return {
    plugins: [
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(env),
      }),
    ],
  };
}; 