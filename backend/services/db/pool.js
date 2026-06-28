const { Pool } = require('pg');

// In a real production app, you would use process.env for these values
// e.g., user: process.env.DB_USER
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'dropbox_clone',
    password: 'password',
    port: 5432,
    // Good practice: limit how many connections the pool can open at once
    max: 20, 
    idleTimeoutMillis: 30000,
});

// A safety net to log any unexpected errors from idle connections
pool.on('error', (err, client) => {
    console.error('[DB] Unexpected error on idle client', err);
    process.exit(-1);
});

console.log('[DB] PostgreSQL pool initialized.');

module.exports = pool;
