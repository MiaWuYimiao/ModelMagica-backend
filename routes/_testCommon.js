"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Work = require("../models/work");
const People = require("../models/people");
const Image = require("../models/image");
const { createToken } = require("../helpers/tokens");

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

  testImageIds[0] = (await Image.create({url: "http://i1.png"})).id;
  testImageIds[1] = (await Image.create({url: "http://i2.png"})).id;
  testImageIds[2] = (await Image.create({url: "http://i3.png"})).id;
  testImageIds[3] = (await Image.create({url: "http://i4.png"})).id;
  testImageIds[4] = (await Image.create({url: "http://i5.png"})).id;
  testImageIds[5] = (await Image.create({url: "http://i6.png"})).id;
  testImageIds[6] = (await Image.create({url: "http://i7.png"})).id;
  testImageIds[7] = (await Image.create({url: "http://i8.png"})).id;

  testWorkIds[0] = (await Work.create(
      {
        title: "work1", 
        client: "work1", 
        type: "Editorial", 
        source: "http://w1.com", 
        publishTime: "2023-01-01"
      })).id;
  testWorkIds[1] = (await Work.create(
      {
        title: "work2", 
        client: "work2", 
        type: "Editorial", 
        source: "http://w2.com", 
        publishTime: "2022-01-01"
      })).id;
  testWorkIds[2] = (await Work.create(
      {
        title: "work3", 
        client: "work3", 
        type: "Shows", 
        source: "http://w3.com", 
        publishTime: "2021-01-01"
      })).id;

  await People.create(
      { fullname: "p1", profileImg: testImageIds[0], role: "Model", biography: "p1", 
        birthday: "2000-01-01", nationalities: "US", socialMedia: "p1/ins", follower: 100});
  await People.create(
      { fullname: "p2", profileImg: testImageIds[1], role: "Model", biography: "p2", 
        birthday: "2000-01-01", nationalities: "US", socialMedia: "p2/ins", follower: 100});
  await People.create(
      { fullname: "p3", profileImg: testImageIds[2], role: "Model", biography: "p3", 
        birthday: "2000-01-01", nationalities: "US", socialMedia: "p3/ins", follower: 100});
  await People.create(
      { fullname: "p4", profileImg: testImageIds[3], role: "Photographer", biography: "p4", 
        birthday: "2000-01-01", nationalities: "US", socialMedia: "p4/ins", follower: 100});
  await People.create(
      { fullname: "p5", profileImg: testImageIds[4], role: "Stylist", biography: "p5", 
        birthday: "2000-01-01", nationalities: "US", socialMedia: "p5/ins", follower: 100});


  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: false,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: false,
  });
  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
  });

  await Image.addWorkImage(testWorkIds[0], testImageIds[0]);
  await Image.addWorkImage(testWorkIds[0], testImageIds[5]);
  await Image.addWorkImage(testWorkIds[1], testImageIds[1]);
  await Image.addWorkImage(testWorkIds[1], testImageIds[2]);
  await Image.addWorkImage(testWorkIds[1], testImageIds[6]);
  await Image.addWorkImage(testWorkIds[2], testImageIds[7]);

  await Image.addPeopleImage('p1', testImageIds[0]);   
  await Image.addPeopleImage('p4', testImageIds[0]);
  await Image.addPeopleImage('p2', testImageIds[1]);
  await Image.addPeopleImage('p4', testImageIds[1]);
  await Image.addPeopleImage('p3', testImageIds[2]);
  await Image.addPeopleImage('p4', testImageIds[2]);
  await Image.addPeopleImage('p5', testImageIds[2]);
  await Image.addPeopleImage('p4', testImageIds[3]);
  await Image.addPeopleImage('p5', testImageIds[4]);
  await Image.addPeopleImage('p1', testImageIds[5]);
  await Image.addPeopleImage('p2', testImageIds[6]);
  await Image.addPeopleImage('p4', testImageIds[6]);
  await Image.addPeopleImage('p3', testImageIds[7]);
  await Image.addPeopleImage('p5', testImageIds[7]);

  await User.addFavorite("u1", "p1");
  await User.addFavorite("u1", "p2");
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


const u1Token = createToken({ username: "u1", isAdmin: false });
const u2Token = createToken({ username: "u2", isAdmin: false });
const adminToken = createToken({ username: "admin", isAdmin: true });


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testImageIds,
  testWorkIds,
  u1Token,
  u2Token,
  adminToken,
};
