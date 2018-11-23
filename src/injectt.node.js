const path = require("path");
const fs = require("fs");
const Injectt = require("./injectt");

class InjecttNode extends Injectt {
  /**
   * Load all the services
   * @param {string} root
   */
  load(root) {
    const loadDir = dir => {
      for (let file of fs.readdirSync(dir)) {
        const name = path.join(dir, file);
        let stats = fs.statSync(name);
        if (stats.isDirectory()) {
          loadDir(name);
        } else if (_.endsWith(file, ".js")) {
          let obj = require(name);
          if (
            typeof obj === "function" &&
            typeof obj.$provides !== "undefined"
          ) {
            this.registerClass(obj);
          }
        }
      }
    };
    loadDir(root);
  }
}

module.exports = InjecttNode;
