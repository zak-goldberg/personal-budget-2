const { Client } = require('pg');

// Create a new client instance
const pgClient = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
  });
  
// Connect to the PostgreSQL database
pgClient.connect()
  .then(() => console.log('Connected succesfully to the DB.'))
  .catch(err => console.error('Connection error', err.stack));

module.exports = { pgClient };