const { Client } = require('pg');

// Create a new client instance
// TO-DO: change to environmental variables
const pgClient = new Client({
    user: 'zakgoldberg',
    host: 'localhost',
    database: 'personal_budget',
    password: '',
    port: 5432
  });
  
// Connect to the PostgreSQL database
pgClient.connect()
  .then(() => console.log('Connected succesfully to the DB.'))
  .catch(err => console.error('Connection error', err.stack));

module.exports = { pgClient };