/**
 * Seed: Tiers
 *
 * Creates a complete 4-level category hierarchy for the SISCAA carrom sports platform.
 * Designed to match the PremiumMegaMenu taxonomy and product category_tier_1/2/3/4 columns.
 *
 * Level 1 — Root        (e.g. Sports & Games)
 * Level 2 — Main        (e.g. Indoor Games, Carrom Accessories)
 * Level 3 — Subcategory (e.g. Carrom Boards, Carrom Coins, Carrom Strikers)
 * Level 4 — Product Type(e.g. Tournament Boards, Professional Coins)
 *
 * Run (Windows PowerShell):
 *   $env:NODE_ENV="development"; npx tsx scripts/seed/seed-tiers.ts
 */

import { db } from '../../src/database';
import { tiers } from '../../src/features/tiers/shared/tiers.schema';
import { products } from '../../src/features/product/shared/products.schema';
import { logger } from '../../src/utils/logging/logger';
import { eq, inArray } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';
import { loadEnv } from '../../src/utils/config/load-env';
loadEnv();

// ─── Types ────────────────────────────────────────────────────────────────────

interface TierDef {
  code: string;
  name: string;
  description: string;
  level: number;
  parentCode: string | null;
  priority: number;
}

// ─── Tier Definitions ─────────────────────────────────────────────────────────
// Ordered: parents before children.

const TIER_DEFS: TierDef[] = [
  // ── Level 1: Root ──────────────────────────────────────────────────────────
  {
    code: 'sports',
    name: 'Sports & Games',
    description: 'All sports, games, and recreational equipment sold on the platform.',
    level: 1,
    parentCode: null,
    priority: 1,
  },

  // ── Level 2: Main Categories ───────────────────────────────────────────────
  {
    code: 'indoor-games',
    name: 'Indoor Games',
    description: 'Indoor board games and tabletop sports including carrom, chess, and ludo.',
    level: 2,
    parentCode: 'sports',
    priority: 1,
  },
  {
    code: 'carrom-accessories',
    name: 'Carrom Accessories',
    description: 'All accessories for carrom play — coins, strikers, powder, covers, and stands.',
    level: 2,
    parentCode: 'sports',
    priority: 2,
  },

  // ── Level 3: Subcategories ─────────────────────────────────────────────────
  {
    code: 'carrom-boards',
    name: 'Carrom Boards',
    description: 'Full range of carrom boards from beginner to international tournament standard.',
    level: 3,
    parentCode: 'indoor-games',
    priority: 1,
  },
  {
    code: 'carrom-coins',
    name: 'Carrom Coins',
    description: 'Carrom coins in wood, plastic, and acrylic for all skill levels and use cases.',
    level: 3,
    parentCode: 'carrom-accessories',
    priority: 1,
  },
  {
    code: 'carrom-strikers',
    name: 'Carrom Strikers',
    description: 'Precision-engineered strikers in various weights and materials for any player.',
    level: 3,
    parentCode: 'carrom-accessories',
    priority: 2,
  },
  {
    code: 'carrom-powder',
    name: 'Carrom Powder',
    description: 'Boric powder and specialized sliding powder to maintain optimal board speed.',
    level: 3,
    parentCode: 'carrom-accessories',
    priority: 3,
  },
  {
    code: 'carrom-covers',
    name: 'Board Covers & Stands',
    description: 'Protective covers, carry bags, folding stands, and storage solutions for boards.',
    level: 3,
    parentCode: 'carrom-accessories',
    priority: 4,
  },

  // ── Level 4: Product Types — Boards ────────────────────────────────────────
  {
    code: 'boards-beginner',
    name: 'Beginner Boards',
    description: 'Entry-level carrom boards ideal for beginners, families, and casual home play.',
    level: 4,
    parentCode: 'carrom-boards',
    priority: 1,
  },
  {
    code: 'boards-intermediate',
    name: 'Intermediate Boards',
    description:
      'Mid-range boards for club players and regular hobbyists seeking better performance.',
    level: 4,
    parentCode: 'carrom-boards',
    priority: 2,
  },
  {
    code: 'boards-tournament',
    name: 'Tournament Boards',
    description:
      'Officially sized tournament-grade boards meeting national and international standards.',
    level: 4,
    parentCode: 'carrom-boards',
    priority: 3,
  },
  {
    code: 'boards-professional',
    name: 'Professional Boards',
    description: 'Premium handcrafted boards for professional players and serious enthusiasts.',
    level: 4,
    parentCode: 'carrom-boards',
    priority: 4,
  },
  {
    code: 'boards-limited-edition',
    name: 'Limited Edition Boards',
    description:
      'Collector-grade limited edition boards blending artisanal craftsmanship with sport.',
    level: 4,
    parentCode: 'carrom-boards',
    priority: 5,
  },

  // ── Level 4: Product Types — Coins ─────────────────────────────────────────
  {
    code: 'coins-wooden',
    name: 'Wooden Coins',
    description: 'Classic wooden carrom coins with natural grip and traditional feel.',
    level: 4,
    parentCode: 'carrom-coins',
    priority: 1,
  },
  {
    code: 'coins-plastic',
    name: 'Plastic Coins',
    description: 'Lightweight plastic coins for casual and practice play.',
    level: 4,
    parentCode: 'carrom-coins',
    priority: 2,
  },
  {
    code: 'coins-professional',
    name: 'Professional Coins',
    description: 'Precision-balanced professional-grade coins with minimal friction for fast play.',
    level: 4,
    parentCode: 'carrom-coins',
    priority: 3,
  },
  {
    code: 'coins-tournament',
    name: 'Tournament Coins',
    description: 'ICTF and ICF approved tournament coin sets with standardized weight and finish.',
    level: 4,
    parentCode: 'carrom-coins',
    priority: 4,
  },

  // ── Level 4: Product Types — Strikers ──────────────────────────────────────
  {
    code: 'strikers-wooden',
    name: 'Wooden Strikers',
    description: 'Traditional wooden strikers offering natural feel and controlled play style.',
    level: 4,
    parentCode: 'carrom-strikers',
    priority: 1,
  },
  {
    code: 'strikers-acrylic',
    name: 'Acrylic Strikers',
    description: 'Smooth acrylic disc strikers for fast, low-friction precision shots.',
    level: 4,
    parentCode: 'carrom-strikers',
    priority: 2,
  },
  {
    code: 'strikers-professional',
    name: 'Professional Strikers',
    description: 'Competition-weight professional strikers (15g) for advanced and expert players.',
    level: 4,
    parentCode: 'carrom-strikers',
    priority: 3,
  },
  {
    code: 'strikers-tournament',
    name: 'Tournament Strikers',
    description:
      'Officially approved tournament strikers meeting international weight specifications.',
    level: 4,
    parentCode: 'carrom-strikers',
    priority: 4,
  },
];

// ─── Product ↔ Tier Mapping ───────────────────────────────────────────────────

const PRODUCT_TIER_MAP: Record<
  string,
  { tier1: string; tier2: string; tier3: string; tier4: string }
> = {
  'SIS-TE-2026': {
    tier1: 'sports',
    tier2: 'indoor-games',
    tier3: 'carrom-boards',
    tier4: 'boards-tournament',
  },
  'SIS-PREM-RSE': {
    tier1: 'sports',
    tier2: 'indoor-games',
    tier3: 'carrom-boards',
    tier4: 'boards-professional',
  },
  'SIS-CHAMP-PRO': {
    tier1: 'sports',
    tier2: 'indoor-games',
    tier3: 'carrom-boards',
    tier4: 'boards-tournament',
  },
  'SIS-HERITAGE': {
    tier1: 'sports',
    tier2: 'indoor-games',
    tier3: 'carrom-boards',
    tier4: 'boards-limited-edition',
  },
  'SIS-ACC-STRK-PRO': {
    tier1: 'sports',
    tier2: 'carrom-accessories',
    tier3: 'carrom-strikers',
    tier4: 'strikers-professional',
  },
  'SIS-ACC-COINS-PRO': {
    tier1: 'sports',
    tier2: 'carrom-accessories',
    tier3: 'carrom-coins',
    tier4: 'coins-professional',
  },
  'SIS-BEG-BRD': {
    tier1: 'sports',
    tier2: 'indoor-games',
    tier3: 'carrom-boards',
    tier4: 'boards-beginner',
  },
  'SIS-INT-BRD': {
    tier1: 'sports',
    tier2: 'indoor-games',
    tier3: 'carrom-boards',
    tier4: 'boards-intermediate',
  },
  'SIS-ACC-COINS-WD': {
    tier1: 'sports',
    tier2: 'carrom-accessories',
    tier3: 'carrom-coins',
    tier4: 'coins-wooden',
  },
  'SIS-ACC-COINS-PL': {
    tier1: 'sports',
    tier2: 'carrom-accessories',
    tier3: 'carrom-coins',
    tier4: 'coins-plastic',
  },
  'SIS-ACC-COINS-TR': {
    tier1: 'sports',
    tier2: 'carrom-accessories',
    tier3: 'carrom-coins',
    tier4: 'coins-tournament',
  },
  'SIS-ACC-STRK-WD': {
    tier1: 'sports',
    tier2: 'carrom-accessories',
    tier3: 'carrom-strikers',
    tier4: 'strikers-wooden',
  },
  'SIS-ACC-STRK-AC': {
    tier1: 'sports',
    tier2: 'carrom-accessories',
    tier3: 'carrom-strikers',
    tier4: 'strikers-acrylic',
  },
  'SIS-ACC-STRK-TR': {
    tier1: 'sports',
    tier2: 'carrom-accessories',
    tier3: 'carrom-strikers',
    tier4: 'strikers-tournament',
  },
  'SIS-ACC-PWD-PR': {
    tier1: 'sports',
    tier2: 'carrom-accessories',
    tier3: 'carrom-powder',
    tier4: '',
  },
  'SIS-ACC-COV-HD': {
    tier1: 'sports',
    tier2: 'carrom-accessories',
    tier3: 'carrom-covers',
    tier4: '',
  },
  'SIS-ACC-STD-MT': {
    tier1: 'sports',
    tier2: 'carrom-accessories',
    tier3: 'carrom-covers',
    tier4: '',
  },
};

// ─── Seed Function ────────────────────────────────────────────────────────────

async function seedTiers() {
  logger.info('🌱 Seeding tiers...');

  try {
    // ── Step 1: Insert all tiers (idempotent) ─────────────────────────────────
    // Build a code → UUID map so parents are resolved before children.
    const codeToId = new Map<string, string>();

    for (const def of TIER_DEFS) {
      // Check if already exists by code
      const [existing] = await db
        .select({ id: tiers.id })
        .from(tiers)
        .where(eq(tiers.code, def.code));

      if (existing) {
        logger.info(`↩ Tier "${def.code}" already exists — skipping.`);
        codeToId.set(def.code, existing.id);
        continue;
      }

      const parentId = def.parentCode ? (codeToId.get(def.parentCode) ?? null) : null;

      if (def.parentCode && !parentId) {
        logger.error(`❌ Parent tier "${def.parentCode}" not found for "${def.code}". Aborting.`);
        process.exit(1);
      }

      const id = uuidv7();
      await db.insert(tiers).values({
        id,
        code: def.code,
        name: def.name,
        description: def.description,
        level: def.level,
        parent_id: parentId,
        priority: def.priority,
        status: 'active',
        is_deleted: false,
      });

      codeToId.set(def.code, id);
      logger.info(`✅ [L${def.level}] ${def.code} — "${def.name}"`);
    }

    logger.info(`\n📦 All ${TIER_DEFS.length} tiers seeded. Now patching products...\n`);

    // ── Step 2: Patch existing products with tier IDs ─────────────────────────
    const productSkus = Object.keys(PRODUCT_TIER_MAP);

    const existingProducts = await db
      .select({ id: products.id, sku: products.sku })
      .from(products)
      .where(inArray(products.sku, productSkus));

    if (existingProducts.length === 0) {
      logger.warn('⚠ No seeded products found to patch. Run create-products.ts first.');
    }

    for (const product of existingProducts) {
      const mapping = PRODUCT_TIER_MAP[product.sku];
      if (!mapping) continue;

      const t1 = codeToId.get(mapping.tier1) ?? null;
      const t2 = codeToId.get(mapping.tier2) ?? null;
      const t3 = codeToId.get(mapping.tier3) ?? null;
      const t4 = codeToId.get(mapping.tier4) ?? null;

      await db
        .update(products)
        .set({
          category_tier_1: t1,
          category_tier_2: t2,
          category_tier_3: t3,
          category_tier_4: t4,
        })
        .where(eq(products.id, product.id));

      logger.info(
        `✅ [${product.sku}] → ${mapping.tier1} / ${mapping.tier2} / ${mapping.tier3} / ${mapping.tier4}`,
      );
    }

    logger.info('\n✨ Tier seeding and product patching complete!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error seeding tiers:', error);
    process.exit(1);
  }
}

seedTiers();
