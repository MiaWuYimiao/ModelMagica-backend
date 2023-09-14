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

/************************************** POST /people */

describe("POST /peole", function () {
  test("ok for admin", async function () {
    const resp = await request(app)
        .post(`/people`)
        .send({
            fullname: "new",
            profileImg: testImageIds[0],
            role: "Model",
            socialMedia: "https://new/ins.com",
            follower: 100
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      person: {
        fullname: "new",
        profileImg: testImageIds[0],
        role: "Model",
        biography: null,
        birthday: null,
        nationalities: null,
        socialMedia: "https://new/ins.com",
        follower: 100
      },
    });
  });

  test("unauth for users", async function () {
    const resp = await request(app)
        .post(`/people`)
        .send({
            fullname: "new",
            profileImg: testImageIds[0],
            role: "Model",
            socialMedia: "https://new/ins.com",
            follower: 100,
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post(`/people`)
        .send({
            fullname: "new",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post(`/people`)
        .send({
            fullname: "new",
            profileImg: testImageIds[0],
            role: "Model",
            socialMedia: "efs",
            follower: 100,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

});

/************************************** GET /people */

describe("GET /people", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get(`/people`);
    expect(resp.body).toEqual({
          people: [
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
          ],
        },
    );
  });

  test("works: filtering", async function () {
    const resp = await request(app)
        .get(`/people`)
        .query({ fullname: "p" });
    expect(resp.body).toEqual({
          people: [
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
          ],
        },
    );
  });

  test("works: filtering on 2 filters", async function () {
    const resp = await request(app)
        .get(`/people`)
        .query({ fullname: "p", role: "Mo" });
    expect(resp.body).toEqual({
          people: [
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
          ],
        },
    );
  });

  test("bad request on invalid filter key", async function () {
    const resp = await request(app)
        .get(`/people`)
        .query({ nope: "nope" });
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs/:id */

describe("GET /people/:fullname", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/people/p1`);
    expect(resp.body).toEqual({
      person: {
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
      },
    });
  });

  test("not found for no such person", async function () {
    const resp = await request(app).get(`/people/p0`);
    expect(resp.statusCode).toEqual(404);
  });
});


/************************************** DELETE /people/:fullname */

describe("DELETE /people/:fullname", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .delete(`/people/p1`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: "p1" });
  });

  test("unauth for others", async function () {
    const resp = await request(app)
        .delete(`/people/p1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/people/p1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such person", async function () {
    const resp = await request(app)
        .delete(`/people/p0`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
