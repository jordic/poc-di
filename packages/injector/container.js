/*
Small DI Container for nodejs apps
--------

*/

function isClass(v) {
  return typeof v === "function" && /^\s*class\s+/.test(v.toString());
}

class Injectable {
  constructor(container, name) {
    this.container = container;
    this.name = name;
  }
  provider(impl) {
    this.container.provider(this, impl);
  }
  resolve() {
    return this.container.resolve(this);
  }
  toString() {
    return this.name;
  }
}

class DIContainer {
  constructor(name) {
    this.name = name;
    this.registry = new Map();
  }

  createInjectable(name) {
    const cls = new Injectable(this, name);
    this.registry.set(cls, undefined);
    return cls;
  }

  provider(cls, provider) {
    this.registry.set(cls, provider);
  }

  resolve(cls) {
    const provider = this.registry.get(cls);
    if (provider === undefined) {
      throw new Error(`Dependency ${cls.name} without provider`);
    }
    if (provider.dependencies) {
      const args = [];
      provider.dependencies.forEach((dep) => {
        args.push(this.resolve(dep));
      });
      if (isClass(provider)) {
        return new provider(...args);
      }
      return function () {
        return provider(...args);
      };
    }
    if (isClass(provider)) {
      return new provider();
    }
    return provider;
  }

  reset() {
    this.registry = new Map();
  }
}

function configure(dependencies, container = defaultContainer) {}

const defaultContainer = new DIContainer("default");

module.exports = defaultContainer;
module.exports.DIContainer = DIContainer;
module.exports.configureDIContainer = configure;
