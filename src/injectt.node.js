const path = require("path");
const fs = require("fs");
const Injectt = require("./injectt");

class InjecttNode extends Injectt {
  /**
   * Load all the services
   * @param {string} root
   * @param {object} options
   * @param {string[]|RegExp[]} exclude
   */
  load(root, options = {}) {
    let {
      dirInclude = null,
      dirExclude = [/^__/],
      fileInclude = [/\.js$/],
      fileExclude = [/\.test\.js$/]
    } = options;

    const loadDir = dir => {
      for (let file of fs.readdirSync(dir)) {
        const name = path.join(dir, file);
        let stats = fs.statSync(name);
        if (stats.isDirectory()) {
          if (!this._checkInclusion(file, dirInclude, dirExclude)) continue;
          loadDir(name);
        } else {
          if (!this._checkInclusion(file, fileInclude, fileExclude)) continue;
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

  _checkInclusion(str, include, exclude) {
    if (include) {
      let found = false;
      for (let check of include) {
        if (check instanceof RegExp) {
          if (check.test(str)) {
            found = true;
            break;
          }
        } else {
          if (check === str) {
            found = true;
            break;
          }
        }
      }
      if (!found) return false;
    }
    if (exclude) {
      for (let check of exclude) {
        if (check instanceof RegExp) {
          if (check.test(str)) return false;
        } else {
          if (check === str) return false;
        }
      }
    }
    return true;
  }
}

module.exports = InjecttNode;
