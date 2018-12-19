#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const exec = require("child_process").exec;

const TIMEOUT = 10000;

const tests = fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return !fs.statSync(path.join(__dirname, file)).isDirectory();
  })
  .filter(function(file) {
    return /^test(-|_|\.).*\.js$/i.test(file);
  })
  .sort();

const all = tests.length;
let cnt = 0;

const loop = () => {
  var next = tests.shift();

  if (!next) return console.log("\x1B[32m[ok]\x1B[39m  all ok");

  exec("node " + path.join(__dirname, next), { timeout: TIMEOUT }, error => {
    cnt++;

    if (error) {
      console.error("\x1B[31m[err]\x1B[39m " + cnt + "/" + all + " - " + next);
      console.error(
        "\n      " + ("" + error.stack).split("\n").join("\n      ") + "\n"
      );
      return process.exit(1);
    }

    console.log("\x1B[32m[ok]\x1B[39m  " + cnt + "/" + all + " - " + next);
    setTimeout(loop, 100);
  });
};

loop();
