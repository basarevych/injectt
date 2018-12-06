const merge = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "production",
  output: {
    filename: "inject.min.js"
  },
  module: {
    rules: [
      {
        test: /node_modules\/debug/,
        use: "null-loader"
      }
    ]
  }
});
