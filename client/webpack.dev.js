const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require("webpack");
const path = require('path');

module.exports = merge(common, {
  mode: "development",
  devtool: 'inline-source-map',
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ],
  devServer: {
    contentBase: path.join(__dirname, "../ui"),
    port: 3001,
    publicPath: "http://localhost:3001/ui/",
    hotOnly: true
  },
});