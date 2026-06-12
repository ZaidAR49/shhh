require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    const res = await pool.query(`select "account"."userId", "account"."type", "account"."provider", "account"."providerAccountId", "account"."refresh_token", "account"."access_token", "account"."expires_at", "account"."token_type", "account"."scope", "account"."id_token", "account"."session_state", "user"."id", "user"."name", "user"."email", "user"."emailVerified", "user"."image" from "account" inner join "user" on "account"."userId" = "user"."id" where ("account"."provider" = $1 and "account"."providerAccountId" = $2)`, ['google', '123']);
    console.log(res.rows);
  } catch (e) {
    console.error('DB Error:', e);
  } finally {
    pool.end();
  }
}

main();
