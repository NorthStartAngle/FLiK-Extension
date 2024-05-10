const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  // Note:
  // Chrome MV3 no longer allowed remote hosted code
  // Using module bundlers we can add the required code for your extension
  // Any modular script should be added as entry point
  entry: './src/supabase/supabase_controller.js',
  output: {
    filename: './supabase_controller.js',
    library: 'supabase_controller',
    libraryTarget: 'umd',
    libraryExport: ['supabase_controller']
  },
  module: {
    rules: [
      {
        test: /\.(scss|css)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    // Note: you can add as many new HtmlWebpackPlugin objects
    // filename: being the html filename
    // chunks: being the script src
    // if the script src is modular then add it as the entry point above
    // new HtmlWebpackPlugin({
    //   template: path.join(__dirname, "src", "popup", "popup.html"),
    //   filename: "popup/popup.html",
    //   chunks: ["popup"] // This is script from entry point
    // }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),
    // Note: This is to copy any remaining files to bundler
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/manifest.json' },
        { from: './src/service_worker.js' },
        { from: './src/html/*', to: 'html/[name][ext]' },
        { from: './src/css/*', to: 'css/[name][ext]' },
        { from: './src/img/*', to: 'img/[name][ext]' },
        { from: './src/img/social-icons/*', to: 'img/social-icons/[name][ext]' },
        { from: './src/library/css/*', to: 'library/css/[name][ext]' },
        { from: './src/library/css/images/*', to: 'library/css/images/[name][ext]' },
        { from: './src/library/js/*', to: 'library/js//[name][ext]' },
        { from: './src/js/*', to: 'js/[name][ext]' }
      ],
    }),
  ],
};