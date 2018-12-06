const fs = require("fs");
const path = require("path");

const browsers = fs.readFileSync(
  path.join(__dirname, ".browserslistrc"),
  "utf8"
);

module.exports = api => {
  api.cache(false);
  return {
    presets: [
      [
        "@babel/preset-env",
        {
          targets: {
            browsers: browsers.split(/[\r\n]+/)
          }
        }
      ]
    ]
  };
};
