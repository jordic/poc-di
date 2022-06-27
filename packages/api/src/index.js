const express = require("express");
const { StorageService } = require("storage");
const joi = require("joi");

const app = express.Router();

const SnippetSchema = joi.object({
  name: joi.string().required(),
  language: joi.string().required(),
  value: joi.string().required(),
});

Object.defineProperty(app, "db", {
  get: () => StorageService.resolve(),
});

app.get("/", async (req, res) => {
  const data = await app.db.all();
  res.json(data);
});

app.post("/", async (req, res) => {
  const { value, error } = SnippetSchema.validate(req.body);
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
  const validated = SnippetSchema.validate({
    name,
    language,
    value,
    ...req.body,
  });
  if (validated.error) {
    return res.status(412).json(validated.error);
  }
  const result = await app.db.save({ ...snippet, ...validated.value });
  res.send(result);
});

module.exports = app;
