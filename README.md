# Injectt

Straightforward Dependency Injection for Node and the browser

```sh
npm install injectt
```

## An Example

#### src/a.js

```javascript
class ClassA {
  costructor(b, c, param1, param2) {
    this.b = b;
    this.c = c;
    this.param1 = param1;
    this.param2 = param2;
  }

  // service name, requried
  static get $provides() {
    return "a";
  }

  // optional dependencies which
  // will be passed to the constructor
  static get $requires() {
    return ["b", "c"];
  }
}

module.exports = ClassA;
```

#### src/b.js

```javascript
class ClassB {
  costructor(c) {
    this.c = c;
  }

  static get $provides() {
    return "b";
  }

  static get $requires() {
    return ["c"];
  }
}

module.exports = ClassB;
```

#### src/c.js

```javascript
class ClassC {
  costructor() {}

  static get $provides() {
    return "c";
  }
}

module.exports = ClassC;
```

#### main.js

```javascript
const path = require("path");
const Injectt = require("injectt");

const di = new Inject();

// load all the services recursively
// (only available in Node, not in browser)
di.load(path.resolve(__dirname, "src"));

// or register the classes by hand:
//di.registerClass(require("./src/a"));
//di.registerClass(require("./src/b"));
//di.registerClass(require("./src/c"));

const a = di.get("a", "hello world", 42);

// the first argument of .get() is the service name
assert(a instanceof ClassA);
assert(a.b instanceof ClassB);
assert(a.c instanceof ClassC);

// anything in .get() after the service name will be passed as
// additional parameters to service's constructor
assert(a.param1 === "hello world");
assert(a.param2 === 42);

// we can also store a variable of any type, not only services
di.registerInstance(42, "theAnswer");
assert(di.get("theAnswer") === 42);
```

## Lifecycle

A service can have an optional static property _\$lifecycle_ which should be a string "perRequest", "unique" or "singleton".

Omitting the property is the same as setting it to "perRequest".

### perRequest

Each call to .get() is considered _a request_. Services with the lifecycle of _perRequest_ are only instantiated once per each request.

In the example above both **a** and **b**, which is a dependency of **a**, receive an instance of ClassC. Because this happens during execution of the same .get() call both services receive _the same instance_ of ClassC.

### unique

If ClassC had _\$lifecycle_ set to "unique" then services **a** and **b** would have received _different instances_ of the same class ClassC. Unique services are never reused.

### singleton

Consider the following:

```javascript
const a1 = di.get("a");
const a2 = di.get("a");
```

As we have two .get() calls these are two separate _requests_. So service **c** is instantiated twice.

```javascript
// ClassC.$lifecycle === "perRequest"
assert(a1.c === a1.b.c);
assert(a2.c === a2.b.c);
assert(a1 !== a2);
assert(a1.c !== a2.c);
```

The third possible value for _\$lifecycle_ is "singleton". Singleton services are instantiated only once during the whole life of the DI container.

In our example if ClassC was singleton then an instance of it whould have been constructed during the first .get() and then reused for any number of subsequent .get()'s.

```javascript
// ClassC.$lifecycle === "singleton"
assert(a1.c === a1.b.c);
assert(a2.c === a2.b.c);
assert(a1 !== a2);
assert(a1.c === a2.c);
```

## Additional Notes

Cyclic dependencies are not allowed (an error is thrown).

If requested dependecy is not found an error is thrown. You can mark a dependency as optional by adding "?" at the end of the name:

```javascript
class SomeClass {
  constructor(a, b, c) {}

  static get $provides() {
    return "someClass";
  }

  // b is optional, becomes null if not found
  static get $requires() {
    return ["a", "b?", "c"];
  }
}
```

### Modern style

Usually in the browser we use ES6 imports and we often have "static class properties" proposal enabled via Babel.

So ClassA could be written like this:

```javascript
class ClassA {
  static $provides = "a";
  static $requires = ["b", "c"];

  constructor(a, b) {
    this.a = a;
    this.b = b;
  }
}

export default ClassA;
```

```javascript
import Injectt from "inject";
import ClassA from "./src/a";

const di = new Inject();
di.registerClass(ClassA);
// ...
```

## Credits

Inspired by Roy Jacobs' [Intravenous](https://github.com/RoyJacobs/intravenous)
