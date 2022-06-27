const { DIContainer } = require("../container");
const { expect } = require("chai");

class Duck {}

class Dog {}

describe("Minimal DI for JS", () => {
  let injector = new DIContainer("test");
  beforeEach(() => {
    injector.reset();
  });
  describe("Basic API", () => {
    it("should be able to register/dispatch objects", () => {
      const IService = injector.createInjectable();
      injector.provider(IService, new Duck());
      expect(IService.resolve() instanceof Duck);
      IService.provider(new Dog());
      expect(IService.resolve() instanceof Dog);
    });
    it("should be able to register/dispatch functions", () => {
      const IFactory = injector.createInjectable();
      IFactory.provider(() => 1);
      expect(IFactory.resolve()()).to.equal(1);
    });
    it("Should be able to dispatch/register values", () => {
      const IValue = injector.createInjectable();
      IValue.provider(1);
      expect(IValue.resolve()).to.equal(1);
    });
    it("should fail if dependency is not register", () => {
      const IValue = injector.createInjectable("IValue");
      expect(() => IValue.resolve()).throw(
        "Dependency IValue without provider"
      );
    });
  });
  describe("Constructor injection", () => {
    it("should instantiate a service plus it's dependencies", () => {
      const ILogger = injector.createInjectable("ILogger");
      class Logger {}
      ILogger.provider(new Logger());
      const IService = injector.createInjectable("IService");
      class Service {
        static ECHO;
        static dependencies = [ILogger];
        constructor(logger) {
          this.logger = logger;
        }
        echo() {
          return Service.ECHO;
        }
      }
      IService.provider(Service);
      const ser = IService.resolve();
      expect(ser.echo()).to.equal(Service.ECHO);
      expect(ser.logger instanceof Logger);
    });
    it("should inject an instance if it doesn't have dependencies", () => {
      const ILogger = injector.createInjectable("ILogger");
      class Logger {}
      ILogger.provider(Logger);
      const logger = ILogger.resolve();
      expect(logger instanceof Logger).to.be.true;
    });
  });
  describe("Function injection", () => {
    it("should be able to inject dependencies on functions", () => {
      const ILogger = injector.createInjectable("ILogger");
      class Logger {
        talk() {
          return 1;
        }
      }
      ILogger.provider(new Logger());

      const ICallback = injector.createInjectable("icallback");

      function callback(logger) {
        return logger;
      }
      callback.dependencies = [ILogger];
      ICallback.provider(callback);
      const res = ICallback.resolve()();
      expect(res instanceof Logger).to.be.true;
      expect(res.talk()).equal(1);
    });
  });
});
