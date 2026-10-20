import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  index,
  check,
  customType,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { tiers } from '../../tiers/shared/tiers.schema';

const tsvector = customType<{ data: string }>({
  dataType() {
    return 'tsvector';
  },
});

export const productStatusEnum = pgEnum('product_status', ['draft', 'active', 'archived']);

/** Core product entity and its relationships. */
export const products = pgTable(
  'products',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    slug: varchar('slug', { length: 255 }).unique().notNull(),
    product_title: varchar('product_title', { length: 255 }).notNull(),
    secondary_title: varchar('secondary_title', { length: 255 }),

    short_description: text('short_description'),
    full_description: text('full_description'),
    admin_comment: text('admin_comment'),

    status: productStatusEnum('status').default('draft').notNull(),
    featured: boolean('featured').default(false).notNull(),

    cost_price: decimal('cost_price', { precision: 15, scale: 2 }).default('0.00').notNull(),
    selling_price: decimal('selling_price', { precision: 15, scale: 2 }).default('0.00').notNull(),
    compare_at_price: decimal('compare_at_price', { precision: 15, scale: 2 }),

    sku: varchar('sku', { length: 100 }).unique().notNull(),
    hsn_code: varchar('hsn_code', { length: 20 }),
    barcode: varchar('barcode', { length: 50 }),

    weight: decimal('weight', { precision: 8, scale: 2 }),
    length: decimal('length', { precision: 8, scale: 2 }),
    breadth: decimal('breadth', { precision: 8, scale: 2 }),
    height: decimal('height', { precision: 8, scale: 2 }),

    category_tier_1: uuid('category_tier_1').references(() => tiers.id, { onDelete: 'set null' }),
    category_tier_2: uuid('category_tier_2').references(() => tiers.id, { onDelete: 'set null' }),
    category_tier_3: uuid('category_tier_3').references(() => tiers.id, { onDelete: 'set null' }),
    category_tier_4: uuid('category_tier_4').references(() => tiers.id, { onDelete: 'set null' }),

    tags: jsonb('tags').default([]),

    primary_image_url: text('primary_image_url'),
    thumbnail_url: text('thumbnail_url'),
    additional_images: jsonb('additional_images').default([]),

    has_variants: boolean('has_variants').default(false).notNull(),

    // Maximum quantity a single order can contain for this product (0 = use system default)
    max_order_quantity: integer('max_order_quantity').default(0).notNull(),

    meta_title: varchar('meta_title', { length: 255 }),
    meta_description: text('meta_description'),
    product_url: varchar('product_url', { length: 500 }),

    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    created_by: uuid('created_by'),
    updated_by: uuid('updated_by'),

    is_deleted: boolean('is_deleted').default(false).notNull(),
    deleted_at: timestamp('deleted_at'),
    deleted_by: uuid('deleted_by'),

    search_vector: tsvector('search_vector').generatedAlwaysAs(
      sql`to_tsvector('english', COALESCE(product_title, '') || ' ' || COALESCE(short_description, ''))`,
    ),
  },
  (table) => ({
    searchVectorIdx: index('products_search_vector_idx').using('gin', table.search_vector),
    tagsIdx: index('products_tags_idx').using('gin', table.tags),
    categoryPriceStatusIdx: index('products_category_price_status_idx').on(
      table.category_tier_1,
      table.selling_price,
      table.status,
      table.is_deleted,
    ),
    activeIdx: index('products_active_idx')
      .on(table.id, table.status, table.selling_price)
      .where(sql`${table.is_deleted} = false and ${table.status} = 'active'`),
    createdAtStatusIdx: index('products_created_at_status_idx')
      .on(table.created_at)
      .where(sql`${table.status} = 'active' and ${table.is_deleted} = false`),
    featuredStatusIdx: index('products_featured_status_idx')
      .on(table.featured, table.status)
      .where(sql`${table.status} = 'active' and ${table.is_deleted} = false`),
    listCoveringIdx: index('products_list_covering_idx')
      .on(table.category_tier_1, table.selling_price)
      .where(sql`${table.status} = 'active' and ${table.is_deleted} = false`),
    costPriceCheck: check('products_cost_price_check', sql`cost_price >= 0`),
    sellingPriceCheck: check('products_selling_price_check', sql`selling_price >= 0`),
    compareAtPriceCheck: check(
      'products_compare_at_price_check',
      sql`compare_at_price IS NULL OR compare_at_price >= selling_price`,
    ),
  }),
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
