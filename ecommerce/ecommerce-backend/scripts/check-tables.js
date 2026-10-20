const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Harshal%401231@db.dignrkmjoogibuarnxvs.supabase.co:5432/postgres' });
async function run() {
  const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
  console.log('Public tables:', res.rows.map(r => r.table_name));
  await pool.end();
}
run();
