"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Image = require("./image.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testImageIds,
  testWorkIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  test("images", async function () {
    let image = await Image.create({url: "http://new.png"});

    expect(image).toEqual({
        id: expect.any(Number), 
        url: "http://new.png"
    });

    const result = await db.query(
          `SELECT id, url
           FROM images
           WHERE id = $1`, [image.id]);
    expect(result.rows).toEqual([
      {
        id: image.id,
        url: "http://new.png"
      },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Image.create({url: "http://new.png"});
      await Image.create({url: "http://new.png"});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** getImageCrew */

describe("getImageCrew", function () {
  test("works", async function () {
    let crew = await Image.getCrew(testImageIds[0]);
    expect(crew).toEqual([{
      fullname: "p1",
      role: "Model"
    },
    {
      fullname: "p4",
      role: "Photographer"
    }])
  });

  test("not found if no such image", async function () {
    try {
      await Image.getCrew(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});


/************************************** addWorkImage*/

describe("addWorkImage", function () {
    test("image", async function () {
      await Image.addWorkImage(testWorkIds[2], testImageIds[3]);
  
      const res = await db.query(
          "SELECT * FROM work_image WHERE image_id=$1", [testImageIds[3]]);
      expect(res.rows).toEqual([{
        work_id: testWorkIds[2],
        image_id: testImageIds[3]
      }]);
    });
  
    test("not found if no such work", async function () {
      try {
        await Image.addWorkImage(0, testImageIds[3]);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  
    test("not found if no such image", async function () {
      try {
        await Image.addWorkImage(testWorkIds[2], 0);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
});

/************************************** addPeopleImage*/

describe("addPeopleImage", function () {
    test("image", async function () {
      await Image.addPeopleImage("p1", testImageIds[4]);
  
      const res = await db.query(
          "SELECT * FROM people_image WHERE image_id=$1", [testImageIds[4]]);
      expect(res.rows).toEqual([
        {
            artist: "p5",
            image_id: testImageIds[4]
        },
        {
            artist: "p1",
            image_id: testImageIds[4]
        }
    ]);
    });
  
    test("not found if no such person", async function () {
      try {
        await Image.addPeopleImage("p0", testImageIds[4]);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  
    test("not found if no such image", async function () {
      try {
        await Image.addPeopleImage("p1", 0);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
});