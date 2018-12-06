const path = require("path");
const root = path.resolve.bind(path, __dirname);

module.exports = {
  entry: root("src/injectt.js"),
  output: {
    path: root("dist"),
    library: "injectt",
    libraryTarget: "umd",
    umdNamedDefine: true,
    globalObject: "typeof self !== 'undefined' ? self : this"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        loader: "eslint-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    modules: [root("node_modules"), root("src")],
    extensions: [".json", ".js"]
  }
};
