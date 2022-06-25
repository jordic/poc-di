
const registry = new Map()

function createInjectable(tokenString) {
  return new class Decorator {
    provider = function (item) {
      registry.set(tokenString, item)
    }
    resolve() {
      return registry.get(tokenString)
    }
  }
}

function injectableFromDeps(cls) {
  const deps = cls.dependencies
  return class extends cls {
    constructor() {
      super()
      Object.keys(deps).forEach(dep => {
        this[dep] = deps[dep].resolve()
      })
    }
  }
}

function inject(cls) {
  return class extends cls {
    constructor() {
      super()
      Object.keys(this).forEach(k => {
        if (typeof this[k].resolve === "function") {
          this[k] = this[k].resolve()
        }
      })
    }
  }
}

module.exports = {
  createInjectable,
  injectableFromDeps,
  inject
}
