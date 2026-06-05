const {Client} = require('pg');
const c = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '1111',
  database: 'postgres'
});
async function setup() {
  await c.connect();
  console.log('Connecte en tant que postgres...');
  await c.query("CREATE USER fap_user WITH PASSWORD 'fap_password';");
  console.log('Utilisateur fap_user cree');
  await c.query('CREATE DATABASE fap_dev OWNER fap_user;');
  console.log('Base fap_dev creee');
  await c.query('GRANT ALL PRIVILEGES ON DATABASE fap_dev TO fap_user;');
  console.log('Privileges accordes');
  await c.end();
  console.log('Setup termine !');
}
setup().catch(e => console.error('ERREUR:', e.message));
