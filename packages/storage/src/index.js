
const injector = require("injector")
const shortid = require('shortid');
const sqlite = require("sqlite")

const StorageService = injector.createInjectable("storageService")


class MemoryStorageService {
  constructor() {
    this.snippets = new Map()
  }

  async initialize() {}

  async save(data) {
    if(!data.id) {
      data.id = shortid.generate()
    }
    this.snippets.set(data.id, { ...data })
    return data
  }

  async get(id) {
    return this.snippets.get(id)
  }

  async delete(id) {
    this.snippets.delete(id)
  }

  async search(params) {
    const all = [...this.snippets.values()]
    return all.filter(item => item.name.indexOf(params) !== -1)
  }

  async all() {
    return [...this.snippets.values()]
  }

}


class SQLiteStorageService {
  constructor(settings) {
    this.db = undefined
    this.cfg =  settings
  }
  async initialize() {
    this.db = await sqlite.open(this.cfg)
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS snippets (
        id string PRIMARY KEY,
        name string,
        language string,
        value string
      );
    `)
  }
  async save(data) {
    if(!data.id) {
      data.id = shortid.generate()
    }
    await this.db.run(`
      INSERT INTO snippets VALUES (
          :id, :name, :language, :value
        ) ON CONFLICT(id) DO
      UPDATE SET
      name=excluded.name,
      name=excluded.language,
      name=excluded.value;
    `, {
      ':id': data.id,
      ':name': data.name,
      ':value': data.value,
      ':language': data.language
    })
    return this.get(data.id)
  }
  async get(id) {
    return this.db.get(`
      SELECT * from snippets WHERE id=:id
    `, {':id': id})
  }

  async delete(id) {
    return this.db.run('DELETE from snippets WHERE id=:id', {':id': id})
  }

  async all() {
    return this.db.all('SELECT * from snippets')
  }

  async search(params) {
    params = (params.indexOf('%') === -1) ? `%${params}%` : params
    return this.db.all(`
      SELECT * from snippets WHERE
        name LIKE :name OR value LIKE :name
    `, {':name': params})
  }

}

module.exports = {
  StorageService,
  MemoryStorageService,
  SQLiteStorageService
}
