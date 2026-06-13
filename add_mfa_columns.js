import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    await pool.query(`
      ALTER TABLE "user" 
      ADD COLUMN IF NOT EXISTS "mfa_enabled" boolean DEFAULT false NOT NULL,
      ADD COLUMN IF NOT EXISTS "mfa_secret" text;
    `);
    console.log('Successfully added mfa columns');
  } catch (err) {
    console.error('Error adding columns:', err);
  } finally {
    await pool.end();
  }
}

run();
