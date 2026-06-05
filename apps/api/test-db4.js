const {Client} = require('pg');
const c = new Client({
  host: 'localhost',
  port: 5432,
  user: 'fap_user',
  password: null,
  database: 'fap_dev',
  ssl: false
});
c.connect()
  .then(() => { console.log('CONNECTE !'); c.end(); })
  .catch(e => console.error('ERREUR:', e.message));
