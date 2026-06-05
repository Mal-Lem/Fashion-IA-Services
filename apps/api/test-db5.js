const {Client} = require('pg');
const c = new Client({
  host: 'localhost',
  port: 5432,
  user: 'fap_user',
  password: 'fap_password',
  database: 'fap_dev'
});
c.connect()
  .then(() => { console.log('CONNECTE !'); c.end(); })
  .catch(e => console.error('ERREUR:', e.message));
