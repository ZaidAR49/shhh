const { Client } = require('pg');
require('dotenv').config({path: '.env.local'});
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect()
  .then(() => client.query('SELECT email, role FROM public."user"'))
  .then(res => { console.log('Users:', res.rows); client.end(); })
  .catch(err => console.error(err));
