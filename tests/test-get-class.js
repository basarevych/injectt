const assert = require("assert");
const Injectt = require("../src/injectt.js");

/*
  Register class and retrieve class
*/

const C = require("./classC");

const di = new Injectt();
di.registerClass(C);

assert(di.getClass("c") === C);
assert(di.get("c") instanceof C);
process.exit(0);
