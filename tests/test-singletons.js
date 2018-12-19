const assert = require("assert");
const Injectt = require("../src/injectt.js");

/*
  Get array of singletons
*/

const A = require("./classA");
const B = require("./classB");
const C = require("./classC");

const di = new Injectt();
di.registerClass(A);
di.registerClass(B);
di.registerClass(C);

let result = di.singletons();
assert(Array.isArray(result));
assert(result.length === 0);

B.$lifecycle = "singleton";
di.registerClass(B);

result = di.singletons();
assert(Array.isArray(result));
assert(result.length === 1);
assert(result[0] instanceof B);

process.exit(0);
