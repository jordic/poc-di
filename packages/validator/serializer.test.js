
const Serializer = require("validator")
const joi = require("joi")
const {expect} = require("chai")

describe("serializer", () => {
  let service = new (Serializer.resolve())
  it("should return error on data failure", () => {
    const result = service.deserialize('snippet', {name: "Jordi"})
    expect(result.error).to.not.be.undefined;
    expect(result.value.name).to.equal("Jordi")
  })
  it("should return no errors on valid data", () => {
    const data = {
      name: "Jordi",
      language: "js",
      value: "console.info"
    }
    const result = service.deserialize(
      'snippet', data
    )
    expect(result.error).to.be.undefined;
    expect(result.value).eql(data)
  })
  it("should override validators", () => {
    Serializer.SnippetValidator.provider(
      joi.object({test: joi.string()})
    )
    let validator = new (Serializer.resolve())
    const result = validator.deserialize('snippet', {test: 'asdf'})
    expect(result.error).to.be.undefined;
    expect(result.value).to.eql({test:'asdf'})
  })
})
