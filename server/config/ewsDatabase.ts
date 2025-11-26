/**
 * Database Configuration
 * PostgreSQL connection pool for GCP database
 */

import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables FIRST before creating pool
dotenv.config();

// Create PostgreSQL connection pool
export const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Connection event handlers
pool.on('connect', () => {
  console.log('✅ EWS PostgreSQL database connected');
});

pool.on('error', (err: Error) => {
  console.error('❌ EWS PostgreSQL database connection error:', err);
});

// Test connection on startup
pool.query('SELECT NOW()')
  .then((res: { rows: Array<{ now: Date }> }) => {
    console.log('✅ Database connection test successful:', res.rows[0].now);
  })
  .catch((err: Error) => {
    console.error('❌ Database connection test failed:', err);
  });

export default pool;
