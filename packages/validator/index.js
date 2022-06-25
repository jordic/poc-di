const injector = require("injector");
const joi = require("joi");

const ServiceSerializer = injector.createInjectable("validator");

const SnippetSchema = joi.object({
  name: joi.string().required(),
  language: joi.string().required(),
  value: joi.string().required(),
});

const SnippetValidator = injector.createInjectable("snippet");
SnippetValidator.provider(SnippetSchema);

const Validator = injector.inject(
  class {
    constructor(snippet = SnippetValidator) {
      this.snippet = snippet
    }
    deserialize(kind, data) {
      switch (kind) {
        case "snippet":
          return this.snippet.validate(data);
      }
    }
  }
);
ServiceSerializer.provider(Validator)
module.exports = ServiceSerializer;
module.exports.SnippetValidator = SnippetValidator
