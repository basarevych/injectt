const assert = require("assert");
const Injectt = require("../src/injectt.node.js");

/*
  Register classes and instantiate
*/

const A = require("./classA");

const di = new Injectt();
di.load(__dirname);

let a = di.get("a");
assert(a instanceof A);

process.exit(0);
