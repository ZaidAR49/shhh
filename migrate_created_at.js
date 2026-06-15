const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  try {
    // 1. Add created_at column with a default of NOW()
    console.log('Adding created_at column...');
    await pool.query(`
      ALTER TABLE public."user"
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
    `);

    // 2. Backfill existing users: use emailVerified if available, otherwise NOW()
    console.log('Backfilling existing users...');
    await pool.query(`
      UPDATE public."user"
      SET created_at = COALESCE("emailVerified", CURRENT_TIMESTAMP)
      WHERE created_at = (
        SELECT column_default::timestamp
        FROM information_schema.columns
        WHERE table_name = 'user' AND column_name = 'created_at'
      ) OR true;
    `);

    // Simpler backfill: just set created_at = emailVerified where emailVerified is not null
    await pool.query(`
      UPDATE public."user"
      SET created_at = "emailVerified"
      WHERE "emailVerified" IS NOT NULL;
    `);

    console.log('Success! created_at column added and backfilled.');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
main();
