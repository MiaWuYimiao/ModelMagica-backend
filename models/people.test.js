"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db.js");
const People = require("./people.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testImageIds,
  testWorkIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  test("works", async function () {
    let newPerson = {
        fullname: "new",
        profileImg: testImageIds[0],
        role: "Model",
        biography: null,
        birthday: null,
        nationalities: null,
        socialMedia: "new/ins.com",
        follower: 100
    };

    let person = await People.create(newPerson);
    expect(person).toEqual(newPerson);
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let people = await People.findAll();
    expect(people).toEqual([
      {
        fullname: "p1",
        profileImgUrl: "http://i1.png"
      },
      {
        fullname: "p2",
        profileImgUrl: "http://i2.png"
      },
      {
        fullname: "p3",
        profileImgUrl: "http://i3.png"
      },
      {
        fullname: "p4",
        profileImgUrl: "http://i4.png"
      },
      {
        fullname: "p5",
        profileImgUrl: "http://i5.png"
      },
    ]);
  });

  test("works: by partial fullname", async function () {
    let people = await People.findAll({ fullname: "p" });
    expect(people).toEqual([
      {
        fullname: "p1",
        profileImgUrl: "http://i1.png"
      },
      {
        fullname: "p2",
        profileImgUrl: "http://i2.png"
      },
      {
        fullname: "p3",
        profileImgUrl: "http://i3.png"
      },
      {
        fullname: "p4",
        profileImgUrl: "http://i4.png"
      },
      {
        fullname: "p5",
        profileImgUrl: "http://i5.png"
      },
    ]);
  });

  test("works: by fullname", async function () {
    let people = await People.findAll({ fullname: "p1" });
    expect(people).toEqual([
        {
            fullname: "p1",
            profileImgUrl: "http://i1.png"
        },
    ]);
  });

  test("people: by role", async function () {
    let people = await People.findAll({ role: "Model" });
    expect(people).toEqual([
      {
        fullname: "p1",
        profileImgUrl: "http://i1.png"
      },
      {
        fullname: "p2",
        profileImgUrl: "http://i2.png"
      },
      {
        fullname: "p3",
        profileImgUrl: "http://i3.png"
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let person = await People.get("p1");
    expect(person).toEqual({
      fullname: "p1",
      profileImgUrl: "http://i1.png",
      role: "Model",
      biography: "p1",
      birthday: "2000-01-01",
      nationalities: "US",
      socialMedia: "p1/ins",
      follower: 100,
      works: [
        {
            id: testWorkIds[0],
            coverImgUrl: "http://i1.png",
            title: "work1",
            publishTime: "2023-01-01",
            client: "work1",
            type: "Editorial"
        },
      ],
      relatedPeople:[
        {
            fullname: "p4",
            role: "Photographer",
            profileImgUrl: "http://i4.png"
        }
      ],
    });
  });

  test("not found if no such person", async function () {
    try {
      await People.get("p0");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});


/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await People.remove("p1");
    const res = await db.query(
        "SELECT fullname FROM people WHERE fullname=$1", ["p1"]);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such person", async function () {
    try {
      await People.remove("p0");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
