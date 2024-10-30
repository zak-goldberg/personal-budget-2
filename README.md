# Personal Budget Pt. 2

## Getting Started
### Database
To set up the database, [create a PostgreSQL database](https://tomcam.github.io/postgres/#creating-a-database), connect to the database, and run the following commands in `psql` (make sure the pwd is the root folder of the repository):
``` bash
\i configs/db-tables-indexes.sql
\i configs/db-functions-triggers.sql
\i test/test-data.sql
```
### Server
To start the server run the following commands in the root folder.
1. Install dependencies:
``` bash
npm install
```
2. Start the server using the DATABASE_URL environmental variable. Update the portion in `<>` with releavant values.
``` bash
DATABASE_URL=<postgresql://username:password@host:port/database_name> node app.js
```
### Documentation
- [PostgreSQL DB Diagram](https://dbdiagram.io/d/Personal-Budget-Part-2-670f078197a66db9a31ca699)
- [Open API 3.0 Documentation](./docs/api-doc.yaml)

## Overview (Codecademy)
The requirements for this project were detailed as part of a portfolio project in the [Codecademy Back End Engineer path](https://www.codecademy.com/learn/paths/back-end-engineer-career-path). I added scope (automated testing) to help me practice. Here is their description of the project:
> You will extend the Personal Budget API created in [Personal Budget, Part I](https://github.com/zak-goldberg/Personal-Budget-1). In the first Budget API, we did not have a way to persist data on the server. Now, we will build out a persistence layer (aka a database or DB) to keep track of the budget envelopes and their balances. You will need to plan out your database design, then use PostgreSQL to create the necessary tables. Once your database is set up, connect your API calls to a database. Once you’ve added and connected your database, you will add a new feature to your server that allows users to enter expenses. This feature will put your envelope system into action! Finally, you will make your API available for others to use by documenting it with Swagger and deploying it with Render.

## Project Objectives (Codecademy)
- Use Git version control
- Create documentation using the Swagger API
- Implement a database
- Integrate existing API endpoints with the database layer
- Database implementation for expenses
- Deploy the application using Render
- Write integration tests using Supertest, Mocha, and Chai (Me)

## Assumptions (Me)
- One to many mapping between envelopes -> expenses
- One to one mapping between expenses -> envelopes

## Roadblocks & Learnings (Me)
- Don't use camel case for PostgreSQL item naming unless you hate yourself.
- Be careful with DB constraints in PostgreSQL:
  - I had `FOREIGN KEY` and `NOT NULL` constraints for the `envelope_id` column in my `envelope_audit` table, which made it impossible to delete records from the `envelopes` table.
  - If a trigger runs AFTER DELETE on a base table to add a corresponding row in an audit table but the audit table has a foreign key constraint on the primary key from the base table, PostgreSQL will throw a foreign key violation error.
- Updated from using `pg` `Client` object to connect to DB to `Pool` object after deploying the service. Used `connectionString` instead of specific environmental variables for each property of the connection string (e.g. host name, port, etc.).
- I should have used ES syntax for importing/exporting modules instead of CommonJS. ES allows for tree-shaking and current versions of some dependencies no longer support CommonJS (I ran into this with Chai).
