const assert = require("assert");
const Injectt = require("../src/injectt.js");

/*
  Register and retrieve an object
*/

const x = 42;

const di = new Injectt();
di.registerInstance(x, "name");

assert(di.get("name") === x);
process.exit(0);
