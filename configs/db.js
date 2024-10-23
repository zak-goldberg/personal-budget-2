const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL + '?ssl=true';

// Create a new client instance
const pgClient = new Pool({
    connectionString: DATABASE_URL
  });
  
// Connect to the PostgreSQL database
pgClient.connect()
  .then(() => console.log('Connected succesfully to the DB.'))
  .catch(err => console.error('Connection error', err.stack));

module.exports = { pgClient };