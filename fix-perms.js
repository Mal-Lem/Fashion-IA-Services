const {Client} = require('pg');
const c = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '1111',
  database: 'postgres'
});
async function fix() {
  await c.connect();
  await c.query('ALTER USER fap_user CREATEDB;');
  console.log('Droit CREATEDB accorde a fap_user');
  await c.end();
}
fix().catch(e => console.error('ERREUR:', e.message));
