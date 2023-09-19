"use strict";

/** Routes for works. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Work = require("../models/work");

const workNewSchema = require("../schemas/workNew.json");
const workUpdateSchema = require("../schemas/workUpdate.json");
const workSearchSchema = require("../schemas/workSearch.json");

const router = new express.Router();


/** POST / { work } =>  { work }
 *
 * work should be { title, client, type, source, publishTime }
 *
 * Returns { id, title, client, type, source, publishTime }
 *
 * Authorization required: admin
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, workNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const work = await Work.create(req.body);
    return res.status(201).json({ work });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { works: [ { id, title, client, type, source, publishTime, url }, ...] }
 *
 * Can filter on provided search filters:
 * - type
 * - client
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  const q = req.query;

  try {
    const validator = jsonschema.validate(q, workSearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const works = await Work.findAll(q);
    return res.json({ works });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  =>  { work }
 *
 *  work is { id, title, client, type, source, publishTime, images, crew }
 *   where images is [{ id, url }, ...] and crew is [{fullname, role}, ...]
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  try {
    const work = await Work.get(req.params.id);
    return res.json({ work });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[id] { fld1, fld2, ... } => { work }
 *
 * Patches work data.
 *
 * fields can be: { title, client, type, source, publishTime }
 *
 * Returns { id, title, client, type, source, publishTime }
 *
 * Authorization required: admin
 */

router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, workUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const work = await Work.update(req.params.id, req.body);
    return res.json({ work });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: admin
 */

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    await Work.remove(req.params.id);
    return res.json({ deleted: +req.params.id });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
