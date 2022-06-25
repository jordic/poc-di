const expect = require("chai").expect;
const { StorageService, MemoryStorageService } = require("storage");
const request = require("supertest");
const express = require("express");
const api = require("../src");

const snippet = { name: "test", language: "c", value: "print" };

describe("snippets API", () => {
  let app = express(),
    db;
  beforeEach(async function () {
    StorageService.provider(new MemoryStorageService());
    db = StorageService.resolve();
    app.use(express.json());
    app.use("/v1", api);
    await db.save({ ...snippet });
  });

  it("should get snippets", (done) => {
    request(app)
      .get("/v1")
      .expect(200)
      .end((err, res) => {
        expect(res.body[0]).to.contain(snippet);
        done();
      });
  });

  it("should create snippets", (done) => {
    const data = { name: "test2", language: "js", value: "console.log" };
    request(app)
      .post("/v1")
      .send(data)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .expect(201)
      .end((err, res) => {
        expect(res.body).to.contain(data);
        expect(res.body.id).to.not.be.undefined;
        done();
      });
  });

  it("should GET a snippet", async () => {
    const one = (await db.all())[0];
    const result = await request(app).get(`/v1/${one.id}`).expect(200);
    expect(result.body).to.eql(one);
  });
  it("should 404 on inexistent snippets", async () => {
    const result = await request(app).get("/asdf").expect(404);
  });
  it("should allow to patch snippets", async () => {
    const one = (await db.all())[0];
    const result = await request(app)
      .patch(`/v1/${one.id}`)
      .send({ name: "test2" })
      .expect(200);
    expect(result.body).to.eql({ ...one, name: "test2" });
  });
});
