let debug;
if (process.env.NODE_ENV !== "production") debug = require("debug")("injectt");

/**
 * Dependency Injection Container
 */
class Injectt {
  constructor() {
    if (process.env.NODE_ENV !== "production")
      debug("Constructing the container");

    this.container = new Map();
    this.registerInstance(this, "di");
  }

  /**
   * Register an instance of a service
   * @param {*} instance                  Instance
   * @param {string} name                 Name
   * @return {string}                     Returns name of the service
   */
  registerInstance(instance, name) {
    if (!name) throw new Error("Injectt: No name provided for an instance");

    if (process.env.NODE_ENV !== "production")
      debug(`Registering instance '${name}'`);

    let service = this._initService(name);
    service.instance = instance;

    return service.$provides;
  }

  /**
   * Register constructor function as a service
   * @param {function} classFunc          Class function
   * @return {string}                     Returns name of the service
   */
  registerClass(classFunc) {
    let name = classFunc.$provides;
    if (!name) throw new Error("Injectt: No name provided for a class");

    if (process.env.NODE_ENV !== "production")
      debug(`Registering class '${name}'`);

    let service = this._initService(name);
    service.class = classFunc;
    service.$requires = classFunc.$requires || [];
    service.$lifecycle = classFunc.$lifecycle || "perRequest";

    return service.$provides;
  }

  /**
   * Check if service is registered
   * @param {string} name                 Service name
   * @return {boolean}
   */
  has(name) {
    if (!name) throw new Error("Injectt: No service name provided");

    return this.container.has(name);
  }

  /**
   * Search registered services
   * @param {RegExp} search               RegExp for service names
   * @return {string[]}                   Returns array of matching service names
   */
  search(search) {
    if (!(search instanceof RegExp))
      throw new Error("Injectt: Invalid search argument provided");
    if (process.env.NODE_ENV !== "production")
      debug(`Searching for services ${search}`);

    let result = [];
    for (let name of this.container.keys())
      if (search.test(name)) result.push(name);
    return result;
  }

  /**
   * Get class of a service
   * @param {string|Array|RegExp} name    Service name(s) or RegExp
   * @return {class|Map}                  Returns class for a string name or Map of classes otherwise
   */
  getClass(name) {
    if (!name) throw new Error("Injectt: No service name provided");

    if (process.env.NODE_ENV !== "production")
      debug(`Retrieving class '${name}'`);

    let arr;
    if (Array.isArray(name)) {
      arr = name;
    } else if (name instanceof RegExp) {
      arr = this.search(name);
    } else {
      let service = this.container.get(name);
      return service && service.class;
    }

    return arr.reduce((acc, cur) => {
      let service = this.container.get(cur);
      return acc.set(cur, service.class ? service.class : null);
    }, new Map());
  }

  /**
   * Get instance of a service
   * @param {string|Array|RegExp} name    Service name(s) or RegExp
   * @param {...*} extra                  Optional extra arguments to the constructor
   * @return {object|Map}                 Returns instance for a string name or Map of instances otherwise
   */
  get(name, ...extra) {
    if (!name) throw new Error("Injectt: No service name provided");

    if (process.env.NODE_ENV !== "production")
      debug(`Retrieving service '${name}'`);

    let arr;
    if (Array.isArray(name)) arr = name;
    else if (name instanceof RegExp) arr = this.search(name);
    else return this._resolveService(name, extra, new Map());

    let request = new Map();
    return arr.reduce((acc, cur) => {
      return acc.set(cur, this._resolveService(cur, extra, request));
    }, new Map());
  }

  /**
   * Get all defined singletons
   * @param {...*} extra                  Optional extra arguments to the constructor
   * @return {Map}                        Returns map of all the singletons
   */
  singletons(...extra) {
    let request = new Map();
    return Array.from(this.container.keys()).reduce((acc, cur) => {
      let service = this.container.get(cur);
      if (service && service.$lifecycle === "singleton")
        acc.set(cur, this._resolveService(cur, extra, request));
      return acc;
    }, new Map());
  }

  /**
   * Initialize as empty and return the item of service container, adding new one if it does not exist yet
   * @param {string} name                 Name of the service
   * @return {object}                     Returns service object
   */
  _initService(name) {
    if (name[name.length - 1] === "?")
      throw new Error(`Injectt: Invalid service name: ${name}`);

    let service;
    if (this.container.has(name)) {
      service = this.container.get(name);
    } else {
      service = {};
      this.container.set(name, service);
    }

    delete service.instance;
    delete service.class;
    delete service.$requires;
    service.$provides = name;

    return service;
  }

  /**
   * Resolve dependencies and return an instance of a service
   * @param {string} name                 Service name
   * @param {Array} extra                 Extra constructor arguments
   * @param {Map} request                 Resolved dependencies
   * @return {object}                     Returns instance of the service
   */
  _resolveService(name, extra, request) {
    let mustExist = true;
    if (name[name.length - 1] === "?") {
      name = name.slice(0, -1);
      mustExist = false;
    }

    if (!this.container.has(name)) {
      if (mustExist) throw new Error(`Injectt: No service was found: ${name}`);
      return null;
    }

    let service = this.container.get(name);
    if (service.instance) return service.instance;

    let instance;
    if (request.has(name)) {
      // already resolved
      instance = request.get(name);
    } else {
      request.set(name, null); // mark as visited but not resolved yet
      instance = this._instantiateClass(service, extra, request);
      switch (service.class.$lifecycle || "perRequest") {
        case "perRequest":
          request.set(name, instance);
          break;
        case "unique":
          request.delete(name);
          break;
        case "singleton":
          service.instance = instance;
          request.delete(name);
          break;
        default:
          throw new Error(
            `Injectt: Service '${name}' has invalid lifecycle: ${
              service.class.$lifecycle
            }`
          );
      }
    }

    if (!instance)
      throw new Error(`Injectt: Cyclic dependency while resolving '${name}'`);

    return instance;
  }

  /**
   * Instantiate given service class
   * @param {object} service              Service object
   * @param {Array} extra                 Extra constructor arguments
   * @param {Map} request                 Resolved dependencies
   * @return {object}                     Returns instance of the class
   */
  _instantiateClass(service, extra, request) {
    let ClassFunc = service.class;
    if (!ClassFunc)
      throw new Error(`Injectt: No class function for ${service.$provides}`);

    let args = [];
    for (let arg of service.$requires || [])
      args.push(this._resolveService(arg, [], request));
    args = args.concat(extra);

    return new ClassFunc(...args);
  }
}

module.exports = Injectt;
