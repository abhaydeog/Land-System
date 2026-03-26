const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
 ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('✅ PostgreSQL se connected');
  }
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Helper: run a query
const query = (text, params) => pool.query(text, params);

// Helper: get single client for transactions
const getClient = () => pool.connect();

module.exports = { pool, query, getClient };
