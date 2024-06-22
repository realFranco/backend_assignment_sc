=======================
backend_assignment_sc
=======================

.. image:: https://img.shields.io/badge/Node%20JS-12-green?style=for-the-badge&logo=appveyor
.. image:: https://img.shields.io/badge/DBMS-Postgres-blue?style=for-the-badge&logo=appveyor

Backend assignment.

====================================
List of Dependencies.
====================================

.. code-block:: json

    {
      "body-parser": "^1.19.0",
      "dotenv": "^8.2.0",
      "dotenv-expand": "^5.1.0",
      "express": "^4.17.1",
      "multer": "^1.4.2",
      "pg": "^8.0.2",
      "uuid": "^7.0.3"
    }
    
====================================
Steps to turn on the service.
====================================

1. Create the *Database* at the current user where the service will be used:

.. code-block:: console

   $: Connect to postgres using the current username.
   $: psql -d postgres -U "$whoami" 
   
   $: Create the sc_p0st_n_c0ments database:
   $: CREATE DATABASE sc_p0st_n_c0ments;
 
2. Drive into the root of the folder project.

.. code-block:: console

   $: Execute the command bellow for create the tables from the Database.
   $: node -p "require('./db/index.js').create_tables()"
   
   $: Note.
   $: In case you want to drop the tables, you can do it at the postgreSQL CLI 
   $: psql -d postgres -U "$whoami"
   $: DROP DATABASE sc_p0st_n_c0ments;
 
3. Set up the **Environment Variables**

  - This project use *dotenv* to become easier the environment variables concept.
  - Create a file at the folder route, with the name **.env**
  
    - Please, follow the exact same structure of the example to do not miss in the current step (maybe some values will change on your system).
    
    .. code-block:: console
    
      APP_DOMAIN=localhost 
      APP_PORT=7000

      APP_URL=http://${APP_DOMAIN}:${APP_PORT}

      DB_USER=diuble-lig
      DB_PASSWORD=super_secr3t
      DB_HOST=localhost
      DB_PORT=5432
      DB_DATABASE=sc_p0st_n_c0ments

      DB_CONN=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}
      DB_CONN_DEV=postgresql://${DB_HOST}:${DB_PORT}/${DB_DATABASE}

 
4. You can now run the service:

.. code-block:: console

  $: node app

5. This service has *user interface*, so maybe you can go through the url displayed at the message exported after the command execution.

6. Run the project in localhost using Docker.

.. code-block:: console

  # Clone the project.
  git clone x

  # Copy and fill up the environment variables.
  cp .docker/.env.dist .docker/.env

  docker compose -f .docker/compose.yaml build

  docker compose -f .docker/compose.yaml up

  docker compose -f .docker/compose.yaml down

  # Ref: https://docs.docker.com/engine/reference/commandline/compose_up/.
  # Starts the containers in the background and leaves them running.
  docker compose -f .docker/compose.yaml up --detach

  # Or, run the `db` service only.
  docker compose -f .docker/compose.yaml up db --detach

  # Check if postgres service is live.

  # Instance a `bash` session into the `cli` service.
  docker compose -f .docker/compose.yaml run --rm cli bash

  # Previously, install `postgres` in order to check if is ready for accepting connections.
  pg_isready --host=$POSTGRES_HOST --username=$POSTGRES_USER --port=$POSTGRES_PORT
  > host:5432 - accepting connections

  # Connect into the db from the `cli` container
  psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB

  # Install the Node dependencies.
  npm install

  # Run the application.
  node app


====================================
Endpoint Documentation.
====================================

The set of endpoints that cover the *Blog API* was used principally at Postman, the link bellow will show every endpoint with an entire description.

 - `Sport Compass Blog - Public <https://documenter.getpostman.com/view/6474278/SzmZdLMZ?version=latest>`__

====================================
Database Documentation.
====================================

The database contain an ERD with crow's foot notation: 

 - `ERD <https://github.com/realFranco/backend_assignment_sc/blob/master/public/icons/sport_compass_posts.jpg>`__
 
====================================
Unit Testing.
====================================

One of the requirements for the assingament was use unit testing over the Core of the Project. For this porpuse, the packeage used was *Jest*.

The folder container of the unit testing was named **__test__**

List of unitary testing:
 - post.create.test:  Create a new post.
 - post.edit.test:    Create a post and edited.
 - post.view.test:    Choose the post and return a response with the post.
 - post.delete.test:  Create and delete a post.
 
 To run the unit testing:
 
 .. code-block:: console
 
   $: npm test
   
 If you want to run only one test you can do it!
 
 .. code-block:: console
 
   $: npm test -t post.edit.test # The extension it is not need it.
   
**The two commands bellow need to doing from the root of the project folder.**
   
====================================
Notes from the developer.
====================================

 - UPDATE | DELETE ON CASCASE are not be considered on the sql code generated, deletes are maked manually.
 
 - Since the begining of the project the attr. from the Table Commentary, id_comentary, has wrong writted at the ERD.
 
 - For consistency *snake_case* was used on every own variable & function declared by the developer (camelCase functions definitions are from external libraries).
 
 - The unit test not use mock data to run the tests over every endpoint, but no problem, static data in JSON format was writen inside of the test blocks.
  
 - Remember to quit the typing "q" or "Ctrl+C" when the test are finish.
 
 - The unit testings was not doing from all the project, some functions and endpoints was not tested using Jest.

 - No orm or query builder was used, only raw queries on SQL to change data through the API.
 
 - Enjoy it!
