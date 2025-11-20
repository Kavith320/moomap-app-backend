const { Pool } = require('pg');
require('dotenv').config();

let pool = null;

try {
  pool = new Pool({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
  });

  pool.connect()
    .then(() => console.log('✅ PostgreSQL connected'))
    .catch((err) => console.error('❌ PostgreSQL connection error:', err.message));
} catch (err) {
  console.error('PostgreSQL init error:', err.message);
}

module.exports = pool;
