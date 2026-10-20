/**
 * Quick verification: check tiers and product-tier assignments.
 * Run: $env:NODE_ENV="development"; npx tsx scripts/seed/verify-tiers.ts
 */
import { db } from '../../src/database';
import { tiers } from '../../src/features/tiers/shared/tiers.schema';
import { products } from '../../src/features/product/shared/products.schema';
import { inArray } from 'drizzle-orm';
import { loadEnv } from '../../src/utils/config/load-env';
loadEnv();

const sportsCodes = [
  'sports',
  'indoor-games',
  'carrom-accessories',
  'carrom-boards',
  'carrom-coins',
  'carrom-strikers',
  'carrom-powder',
  'carrom-covers',
  'boards-beginner',
  'boards-intermediate',
  'boards-tournament',
  'boards-professional',
  'boards-limited-edition',
  'coins-wooden',
  'coins-plastic',
  'coins-professional',
  'coins-tournament',
  'strikers-wooden',
  'strikers-acrylic',
  'strikers-professional',
  'strikers-tournament',
];

const productSkus = [
  'SIS-TE-2026',
  'SIS-PREM-RSE',
  'SIS-CHAMP-PRO',
  'SIS-HERITAGE',
  'SIS-ACC-STRK-PRO',
  'SIS-ACC-COINS-PRO',
];

async function verify() {
  const foundTiers = await db
    .select({ code: tiers.code, name: tiers.name, level: tiers.level })
    .from(tiers)
    .where(inArray(tiers.code, sportsCodes));

  console.log(`\n✅ Found ${foundTiers.length}/${sportsCodes.length} sport tiers:\n`);
  for (const t of foundTiers.sort((a, b) => a.level - b.level)) {
    console.log(`  [L${t.level}] ${t.code.padEnd(30)} "${t.name}"`);
  }

  const foundProducts = await db
    .select({
      sku: products.sku,
      t1: products.category_tier_1,
      t2: products.category_tier_2,
      t3: products.category_tier_3,
      t4: products.category_tier_4,
    })
    .from(products)
    .where(inArray(products.sku, productSkus));

  console.log(`\n📦 Product tier assignments (${foundProducts.length} products):\n`);
  for (const p of foundProducts) {
    const assigned = [p.t1, p.t2, p.t3, p.t4].filter(Boolean).length;
    console.log(`  ${p.sku.padEnd(25)} → ${assigned}/4 tiers assigned`);
  }

  process.exit(0);
}

verify().catch((e) => {
  console.error(e);
  process.exit(1);
});
