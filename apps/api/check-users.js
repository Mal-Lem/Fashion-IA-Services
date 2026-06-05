const {Client} = require('pg');
const c = new Client({host:'localhost',port:5432,user:'fap_user',password:'fap_password',database:'fap_dev'});
async function check() {
  await c.connect();
  const res = await c.query('SELECT id, email, role, created_at FROM users');
  console.table(res.rows);
  await c.end();
}
check().catch(e => console.error(e.message));
