const assert = require("assert");
const Injectt = require("../src/injectt.js");

/*
  Search for classes by RegExp
*/

const A = require("./classA");
const B = require("./classB");
const C = require("./classC");

const di = new Injectt();
di.registerClass(A);
di.registerClass(B);
di.registerClass(C);

let result = di.search(/a/);
assert(Array.isArray(result));
assert(result.length === 1);
assert(result[0] === "a");

result = di.get(/a/);
assert(result instanceof Map);
assert(Array.from(result.keys()).length === 1);
assert(result.get("a") instanceof A);

result = di.getClass(/a/);
assert(result instanceof Map);
assert(Array.from(result.keys()).length === 1);
assert(result.get("a") === A);

process.exit(0);
