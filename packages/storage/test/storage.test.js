
const expect = require("chai").expect
const {StorageService, MemoryStorageService, SQLiteStorageService} = require("../src/")
const sqlite3 = require("sqlite3")

async function testCRUD(db) {
  return it("should crud snippets", async () => {
    db = StorageService.resolve()
    await db.initialize()
    const snippet = await db.save({name: "test", language:"javascript", value:"console.log()"})
    expect(snippet.id).to.not.be.undefined;
    const item = await db.get(snippet.id)
    expect(item).to.eql(snippet)
    const results = await db.search('test')
    expect(results[0]).to.eql(item)
    await db.delete(item.id)
    const last = await db.get(item.id)
    expect(last).to.be.undefined;
  })
}

describe("Storage Service", () => {
  describe("Memory storage Service", () => {
    beforeEach(() => {
      StorageService.provider(new MemoryStorageService())
    })
    testCRUD()
  })
  describe("SQLite storage Service", () => {
    beforeEach(async () => {
      StorageService.provider(new SQLiteStorageService({
        filename: ':memory:',
        driver: sqlite3.Database
      }))
    })
    testCRUD()
  })

})
