const assert = require("assert");
const Injectt = require("../src/injectt.js");

/*
  Register classes and instantiate
*/

const E1 = require("./classE1");
const E2 = require("./classE2");
const E3 = require("./classE3");

const di = new Injectt();
di.registerClass(E1);
di.registerClass(E2);
di.registerClass(E3);

try {
  di.get("e1");
  assert(false); // never executed
} catch (error) {
  assert(error.message.includes("Injectt"));
  assert(error.message.includes("Cyclic dependency"));
}

process.exit(0);
