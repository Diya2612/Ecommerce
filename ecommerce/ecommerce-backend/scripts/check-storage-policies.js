const { Client } = require('pg');
require('dotenv').config({ path: 'c:/Users/diyab/Downloads/Diya_projects/ecommerce/ecommerce-backend/.env' });

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const res = await client.query("SELECT tablename, policyname, cmd, roles, qual, with_check FROM pg_policies WHERE schemaname = 'storage'");
  console.log('STORAGE POLICIES:', JSON.stringify(res.rows, null, 2));
  await client.end();
}

main().catch(console.error);
