const nodeExternals = require('webpack-node-externals');
const path = require("path");
module.exports = {
  entry: './index.js',
  target: 'node',
  externals: [nodeExternals()],
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname),
    libraryTarget: 'commonjs2',
  },
  resolve: {
    // 确保以下模块路径包含在解析的模块路径中
    modules: ['node_modules'],
    // 确保以下模块扩展名会被自动解析
    extensions: [".ts", ".js", '.json', ".mjs"],
    fallback: {
      fs: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        },
      },
    ],
  },
  plugins: [],
};
