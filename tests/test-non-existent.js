const assert = require("assert");
const net = require("net");
const Injectt = require("../src/injectt.js");

/*
  Register classes and instantiate
*/

const D1 = require("./classD1");
const D2 = require("./classD2");

const di = new Injectt();
di.registerClass(D1);
di.registerClass(D2);

try {
  di.get("d1");
  assert(false); // never executed
} catch (error) {
  assert(error.message.includes("Injectt"));
  assert(error.message.includes("non-existent"));
}

let d = di.get("d2");
assert(d instanceof D2);
assert(d.result === null);
process.exit(0);
