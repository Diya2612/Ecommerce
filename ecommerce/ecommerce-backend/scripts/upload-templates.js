/**
 * Standalone Script: Upload CSV import templates to Supabase Storage
 * Uses @supabase/supabase-js with service key.
 * Run with: node scripts/upload-templates.js
 */

const fs = require('fs');
const path = require('path');

// Load dotenv
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  const { createClient } = await import('@supabase/supabase-js');

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
  const BUCKET_NAME = 'uploads';
  const TEMPLATE_FOLDER = 'import-templates';

  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env');
    process.exit(1);
  }

  console.log(`🔑 Using key: ${SUPABASE_SECRET_KEY.substring(0, 20)}...`);
  const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

  const TEMPLATES_DIR = path.resolve(__dirname, '../../anant-enterprises-admin/public/templates');
  console.log(`📁 Templates dir: ${TEMPLATES_DIR}\n`);

  const templates = [
    'customers-template.csv',
    'products-template.csv',
    'tags-template.csv',
    'tiers-template.csv',
    'blogs-template.csv',
    'collections-template.csv',
    'customer-segments-template.csv',
  ];

  console.log('🚀 Uploading import templates to Supabase Storage...\n');

  for (const file of templates) {
    const localPath = path.join(TEMPLATES_DIR, file);
    const storagePath = `${TEMPLATE_FOLDER}/${file}`;

    if (!fs.existsSync(localPath)) {
      console.warn(`⚠️  Not found, skipping: ${file}`);
      continue;
    }

    const buffer = fs.readFileSync(localPath);

    const { error } = await supabase.storage.from(BUCKET_NAME).upload(storagePath, buffer, {
      contentType: 'text/csv',
      upsert: true,
    });

    if (error) {
      console.error(`❌ Failed: ${file} — ${error.message}`);
    } else {
      const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
      console.log(`✅ Uploaded: ${file}`);
      console.log(`   URL: ${data.publicUrl}\n`);
    }
  }

  console.log('✨ Done!');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
