/*
RDMS: PostgreSQL

Route: db/db.sql

Name of the Database: sc_p0st_n_c0ments

Description:  SQL instructions avaliable only during the
creation of the sc_p0st_n_c0ments tables that
will support the CRUD and the RESTfull API
for the assignment.

For document artifacts, the UML-ERD was created
under "Visual Paradigm 16.1".
*/

CREATE TABLE Commentary (
  id_comentary uuid NOT NULL, 
  id_user      uuid NOT NULL, 
  id_post      uuid NOT NULL, 
  text         varchar(280) NOT NULL, 
  created      timestamp NOT NULL, 
  edited       timestamp, 
  PRIMARY KEY (id_comentary));

COMMENT ON COLUMN Commentary.text IS 'The commentary will have the same length as a tweet (from twitter).';

CREATE TABLE Post (
  id_post     uuid NOT NULL, 
  id_user     uuid NOT NULL, 
  id_resource uuid, 
  title       varchar(64) NOT NULL UNIQUE, 
  text        varchar(2048) NOT NULL, 
  created     timestamp NOT NULL, 
  avaliable   bool NOT NULL, 
  -- CONSTRAINT reso 
    PRIMARY KEY (id_post));

CREATE TABLE Resource (
  id_resource uuid NOT NULL, 
  route_name  varchar(128) NOT NULL, 
  PRIMARY KEY (id_resource));

CREATE TABLE "User" (
  id_user   uuid NOT NULL, 
  name      varchar(24) NOT NULL, 
  last_name varchar(24) NOT NULL, 
  created   timestamp NOT NULL, 
  role      varchar(24) NOT NULL, 
  PRIMARY KEY (id_user));

ALTER TABLE Commentary ADD CONSTRAINT add_commentary FOREIGN KEY (id_user) REFERENCES "User" (id_user);

ALTER TABLE Post ADD CONSTRAINT contain_resource FOREIGN KEY (id_resource) REFERENCES Resource (id_resource);

ALTER TABLE Post ADD CONSTRAINT create_post FOREIGN KEY (id_user) REFERENCES "User" (id_user);

ALTER TABLE Commentary ADD CONSTRAINT have_commentary FOREIGN KEY (id_post) REFERENCES Post (id_post);
