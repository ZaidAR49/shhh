require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    await pool.query('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "image" text;');
    console.log('Successfully added image column to user table');
  } catch (e) {
    console.error('DB Error:', e);
  } finally {
    pool.end();
  }
}

main();
