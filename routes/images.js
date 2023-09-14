"use strict";

/** Routes for images. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Image = require("../models/image");
const imageNewSchema = require("../schemas/imageNew.json");

const router = express.Router({ mergeParams: true });


/** POST / { image } => { image }
 *
 * image should be { url }
 *
 * Returns { id, url }
 *
 * Authorization required: admin
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, imageNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const image = await Image.create(req.body);
    return res.status(201).json({ image });
  } catch (err) {
    return next(err);
  }
});

/** POST /[id]/works/[workid]  { state } => { work_image }
 *
 * Returns {"addedWorkImg": [workId, imageId]}
 *
 * Authorization required: admin
 * */

router.post("/:id/works/:workid", ensureAdmin, async function (req, res, next) {
try {
    const imageId = +req.params.id;
    const workId = +req.params.workid;
    await Image.addWorkImage(workId, imageId);
    return res.json({ addedWorkImg: [workId, imageId] });
} catch (err) {
    return next(err);
}
});

  /** POST /[id]/people/[artist]  { state } => { people_image }
 *
 * Returns {"addedPplImg": [artist, imageId]}
 *
 * Authorization required: admin
 * */

router.post("/:id/people/:artist", ensureAdmin, async function (req, res, next) {
    try {
      const imageId = +req.params.id;
      await Image.addPeopleImage(req.params.artist, imageId);
      return res.json({ addedPplImg: [req.params.artist, imageId] });
    } catch (err) {
      return next(err);
    }
});

module.exports = router;
