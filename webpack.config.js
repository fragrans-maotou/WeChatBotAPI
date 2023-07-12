// import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
const path = require("path");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const nodeExternals = require('webpack-node-externals');
module.exports = {
  entry: './index.js',
  externals: [nodeExternals()],
  resolve: {
    // 确保以下模块路径包含在解析的模块路径中
    modules: ['node_modules'],
    // 确保以下模块扩展名会被自动解析
    extensions: [".ts", ".js", '.json'],
    fallback: {
      fs: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
    ],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  stats: {
    colors: true,
    modules: true,
    reasons: true,
    errorDetails: true,
  },
  plugins: [new NodePolyfillPlugin()],
};
