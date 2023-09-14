const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

const testImageIds = [];
const testWorkIds = [];

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM works");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM people");  
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM images");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM work_image");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM people_image");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM favorites");

  const resultsImages = await db.query(`
    INSERT INTO images(url)
    VALUES ('http://i1.png'),
          ('http://i2.png'),
          ('http://i3.png'),
          ('http://i4.png'),
          ('http://i5.png'),
          ('http://i6.png'),
          ('http://i7.png'),
          ('http://i8.png')
    RETURNING id`);
  testImageIds.splice(0, 0, ...resultsImages.rows.map(r => r.id));

  const resultWorks = await db.query(`
    INSERT INTO works(title, client, type, source, publish_time)
    VALUES ('work1', 'work1', 'Editorial', 'http://w1.com', '2023-01-01'),
           ('work2', 'work2', 'Editorial', 'http://w2.com', '2022-01-01'),
           ('work3', 'work3', 'Shows', 'http://w3.com', '2021-01-01')
    RETURNING id`);
  testWorkIds.splice(0, 0, ...resultWorks.rows.map(r => r.id));
  
  await db.query(`
    INSERT INTO people(fullname, profile_img, role, biography, birthday, nationalities, social_media, follower)
    VALUES ('p1', $1, 'Model', 'p1', '2000-01-01', 'US', 'p1/ins', 100),
           ('p2', $2, 'Model', 'p2', '2000-01-01', 'US', 'p2/ins', 100),
           ('p3', $3, 'Model', 'p3', '2000-01-01', 'US', 'p3/ins', 100),
           ('p4', $4, 'Photographer', 'p4', '2000-01-01', 'US', 'p4/ins', 100),
           ('p5', $5, 'Stylist', 'p5', '2000-01-01', 'US', 'p5/ins', 100)`,
    [testImageIds[0], testImageIds[1], testImageIds[2], testImageIds[3], testImageIds[4]]);



  await db.query(`
        INSERT INTO users(username,
                          password,
                          first_name,
                          last_name,
                          email)
        VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com'),
               ('u2', $2, 'U2F', 'U2L', 'u2@email.com')
        RETURNING username`,
      [
        await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
        await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
      ]);

  await db.query(`
        INSERT INTO work_image(work_id, image_id)
        VALUES ($1, $2), ($3, $4), 
               ($5, $6), ($7, $8), ($9, $10), 
               ($11, $12)`,
      [testWorkIds[0], testImageIds[0], testWorkIds[0], testImageIds[5],
       testWorkIds[1], testImageIds[1], testWorkIds[1], testImageIds[2], testWorkIds[1], testImageIds[6],
       testWorkIds[2], testImageIds[7]]);
  
  await db.query(`
        INSERT INTO people_image(artist, image_id)
        VALUES ('p1', $1), ('p4', $2), 
               ('p2', $3), ('p4', $4), 
               ('p3', $5), ('p4', $6), ('p5', $7),
               ('p4', $8), 
               ('p5', $9), 
               ('p1', $10), 
               ('p2', $11), ('p4', $12), 
               ('p3', $13), ('p5', $14)`,
      [testImageIds[0], testImageIds[0], 
      testImageIds[1], testImageIds[1],
      testImageIds[2], testImageIds[2], testImageIds[2],
      testImageIds[3], 
      testImageIds[4],
      testImageIds[5],
      testImageIds[6], testImageIds[6], 
      testImageIds[7], testImageIds[7]]);
  
  await db.query(`
        INSERT INTO favorites(username, artist)
        VALUES ('u1', 'p1'), ('u1', 'p2')`);
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testImageIds,
  testWorkIds
};