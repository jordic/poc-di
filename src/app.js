

const express = require("express")
const api = require("api")
const {MemoryStorageService, StorageService} = require("storage")


StorageService.provider(new MemoryStorageService())

const app = express()
app.use(express.json())
app.use("/v1", api)


module.exports = app
