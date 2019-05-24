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

  // dependencies which will be passed
  // to the constructor, optional
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

const di = new Injectt();

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

## API

- **constructor()**

  Constructs an instance of DI container.

  **NOTE** The container self-registers its own instance as a service named "di".

- **registerInstance(instance, name)**

  Register variable **instance** value as service **name**. When the service is requested exactly this value will be returned.

  Returns service name

- **registerClass(classFunc)**

  Register a class referred to by **classFunc** as a service. The class should have at least static property **\$provides** defined which is used as service name. When the service is requested it will be either instantiated or possibly reused if it were instantiated before.

  Static properties which have a special meaning:

  - **\$provides** - (required) service name

  - **\$requires** - an array of dependicies names which will be instantiated and passed to the constructor in the same order

  - **\$lifecycle** - one of:

    - **perRequest** - (default) service is instantiated once per each request

    - **unique** - service instances are never reused, new instances are always instantiated

    - **singleton** - service is instantiated only once per the whole lifetime of the container

  Returns service name

- **load(root [, options])**

  Options:

  ```javascript
  {
    dirInclude: null | [String] | [RegExp],
    dirExclude: null | [String] | [RegExp],
    fileInclude: null | [String] | [RegExp],
    fileExclude: null | [String] | [RegExp],
  }
  ```

  Passing **null** in **\*include/\*exclude** options means "skip this check".

  Default options:

  ```javascript
  {
    dirInclude: null,
    dirExclude: [/^__/], // directory names must not start with two underscores
    fileInclude: [/\.js$/], // file names must end with .js extension
    fileExclude: [/\.test\.js$/], // but skip test files
  }
  ```

  Recursively loads and registers all the services in the given directory **root**. To be considered a service the file should match **fileInclude** option, do not match **fileExclude** option, and export a class with **\$provides** static property defined. Subdirectories are checked againt **dirInclude/dirExclude** options.

  NOTE: This method is not available in the browser version of the library

- **has(name)**

  Checks if a service is registered. Returns boolean.

- **search(re)**

  Does search among the services by applying regular expression **re** to each service name

  Returns an array of matched names

- **getClass(name)**

  Retrieves the class (constructor function really) of a service without instantiating it.

  **name** could also be a RegExp or an Array of strings, in which case **getClass()** will return a Map(name --> constructor function) of matching services.

- **get(name, ...extra)**

  Instantiates if needs to and returns a service registered as **name** passing all the rest of the parameters to service constructor

  **name** could also be a RegExp or an Array of strings, in which case **get()** will return a Map(name --> instance) of matching services.

- **singletons(...extra)**

  Returns Map(name -> instance) of all the singleton services

## Additional Notes

- Cyclic dependencies are not allowed (an error is thrown).

- If requested dependecy is not found an error is thrown. You can
  mark a dependency as optional by adding "?" at the end of the name:

  ```javascript
  class SomeClass {
    constructor(a, b, c) {
      // b might be null
    }

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

Usually we use ES6 imports in the browser and we often have "static class properties" proposal enabled via Babel.

In which case ClassA could be rewritten like this:

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
import Injectt from "injectt";
import ClassA from "./src/a";

const di = new Injectt();
di.registerClass(ClassA);
// ...
```

## Credits

Inspired by Roy Jacobs' [Intravenous](https://github.com/RoyJacobs/intravenous)
