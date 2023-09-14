CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE images (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL
);

CREATE TABLE people (
  fullname VARCHAR(25) PRIMARY KEY CHECK (fullname = lower(fullname)),
  profile_img INTEGER
    REFERENCES images,
  role TEXT NOT NULL,
  biography TEXT,
  birthday DATE,
  nationalities TEXT,
  social_media TEXT,
  follower INTEGER
);

CREATE TABLE works (
  id SERIAL PRIMARY KEY,
  title TEXT UNIQUE NOT NULL,
  client TEXT NOT NULL,
  type TEXT NOT NULL,
  source TEXT NOT NULL,
  publish_time DATE NOT NULL
);

CREATE TABLE work_image (
  work_id INTEGER
    REFERENCES works ON DELETE CASCADE,
  image_id INTEGER
    REFERENCES images ON DELETE CASCADE,
  PRIMARY KEY (work_id, image_id)
);

CREATE TABLE people_image (
  artist VARCHAR(25)
    REFERENCES people ON DELETE CASCADE,
  image_id INTEGER
    REFERENCES images ON DELETE CASCADE,
  PRIMARY KEY (artist, image_id)
);

CREATE TABLE favorites (
  username VARCHAR(25)
    REFERENCES users ON DELETE CASCADE,
  artist VARCHAR(25)
    REFERENCES people ON DELETE CASCADE,
  PRIMARY KEY (username, artist)
);

CREATE TABLE jobs (
  fullname VARCHAR(25)
    REFERENCES people ON DELETE CASCADE,
  work_id INTEGER
    REFERENCES works ON DELETE CASCADE,
  PRIMARY KEY (fullname, work_id)
);