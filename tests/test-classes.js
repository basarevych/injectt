const assert = require("assert");
const net = require("net");
const Injectt = require("../src/injectt.js");

/*
  Register classes and instantiate
*/

const A = require("./classA");
const B = require("./classB");
const C = require("./classC");

const di = new Injectt();
di.registerClass(A);
di.registerClass(B);
di.registerClass(C);

let a = di.get("a");
assert(a instanceof A);
assert(a.b instanceof B);
assert(a.b.c instanceof C);
assert(a.c instanceof C);
process.exit(0);
