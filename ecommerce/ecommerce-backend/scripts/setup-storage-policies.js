const { Client } = require('pg');
require('dotenv').config({ path: 'c:/Users/diyab/Downloads/Diya_projects/ecommerce/ecommerce-backend/.env' });

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log('Adding storage policies for bucket "Ecommerce Org"...');

  // Allow public read on Ecommerce Org bucket
  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access Ecommerce Org'
      ) THEN
        CREATE POLICY "Public Access Ecommerce Org" ON storage.objects
        FOR SELECT
        USING (bucket_id = 'Ecommerce Org');
      END IF;
    END
    $$;
  `);

  // Allow authenticated users to upload to Ecommerce Org
  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated Upload Ecommerce Org'
      ) THEN
        CREATE POLICY "Authenticated Upload Ecommerce Org" ON storage.objects
        FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'Ecommerce Org');
      END IF;
    END
    $$;
  `);

  // Allow authenticated users to update/delete in Ecommerce Org
  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated Update Ecommerce Org'
      ) THEN
        CREATE POLICY "Authenticated Update Ecommerce Org" ON storage.objects
        FOR UPDATE
        TO authenticated
        USING (bucket_id = 'Ecommerce Org');
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated Delete Ecommerce Org'
      ) THEN
        CREATE POLICY "Authenticated Delete Ecommerce Org" ON storage.objects
        FOR DELETE
        TO authenticated
        USING (bucket_id = 'Ecommerce Org');
      END IF;
    END
    $$;
  `);

  console.log('✅ Storage policies created successfully.');
  await client.end();
}

main().catch(console.error);
