"use strict";

const db = require("../db");
const { NotFoundError} = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");


/** Related functions for people. */

class People {
  /** Create a model or artist (from data), update db, return new people data.
   *
   * data should be { fullname, profileImg, role, biography, birthday, nationalities, socialMedia, follower }
   *
   * Returns { fullname, profileImg, role, biography, birthday, nationalities, socialMedia, follower }
   **/

  static async create(data) {
    const result = await db.query(
          `INSERT INTO people (fullname,
                             profile_img,
                             role,
                             biography,
                             birthday,
                             nationalities, 
                             social_media, 
                             follower)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING fullname, profile_img AS "profileImg", role, biography, birthday, nationalities, social_media AS "socialMedia", follower`,
        [
            data.fullname, 
            data.profileImg, 
            data.role, 
            data.biography, 
            data.birthday, 
            data.nationalities, 
            data.socialMedia, 
            data.follower,
        ]);
    let person = result.rows[0];

    return person;
  }

  /** Find all people (optional filter on searchFilters).
   *
   * searchFilters (all optional):
   * - fullname (will find case-insensitive, partial matches)
   * - role (will find case-insensitive, partial matches)
   *
   * Returns [{ fullname, profileImgUrl}, ...]
   * */

  static async findAll({ fullname, role} = {}) {
    let query = `SELECT p.fullname, i.url AS "profileImgUrl"
                 FROM people AS p
                   JOIN images AS i ON p.profile_img = i.id`;
    let whereExpressions = [];
    let queryValues = [];

    // For each possible search term, add to whereExpressions and
    // queryValues so we can generate the right SQL

    if (fullname !== undefined) {
      queryValues.push(`%${fullname}%`);
      whereExpressions.push(`fullname ILIKE $${queryValues.length}`);
    }

    if (role !== undefined) {
      queryValues.push(`%${role}%`);
      whereExpressions.push(`role ILIKE $${queryValues.length}`);
    }

    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    // Finalize query and return results

    query += " ORDER BY fullname";
    const peopleRes = await db.query(query, queryValues);
    return peopleRes.rows;
  }

  /** Given an model or artist full, return data about this person.
   *
   * Returns { fullname, profileImgUrl, role, biography, birthday, 
   *            nationalities, socialMedia, follower, works, relatedPeople }
   *   where works is [{ id, coverImgUrl, title, publishTime, client, type } ...]
   *   Where relatedPeople is [{ fullname, role, profileImgUrl} ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(fullname) {
    const personRes = await db.query(
          `SELECT p.fullname,
                  i.url AS "profileImgUrl",
                  p.role,
                  p.biography,
                  p.birthday, 
                  p.nationalities, 
                  p.social_media AS "socialMedia", 
                  p.follower
           FROM people AS p
            JOIN images AS i ON p.profile_img = i.id
           WHERE p.fullname = $1`, [fullname]);

    const person = personRes.rows[0];

    if (!person) throw new NotFoundError(`No persion: ${fullname}`);

    const worksRes = await db.query(
          `SELECT w.id,
                  MIN(i.url) AS "coverImgUrl",
                  w.title,
                  w.publish_time AS "publishTime",
                  w.client,
                  w.type
            FROM people AS p
                JOIN people_image
                ON p.fullname = people_image.artist
                JOIN images AS i
                ON people_image.image_id = i.id
                JOIN work_image
                ON i.id = work_image.image_id
                JOIN works AS w
                ON w.id = work_image.work_id
            WHERE p.fullname = $1
            GROUP BY w.id`, [fullname]);

    person.works = worksRes.rows;

    const relatedPeopleRes = await db.query(
        `SELECT people.fullname, people.role, images.url AS "profileImgUrl"
            FROM people
            JOIN images
            ON people.profile_img = images.id
            WHERE people.fullname IN
            (SELECT people.fullname
                FROM people
                JOIN people_image
                ON people.fullname = people_image.artist
                JOIN images
                ON people_image.image_id = images.id
                JOIN work_image
                ON images.id = work_image.image_id
                JOIN works
                ON works.id = work_image.work_id
                WHERE works.id IN
                    (SELECT w.id
                        FROM people AS p
                        JOIN people_image
                        ON p.fullname = people_image.artist
                        JOIN images AS i
                        ON people_image.image_id = i.id
                        JOIN work_image
                        ON i.id = work_image.image_id
                        JOIN works AS w
                        ON w.id = work_image.work_id
                        WHERE p.fullname = $1
                        GROUP BY w.id)
                AND people.fullname != $2
                GROUP BY people.fullname
                ORDER BY COUNT(*) DESC);
        `, [fullname, fullname]);

    person.relatedPeople = relatedPeopleRes.rows;
    return person;
  }

  /** Delete given person from database; returns undefined.
   *
   * Throws NotFoundError if person not found.
   **/

  static async remove(fullname) {
    const result = await db.query(
          `DELETE
           FROM people
           WHERE fullname = $1
           RETURNING fullname`, [fullname]);
    const person = result.rows[0];

    if (!person) throw new NotFoundError(`No model or artist: ${fullname}`);
  }
}

module.exports = People;
