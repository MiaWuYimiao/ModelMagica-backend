"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testImageIds,
  testWorkIds,
  u1Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /works */

describe("POST /works", function () {
  const newWork = {
    title: "New",
    client: "New",
    type: "Editorial",
    source: "https://vogue.com",
    publishTime: "2023-11-06"
  };

  test("ok for admin", async function () {
    const resp = await request(app)
        .post("/works")
        .send(newWork)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      work: {
        id: expect.any(Number),
        title: "New",
        client: "New",
        type: "Editorial",
        source: "https://vogue.com",
        publishTime: "2023-11-06"
      },
    });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
        .post("/works")
        .send(newWork)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/works")
        .send({
          client: "New",
          type: "Editorial",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/works")
        .send({
          ...newWork,
          source: "not-a-url",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /works */

describe("GET /works", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/works");
    expect(resp.body).toEqual({
      works:
          [
            {
              id: testWorkIds[0],
              title: "work1",
              client: "work1",
              type: "Editorial",
              source: "http://w1.com",
              publishTime: '2023-01-01',
              url: "http://i1.png",
            },
            {
              id: testWorkIds[1],
              title: "work2",
              client: "work2",
              type: "Editorial",
              source: "http://w2.com",
              publishTime: '2022-01-01',
              url: "http://i2.png",
            },
            {
              id: testWorkIds[2],
              title: "work3",
              client: "work3",
              type: "Shows",
              source: "http://w3.com",
              publishTime: '2021-01-01',
              url: "http://i8.png",
            },
          ],
    });
  });

  test("works: filtering", async function () {
    const resp = await request(app)
        .get("/works")
        .query({ type: "Editorial"});
    expect(resp.body).toEqual({
      works: [
        {
          id: testWorkIds[0],
          title: "work1",
          client: "work1",
          type: "Editorial",
          source: "http://w1.com",
          publishTime: '2023-01-01',
          url: "http://i1.png",
        },
        {
          id: testWorkIds[1],
          title: "work2",
          client: "work2",
          type: "Editorial",
          source: "http://w2.com",
          publishTime: '2022-01-01',
          url: "http://i2.png",
        },
      ],
    });
  });

  test("works: filtering on all filters", async function () {
    const resp = await request(app)
        .get("/works")
        .query({ type: "Editorial", client: "work2"});
    expect(resp.body).toEqual({
      works: [
        {
          id: testWorkIds[1],
          title: "work2",
          client: "work2",
          type: "Editorial",
          source: "http://w2.com",
          publishTime: '2022-01-01',
          url: "http://i2.png",
        },
      ],
    });
  });

  test("bad request if invalid filter key", async function () {
    const resp = await request(app)
        .get("/works")
        .query({ type: "Editorial", nope: "nope" });
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /companies/:handle */

describe("GET /works/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/works/${testWorkIds[0]}`);
    expect(resp.body).toEqual({
      work: {
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
      },
    });
  });

  test("not found for no such work", async function () {
    const resp = await request(app).get(`/companies/nope`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /works/:id */

describe("PATCH /works/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .patch(`/works/${testWorkIds[0]}`)
        .send({
          title: "new",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      work: {
        id: testWorkIds[0],
        title: "new",
        client: "work1",
        type: "Editorial",
        source: "http://w1.com",
        publishTime: '2023-01-01',
      },
    });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
        .patch(`/works/${testWorkIds[0]}`)
        .send({
          title: "new",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/works/${testWorkIds[0]}`)
        .send({
          title: "new",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such work", async function () {
    const resp = await request(app)
        .patch(`/companies/nope`)
        .send({
          title: "new",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on id change attempt", async function () {
    const resp = await request(app)
        .patch(`/works/${testWorkIds[0]}`)
        .send({
          id: 0,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/works/${testWorkIds[0]}`)
        .send({
          source: "not-a-url",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /works/:id */

describe("DELETE /works/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .delete(`/works/${testWorkIds[0]}`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: testWorkIds[0] });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
        .delete(`/works/${testWorkIds[0]}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/works/${testWorkIds[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such work", async function () {
    const resp = await request(app)
        .delete(`/works/0`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
