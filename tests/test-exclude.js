const assert = require("assert");
const Injectt = require("../src/injectt.node.js");

/*
  CHeck that exclude forks
*/

const di = new Injectt();
di.load(__dirname);

assert(di.has("a"));
assert(di.has("included"));
assert(!di.has("ignored"));
assert(!di.has("test"));

process.exit(0);
