const { Client } = require('pg');
require('dotenv').config({path: '.env.local'});
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(() => client.query('UPDATE public."user" SET role = $1', ['admin']))
  .then(res => { console.log('Updated users:', res.rowCount); client.end(); })
  .catch(err => console.error(err));
