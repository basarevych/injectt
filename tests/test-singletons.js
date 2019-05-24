const assert = require("assert");
const Injectt = require("../src/injectt.js");

/*
  Get singletons
*/

const A = require("./classA");
const B = require("./classB");
const C = require("./classC");

const di = new Injectt();
di.registerClass(A);
di.registerClass(B);
di.registerClass(C);

let result = di.singletons();
assert(result instanceof Map);
assert(Array.from(result.keys()).length === 0);

B.$lifecycle = "singleton";
di.registerClass(B);

result = di.singletons();
assert(result instanceof Map);
assert(Array.from(result.keys()).length === 1);
assert(result.get("b") instanceof B);

let old = result.get("b");
result = di.singletons(); // repeat
assert(result instanceof Map);
assert(Array.from(result.keys()).length === 1);
assert(result.get("b") instanceof B);
assert(old === result.get("b")); // singleton

process.exit(0);
