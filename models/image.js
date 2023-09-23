"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");

/** Related functions for images. */

class Image {
  /** Create a image (from data), return new image data.
   *
   * data should be { url}
   *
   * Returns { id, url }
   *
   * Throws BadRequestError if image already in database.
   * */

  static async create({ url }) {
    const duplicateCheck = await db.query(
          `SELECT id
           FROM images
           WHERE url = $1`,
        [url]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate image: ${url}`);

    const result = await db.query(
          `INSERT INTO images
           (url)
           VALUES ($1)
           RETURNING id, url`,
        [ url ],
    );
    const image = result.rows[0];

    return image;
  }

  /** Given an img id, return crew data about this image.
   *
   * Returns [ {fullname, role} ...]
   *
   * Throws NotFoundError if not found.
   **/

   static async getCrew(id) {
    const imageRes = await db.query(
      `SELECT id
       FROM images
       WHERE id = $1`,
    [id]);

    const image = imageRes.rows[0];
    
    if(!image) throw new NotFoundError(`No image: ${id}`);

    const crewRes = await db.query(
          `SELECT p.fullname,
                  p.role
          FROM people AS p
                  JOIN people_image
                  ON p.fullname = people_image.artist
                  JOIN images AS i
                  ON people_image.image_id = i.id
           WHERE i.id = $1`, [id]);

    return crewRes.rows;
  }


  /** Add work_image relationship: update db, returns undefined.
   *
   * - workId
   * - imageId
   **/

   static async addWorkImage(workId, imageId) {
    const preCheck = await db.query(
          `SELECT id
           FROM works
           WHERE id = $1`, [workId]);
    const work = preCheck.rows[0];

    if (!work) throw new NotFoundError(`No work: ${workId}`);

    const preCheck2 = await db.query(
          `SELECT id
           FROM images
           WHERE id = $1`, [imageId]);
    const image = preCheck2.rows[0];

    if (!image) throw new NotFoundError(`No image: ${imageId}`);

    await db.query(
          `INSERT INTO work_image (work_id, image_id)
           VALUES ($1, $2)`,
        [workId, imageId]);
  }


    /** Add people_image relationship: update db, returns undefined.
     *
     * - artist
     * - imageId
     **/

   static async addPeopleImage(artist, imageId) {
    const preCheck = await db.query(
            `SELECT fullname
            FROM people
            WHERE fullname = $1`, [artist]);
    const person = preCheck.rows[0];

    if (!person) throw new NotFoundError(`No model or artist: ${artist}`);

    const preCheck2 = await db.query(
            `SELECT id
            FROM images
            WHERE id = $1`, [imageId]);
    const image = preCheck2.rows[0];

    if (!image) throw new NotFoundError(`No image: ${imageId}`);

    await db.query(
            `INSERT INTO people_image (artist, image_id)
            VALUES ($1, $2)`,
        [artist, imageId]);
    }
}


module.exports = Image;