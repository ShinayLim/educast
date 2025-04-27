import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/pg-pool';
import * as schema from "@shared/schema";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check if required environment variables are set
if (!process.env.PGHOST || !process.env.PGUSER || !process.env.PGPASSWORD || !process.env.PGDATABASE) {
  throw new Error(
    "Database environment variables (PGHOST, PGUSER, PGPASSWORD, PGDATABASE) must be set in your .env file"
  );
}

// Create pool with individual parameters instead of connection string
export const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: parseInt(process.env.PGPORT || '5432'),
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Create drizzle instance
export const db = drizzle(pool, { schema });

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Closing database connections...');
  pool.end();
  process.exit(0);
});