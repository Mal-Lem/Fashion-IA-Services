const {Client} = require('pg');
const c = new Client('postgresql://fap_user@localhost:5432/fap_dev');
c.connect()
  .then(() => { console.log('CONNECTE !'); c.end(); })
  .catch(e => console.error('ERREUR:', e.message));
