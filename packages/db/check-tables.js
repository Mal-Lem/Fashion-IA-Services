const {Client} = require('pg');
const c = new Client({
  host: 'localhost',
  port: 5432,
  user: 'fap_user',
  password: 'fap_password',
  database: 'fap_dev'
});
async function check() {
  await c.connect();
  const res = await c.query("SELECT tablename FROM pg_tables WHERE schemaname='public'");
  console.log('Tables:', res.rows.map(r => r.tablename).join(', '));
  await c.end();
}
check().catch(e => console.error('ERREUR:', e.message));
