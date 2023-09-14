"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Work = require("./work.js");
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
  const newWork = {
    title: "New",
    client: "New",
    type: "Editorial",
    source: "https://vogue.com",
    publishTime: '2023-11-06',
  };

  test("works", async function () {
    let work = await Work.create(newWork);
    let newId = testWorkIds.slice(-1).at(0) + 1;
    expect(work).toEqual({id:newId, ...newWork});

    const result = await db.query(
          `SELECT title, client, type, source, publish_time AS "publishTime"
           FROM works
           WHERE id = newId`);
    expect(result.rows).toEqual([
      {
        id: newId,
        title: "New",
        client: "New",
        type: "Editorial",
        source: "https://vogue.com",
        publishTime: '2023-11-06',
      },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Work.create(newWork);
      await Work.create(newWork);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: all", async function () {
    let works = await Work.findAll();
    expect(works).toEqual([
      {
        id: testWorkIds[0],
        title: "work1",
        client: "work1",
        type: "Editorial",
        source: "http://w1.com",
        publishTime: '2023-01-01',
      },
      {
        id: testWorkIds[1],
        title: "work2",
        client: "work2",
        type: "Editorial",
        source: "http://w2.com",
        publishTime: '2022-01-01',
      },
      {
        id: testWorkIds[2],
        title: "work3",
        client: "work3",
        type: "Shows",
        source: "http://w3.com",
        publishTime: '2021-01-01',
      },
    ]);
  });

  test("works: by type", async function () {
    let works = await Work.findAll({ type: 'Editorial' });
    expect(works).toEqual([
      {
        id: testWorkIds[0],
        title: "work1",
        client: "work1",
        type: "Editorial",
        source: "http://w1.com",
        publishTime: '2023-01-01',
      },
      {
        id: testWorkIds[1],
        title: "work2",
        client: "work2",
        type: "Editorial",
        source: "http://w2.com",
        publishTime: '2022-01-01',
      },
    ]);
  });

  test("works: by client", async function () {
    let works = await Work.findAll({ client: 'work1' });
    expect(works).toEqual([
      {
        id: testWorkIds[0],
        title: "work1",
        client: "work1",
        type: "Editorial",
        source: "http://w1.com",
        publishTime: '2023-01-01',
      },
    ]);
  });

  test("works: empty list on nothing found", async function () {
    let works = await Work.findAll({ client: "nope" });
    expect(works).toEqual([]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let work = await Work.get(testWorkIds[0]);
    expect(work).toEqual({
      id: testWorkIds[0],
      title: "work1",
      client: "work1",
      type: "Editorial",
      source: "http://w1.com",
      publishTime: '2023-01-01',
      images: [
        { id: testImageIds[0], url: "http://i1.png" },
        { id: testImageIds[5], url: "http://i6.png" },
      ],
      crew: [
        { fullname: "p1", role: "Model" },
        { fullname: "p4", role: "Photographer" },
      ],
    });
  });

  test("not found if no such work", async function () {
    try {
      await Work.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "New",
    client: "New",
    type: "Editorial",
    source: "https://vogue.com",
    publishTime: '2023-11-06',
  };

  test("works", async function () {
    let work = await Work.update(testWorkIds[0], updateData);
    expect(work).toEqual({
      id: testWorkIds[0],
      ...updateData,
    });

    const result = await db.query(
          `SELECT id, title, client, type, source, publish_time
           FROM works
           WHERE id = $1`, [testWorkIds[0]]);
    expect(result.rows).toEqual([{
      id: testWorkIds[0],
      title: "New",
      client: "New",
      type: "Editorial",
      source: "https://vogue.com",
      publishTime: '2023-11-06',
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "New",
      client: "New",
    };

    let work = await Work.update(testWorkIds[0], updateDataSetNulls);
    expect(work).toEqual({
      id: testWorkIds[0],
      title: "New",
      client: "New",
      type: "Editorial",
      source: "http://w1.com",
      publishTime: '2023-01-01',
    });

    const result = await db.query(
          `SELECT id, title, client, type, source, publish_time
          FROM works
          WHERE id = $1`, [testWorkIds[0]]);
    expect(result.rows).toEqual([{
      id: testWorkIds[0],
      title: "New",
      client: "New",
      type: "Editorial",
      source: "http://w1.com",
      publishTime: '2023-01-01',
    }]);
  });

  test("not found if no such work", async function () {
    try {
      await Work.update(0, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Work.update(testWorkIds[0], {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

// /************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Work.remove(testWorkIds[0]);
    const res = await db.query(
        `SELECT title FROM works WHERE id=$1`, [testWorkIds[0]]);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such work", async function () {
    try {
      await Work.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
