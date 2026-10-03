const { Client } = require('pg');

async function clean() {
  const client = new Client({ connectionString: 'postgresql://postgres:password@localhost:5432/actumoto?schema=public' });
  await client.connect();
  
  const res = await client.query('DELETE FROM "Review" WHERE id NOT IN (SELECT MIN(id) FROM "Review" GROUP BY "userId", "modelId")');
  console.log('Deleted rows:', res.rowCount);
  
  await client.end();
}

clean().catch(console.error);
