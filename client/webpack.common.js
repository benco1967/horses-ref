const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
//const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
  entry: {
    app: './src/index.js',
  },
  module: {
    rules: [
      {
        test: /(\.js|\.jsx)$/,
        include: path.resolve(__dirname, "src"),
        loader: "babel-loader"
      },
      {
        test: /\.css$/,
        include: [path.resolve(__dirname, "src"), path.resolve(__dirname, "node_modules")],
        loader: "style-loader!css-loader"
      },
      {
        test: /\.scss$/,
        include: path.resolve(__dirname, "src"),
        loaders: ["style-loader", "css-loader", "sass-loader"]
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(['./ui'],{ root: path.resolve(__dirname, ".."), watch: true }),
    new CopyWebpackPlugin([
      { from: './src/assets/*.png', to: 'assets/', flatten: true},
    ]),
    new HtmlWebpackPlugin({
      title: 'Horses',
      favicon: './src/assets/favicon.ico',
      template: './src/index.html'
    }),
  ],
  output: {
    filename: 'bundle.js',
    publicPath: "/ui/",
    path: path.resolve(__dirname, '../ui'),
  },
};