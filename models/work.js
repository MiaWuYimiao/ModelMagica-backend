"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for works. */

class Work {
  /** Create a work (from data), update db, return new work data.
   *
   * data should be { title, client, type, source, publishTime }
   *
   * Returns { id, title, client, type, source, publishTime }
   *
   * Throws BadRequestError if work already in database.
   * */

  static async create({ title, client, type, source, publishTime }) {
    const duplicateCheck = await db.query(
          `SELECT id
           FROM works
           WHERE title = $1`,
        [title]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate work: ${title}`);

    const result = await db.query(
          `INSERT INTO works
           (title, client, type, source, publish_time)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, title, client, type, source, publish_time AS "publishTime"`,
        [ title, client, type, source, publishTime ],
    );
    const work = result.rows[0];

    return work;
  }

  /** Find all works (optional filter on searchFilters).
   *
   * searchFilters (all optional):
   * - type
   * - client
   *
   * Returns [{ id, title, client, type, source, publishTime }, ...]
   * */

  static async findAll(searchFilters = {}) {
    let query = `SELECT id,
                        title,
                        client,
                        type,
                        source,
                        publish_time AS "publishTime"
                 FROM works`;
    let whereExpressions = [];
    let queryValues = [];

    const { type, client } = searchFilters;

    // For each possible search term, add to whereExpressions and queryValues so
    // we can generate the right SQL

    if (type) {
      queryValues.push(type);
      whereExpressions.push(`type = $${queryValues.length}`);
    }

    if (client) {
      queryValues.push(client);
      whereExpressions.push(`client = $${queryValues.length}`);
    }

    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    // Finalize query and return results

    query += " ORDER BY publish_time DESC";
    const workRes = await db.query(query, queryValues);
    return workRes.rows;
  }

  /** Given a work id, return data about work.
   *
   * Returns { id, title, client, type, source, publishTime, images, crew }
   *   where images is [{ id, url }, ...] and crew is [{fullname, role}, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const workRes = await db.query(
          `SELECT id,
                  title,
                  client,
                  type,
                  source,
                  publish_time AS "publishTime"
           FROM works
           WHERE id = $1`,
        [id]);

    const work = workRes.rows[0];

    if (!work) throw new NotFoundError(`No work: ${id}`);

    const imagesRes = await db.query(
          `SELECT images.id AS id, url
                FROM images
                JOIN work_image
                ON images.id = work_image.image_id
                JOIN works
                ON works.id = work_image.work_id
           WHERE works.id = $1`,
        [id]);
        
    work.images = imagesRes.rows;

    const crewRes = await db.query(
        `SELECT fullname, role
                FROM people
                JOIN people_image
                ON people.fullname = people_image.artist
                JOIN images
                ON people_image.image_id = images.id
                JOIN work_image
                ON images.id = work_image.image_id
                JOIN works
                ON works.id = work_image.work_id
            WHERE works.id = $1
            GROUP BY people.fullname`,
        [id]);

    work.crew = crewRes.rows;
    return work;
  }

  /** Update work data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, client, type, source, publishTime}
   *
   * Returns {id, title, client, type, source, publishTime}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
            publishTime: "publish_time",
        });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE works 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                title, 
                                client, 
                                type,
                                source, 
                                publish_time AS "publishTime"`;
    const result = await db.query(querySql, [...values, id]);
    const work = result.rows[0];

    if (!work) throw new NotFoundError(`No work: ${id}`);

    return work;
  }

  /** Delete given work from database; returns undefined.
   *
   * Throws NotFoundError if work not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM works
           WHERE id = $1
           RETURNING id`,
        [id]);
    const work = result.rows[0];

    if (!work) throw new NotFoundError(`No work: ${id}`);
  }
}


module.exports = Work;
