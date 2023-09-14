"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const People = require("../models/people");
const peopleNewSchema = require("../schemas/peopleNew.json");
const peopleSearchSchema = require("../schemas/peopleSearch.json");

const router = express.Router({ mergeParams: true });


/** POST / { people } => { people }
 *
 * people should be { fullname, profileImg, role, biography, birthday, nationalities, socialMedia, follower }
 *
 * Returns { fullname, profileImg, role, biography, birthday, nationalities, socialMedia, follower }
 *
 * Authorization required: admin
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, peopleNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const person = await People.create(req.body);
    return res.status(201).json({ person });
  } catch (err) {
    return next(err);
  }
});

/** GET / =>
 *   { works: [ { fullname, profileImg, role, biography, birthday, nationalities, socialMedia, follower }, ...] }
 *
 * Can provide search filter in query:
 * - fullname (will find case-insensitive, partial matches)
 * - role (will find case-insensitive, partial matches)

 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  const q = req.query;

  try {
    const validator = jsonschema.validate(q, peopleSearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const people = await People.findAll(q);
    return res.json({ people });
  } catch (err) {
    return next(err);
  }
});

/** GET /[fullname] => { job }
 *
 * Returns { fullname, profileImgUrl, role, biography, birthday, 
 *            nationalities, socialMedia, follower, works, relatedPeople }
 *   where works is [{ id, coverImgUrl, title, publishTime, client, type } ...]
 *   Where relatedPeople is [{ fullname, role, profileImgUrl} ...]
 *
 * Authorization required: none
 */

router.get("/:fullname", async function (req, res, next) {
  try {
    const person = await People.get(req.params.fullname);
    return res.json({ person });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[fullname]  =>  { deleted: id }
 *
 * Authorization required: admin
 */

router.delete("/:fullname", ensureAdmin, async function (req, res, next) {
  try {
    await People.remove(req.params.fullname);
    return res.json({ deleted: req.params.fullname });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
