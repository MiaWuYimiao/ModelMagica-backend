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

/************************************** POST /images */

describe("POST /images", function () {
  test("ok for admin", async function () {
    const resp = await request(app)
        .post(`/images`)
        .send({ url: "http://new.png" })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      image: {
        id: expect.any(Number),
        url: "http://new.png"
      },
    });
  });

  test("unauth for users", async function () {
    const resp = await request(app)
        .post(`/images`)
        .send({ url: "http://new.png" })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post(`/images`)
        .send({})
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post(`/images`)
        .send({ url: "new.png" })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /:id/people */

describe("GET /images/:id/people", function () {
  test("works", async function () {
    const resp = await request(app).get(`/images/${testImageIds[0]}/people`);
    expect(resp.body).toEqual({
      crew: [
        { 
          fullname: "p1",
          role: "Model"
        },
        { 
          fullname: "p4",
          role: "Photographer"
        }
      ]
    });
  });

  test("not found for no such image", async function () {
    const resp = await request(app).get(`/0/people`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** POST /images/:id/works/:workid */

describe("POST /images/:id/works/:workid", function () {
    test("works for admin", async function () {
      const resp = await request(app)
          .post(`/images/${testImageIds[0]}/works/${testWorkIds[1]}`)
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.body).toEqual({ addedWorkImg: [testWorkIds[1], testImageIds[0]] });
    });
  
    test("unauth for user", async function () {
      const resp = await request(app)
          .post(`/images/${testImageIds[0]}/works/${testWorkIds[1]}`)
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(401);
    });
  
    test("unauth for anon", async function () {
      const resp = await request(app)
          .post(`/images/${testImageIds[0]}/works/${testWorkIds[1]}`);
      expect(resp.statusCode).toEqual(401);
    });
  
    test("not found for no such image", async function () {
      const resp = await request(app)
          .post(`/images/0/works/${testWorkIds[1]}`)
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.statusCode).toEqual(404);
    });
  
    test("not found for no such work", async function () {
      const resp = await request(app)
          .post(`/images/${testImageIds[0]}/works/0`)
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.statusCode).toEqual(404);
    });
  });


/************************************** POST /images/:id/people/:artist */

describe("POST /images/:id/people/:artist", function () {
    test("works for admin", async function () {
      const resp = await request(app)
          .post(`/images/${testImageIds[0]}/people/p2`)
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.body).toEqual({ addedPplImg: ["p2", testImageIds[0]] });
    });
  
    test("unauth for user", async function () {
      const resp = await request(app)
          .post(`/images/${testImageIds[0]}/people/p1`)
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(401);
    });
  
    test("unauth for anon", async function () {
      const resp = await request(app)
          .post(`/images/${testImageIds[0]}/people/p1`);
      expect(resp.statusCode).toEqual(401);
    });
  
    test("not found for no such image", async function () {
      const resp = await request(app)
          .post(`/images/0/people/p1`)
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.statusCode).toEqual(404);
    });
  
    test("not found for no such person", async function () {
      const resp = await request(app)
          .post(`/images/${testImageIds[0]}/people/p0`)
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.statusCode).toEqual(404);
    });
  });
