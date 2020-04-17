/*
RDMS: PostgreSQL

Route: db/drop_db.sql

Dev: f97gp1@gmail.com  

Description: Set of queries to drop all the tables.

---

Instruction:
Go to the file
> db/index.js and watch the functon "drop_tables"
*/

ALTER TABLE Commentary DROP CONSTRAINT add_commentary;

ALTER TABLE Post DROP CONSTRAINT contain_resource;

ALTER TABLE Post DROP CONSTRAINT create_post;

ALTER TABLE Commentary DROP CONSTRAINT have_commentary;

DROP TABLE IF EXISTS Commentary CASCADE;

DROP TABLE IF EXISTS Post CASCADE;

DROP TABLE IF EXISTS Resource CASCADE;

DROP TABLE IF EXISTS "User" CASCADE;

