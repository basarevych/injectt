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

let a1 = di.get("a");
let a2 = di.get("a");
assert(a1.b.c === a1.c);
assert(a2.b.c === a2.c);
assert(a1.c instanceof C);
assert(a1.c !== a2.c);

C.$lifecycle = "unique";
di.registerClass(C);

a1 = di.get("a");
a2 = di.get("a");
assert(a1.b.c instanceof C);
assert(a1.c instanceof C);
assert(a1.b.c !== a1.c);
assert(a2.b.c instanceof C);
assert(a2.c instanceof C);
assert(a2.b.c !== a2.c);
assert(a1.c !== a2.c);

C.$lifecycle = "singleton";
di.registerClass(C);

a1 = di.get("a");
a2 = di.get("a");
assert(a1.c instanceof C);
assert(a1.c === a2.c);

process.exit(0);
