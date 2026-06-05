const {Client} = require('pg');
const c = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '1111',
  database: 'postgres'
});
c.connect()
  .then(() => { console.log('CONNECTE !'); c.end(); })
  .catch(e => console.error('ERREUR:', e.message));
