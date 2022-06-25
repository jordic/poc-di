const express = require("express");
const { StorageService } = require("storage");
const Serializer = require("validator");

const app = express.Router();

Object.defineProperty(app, "db", {
  get: () => StorageService.resolve(),
});

Object.defineProperty(app, "validator", {
  get: () => (data) =>
    new (Serializer.resolve())().deserialize("snippet", data),
});

app.get("/", async (req, res) => {
  const data = await app.db.all();
  res.json(data);
});

app.post("/", async (req, res) => {
  const { value, error } = app.validator(req.body);
  if (error) {
    return res.status(412).json(error);
  }
  const result = await app.db.save(value);
  res.status(201).json(result);
});

app.get("/:id", async (req, res) => {
  const { id } = req.params;
  const snippet = await app.db.get(id);
  if (!snippet) {
    return res.status(404);
  }
  res.json(snippet);
});

app.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const snippet = await app.db.get(id);
  if (!snippet) {
    return res.status(404);
  }
  let { name, language, value } = snippet;
  const validated = app.validator({ name, language, value, ...req.body });
  if (validated.error) {
    return res.status(412).json(validated.error);
  }
  const result = await app.db.save({ ...snippet, ...validated.value });
  res.send(result);
});

module.exports = app;
