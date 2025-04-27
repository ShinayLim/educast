import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/pg-pool';
import * as schema from "@shared/schema";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// For Windows local development
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Uncomment and use these options if connectionString doesn't work
  /*
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'educationalpodcast',
  */
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : undefined
});

export const db = drizzle(pool, { schema });