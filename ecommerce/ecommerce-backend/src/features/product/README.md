# Product Feature

Complete product management system with clean architecture following separation of concerns pattern.

## Architecture Overview

### Clean Architecture Structure

```
product/
├── apis/                           # HTTP endpoints (thin controllers)
│   ├── bulk-delete-products.ts     # Bulk delete handler
│   ├── create-product.ts           # Create product handler
│   ├── delete-product.ts           # Delete product handler
│   ├── duplicate-product.ts        # Duplicate products handler
│   ├── export-products.ts          # Export products handler
│   ├── get-all-products.ts         # List all products handler
│   ├── get-featured-products.ts    # Featured products handler
│   ├── get-product-by-id.ts        # Get by ID handler
│   ├── get-product-by-slug.ts      # Get by slug handler
│   ├── get-product-filters.ts      # Filter options handler
│   ├── get-product-stats.ts        # Statistics handler
│   ├── import-products.ts          # Import products handler
│   ├── search-products.ts          # Search products handler
│   └── update-product.ts           # Update product handler
├── services/                       # Business logic layer
│   ├── product.service.ts                # Core CRUD operations
│   ├── product-cache.service.ts          # Redis caching
│   ├── product-detail.service.ts         # Detail retrieval
│   ├── product-duplicate.service.ts      # Duplication logic
│   ├── product-export.service.ts         # Export utilities
│   ├── product-filters.service.ts        # Filters logic
│   ├── product-import.service.ts         # Import processing
│   ├── product-list.service.ts           # Pagination and listing
│   ├── product-search.service.ts         # Advanced search logic
│   └── product-variant-update.service.ts # Variant management
├── shared/                         # Database & types
│   ├── products.schema.ts          # Main Drizzle tables
│   ├── product-variants.schema.ts  # Variants tables
│   ├── product-faqs.schema.ts      # FAQs tables
│   ├── queries.ts                  # Centralized Drizzle queries
│   ├── interface.ts                # TypeScript interfaces
│   ├── validation.ts               # Zod schemas
│   └── index.ts                    # Public shared exports
└── index.ts                        # Public feature exports
```

### Design Principles

#### 1. Separation of Concerns

- **APIs**: HTTP handling only (validation, auth, response formatting)
- **Services**: Business logic (orchestration, transactions, side effects)
- **Queries**: Pure data access (Drizzle ORM, no business logic)

#### 2. No Inline Logic

- All complex queries moved to `shared/queries.ts`
- Business logic centralized in services
- API handlers delegate to services/queries

#### 3. Transaction Support

- All queries accept optional `tx: Database` parameter
- Services handle transaction boundaries
- Atomic operations guaranteed

### Migration History

#### Phase 1 - Centralized Queries ✅

- Created `shared/queries.ts` with all database queries
- Used pure Drizzle ORM syntax
- Added transaction support (`tx` parameter)
- **Result**: 15+ query functions centralized (807 lines)

#### Phase 2 - Service Refactoring ✅

- Refactored services to use centralized queries
- Removed inline query logic
- Maintained backward compatibility
- **Result**: All 7 services using queries.ts

#### Phase 3 - Thin Controllers ✅

- Refactored API handlers to be thin controllers
- Moved business logic to services
- Simplified to ~40-60 lines per handler
- **Result**: 13 API files refactored

#### Phase 4 - Documentation ✅

- Exported all services from `index.ts`
- Created comprehensive documentation
- Verified clean architecture
- **Result**: Production-ready feature

---

## Internal Documentation

### Services Layer

#### `product.service.ts`

Main CRUD operations with full business logic:

**Functions:**

- `createProduct(data, userId)` - Create with variants, FAQs, inventory
- `updateProduct(id, data, userId)` - Update with validation and audit
- `deleteProduct(id, userId)` - Soft delete with cleanup

**Features:**

- SKU/slug uniqueness validation
- FAQ management
- Variant handling
- Inventory synchronization
- Tag and tier usage tracking
- Audit logging
- Cache invalidation

#### `product-duplicate.service.ts`

Product duplication with all dependencies:

- Copies product details
- Duplicates variants with inventory
- Copies FAQs
- Manages copy numbering ("Product Name (Copy 1)")
- Inventory tracking with adjustments

#### `product-detail.service.ts`

Product detail retrieval with computed fields:

- Permission checks (admin vs public)
- Rating and review aggregation
- Stock calculations across all variants
- Variant inventory mapping
- Discount computation

#### `product-cache.service.ts`

Redis-based caching with fallback:

- Individual product caching by ID, SKU, slug
- Cache invalidation strategies
- Memory fallback when Redis unavailable
- 1-hour TTL (configurable)

#### `product-export.service.ts`

Data export utilities:

- `queryProductsForExport()` - Query products with filters
- `formatProductExportData()` - Format for CSV/Excel
- `transformArraysForExcel()` - Transform arrays to Excel-compatible strings

#### `product-import.service.ts`

Bulk import with validation:

- `importSingleProduct()` - Create or update by SKU
- Category lookup and validation
- Data transformation
- Error handling per row

#### `product-variant-update.service.ts`

Variant management:

- `updateProductVariants()` - Add/update/remove variants
- Inventory synchronization
- Soft delete handling
- Transaction-based updates

### Queries Layer (`shared/queries.ts`)

#### Basic CRUD

- `findProductById(id, tx?)` - Get by ID
- `findProductBySku(sku, tx?)` - Get by SKU
- `findProductBySlug(slug, tx?)` - Get by slug
- `isSkuTaken(sku, excludeId?, tx?)` - Check uniqueness
- `softDeleteProduct(id, deletedBy, tx?)` - Soft delete

#### Search & Filters

- `searchProducts(options, tx?)` - Full-text search with filters
- `getProductSearchCount(options, tx?)` - Count search results
- `getPriceRange(categoryId?, tx?)` - Min/max prices
- `getTechnologiesAggregation(categoryId?, tx?)` - Tag counts
- `getRatingCounts(categoryId?, tx?)` - Rating distribution
- `getFilterCategories(parentId, tx?)` - Category hierarchy

#### Product Details

- `getProductDetail(id or slug, tx?)` - Complete product data
- `getProductFaqs(productId, tx?)` - Product FAQs
- `findVariantsByProductId(productId, tx?)` - Product variants
- `getProductInventory(productId, variantIds, tx?)` - Stock levels

#### Export & Stats

- `queryProductsForExport(options, tx?)` - Filtered export query
- `getFeaturedProducts(tx?)` - Featured products with stats
- `getProductStats(tx?)` - Dashboard statistics

#### Utilities

- `getDistinctProductTags(tx?)` - All unique tags

### Usage Examples

#### Creating a Product

```typescript
import { createProduct } from '@/features/product';

const product = await createProduct(
  {
    product_title: 'Sample Product',
    sku: 'SKU-001',
    slug: 'sample-product',
    selling_price: 99.99,
    status: 'active',
    category_tier_1: 'category-uuid',
    tags: ['tag1', 'tag2'],
    faqs: [{ question: 'Q1?', answer: 'A1' }],
    inventory_quantity: 100,
  },
  'user-id',
);
```

#### Searching Products

```typescript
import { searchProducts, getProductSearchCount } from '@/features/product';

const { results, productStats } = await searchProducts({
  searchQuery: 'laptop',
  status: 'active',
  page: 1,
  limit: 20,
});

const total = await getProductSearchCount({
  searchQuery: 'laptop',
  status: 'active',
});
```

#### Exporting Products

```typescript
import { queryProductsForExport, formatProductExportData } from '@/features/product';

const data = await queryProductsForExport({
  scope: 'all',
  status: 'active',
});

const formatted = formatProductExportData(data, {
  selectedColumns: ['sku', 'product_title', 'selling_price'],
});
```

### Caching Strategy

**Cache Keys:**

- `product:id:{id}` - Product by ID
- `product:sku:{sku}` - Product by SKU
- `product:slug:{slug}` - Product by slug

**TTL:** 1 hour (3600 seconds)

**Invalidation:**

- On create: Cache new product
- On update: Invalidate by ID, SKU, slug
- On delete: Invalidate by ID, SKU, slug

### Database Indexes

**Performance Indexes:**

- `sku` - Unique index for SKU lookups
- `slug` - Unique index for slug lookups
- `search_vector` - GiST index for full-text search
- `category_tier_1` - Index for category filtering
- `status` - Index for status filtering
- `featured` - Index for featured products

### Best Practices

1. **Always use transactions** for multi-table operations
2. **Invalidate cache** after mutations
3. **Log important operations** for audit trail
4. **Validate input** at API boundary
5. **Handle errors gracefully** with proper HTTP status codes
6. **Use TypeScript types** from shared interfaces
7. **Delegate to services** from API handlers
8. **Query from queries.ts** in services
9. **Keep handlers thin** (< 60 lines)
10. **Document complex logic** with comments

---

## API Documentation

The Product feature provides core product management capabilities for the admin panel. It supports creating products, listing all products with filters, viewing individual product details, updating product information, and soft-deleting products. All product operations require admin authentication.

## Base URL

```
/api/products
```

## Authentication Requirements

| Endpoint                          | Authentication | Authorization                 |
| --------------------------------- | -------------- | ----------------------------- |
| `POST /`                          | ✅ Required    | Admin (`products:create`)     |
| `GET /`                           | ❌ Optional    | None (Different response)     |
| `GET /search`                     | ❌ Optional    | None                          |
| `GET /featured`                   | ❌ Public      | None                          |
| `GET /filters`                    | ❌ Public      | None                          |
| `GET /stats`                      | ✅ Required    | Admin (`products:read`)       |
| `GET /export`                     | ✅ Required    | Admin (`products:read`)       |
| `POST /import`                    | ✅ Required    | Admin (`products:create`)     |
| `POST /bulk-delete`               | ✅ Required    | Admin (`products:delete`)     |
| `POST /duplicate`                 | ✅ Required    | Admin (`products:create`)     |
| `GET /slug/:slug`                 | ❌ Public      | None                          |
| `GET /:id`                        | ❌ Optional    | None (Different response)     |
| `PUT /:id`                        | ✅ Required    | Admin (`products:update`)     |
| `DELETE /:id`                     | ✅ Required    | Admin (`products:delete`)     |

---

## Endpoints

### 1. Create Product

Create a new product in the system.

**Endpoint:** `POST /api/products`

**Authentication:** Required (Bearer Token)

**Authorization:** Admin only (`products:create` permission)

#### Request Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Request Body

```json
{
  "slug": "premium-widget-2024",
  "product_title": "Premium Widget 2024",
  "secondary_title": "The Ultimate Widget",
  "short_description": "A premium quality widget",
  "full_description": "<p>Detailed HTML description...</p>",
  "status": "draft",
  "featured": false,
  "sku": "WIDGET-2024-001",
  "selling_price": "299.99",
  "cost_price": "150.00",
  "compare_at_price": "399.99",
  "category_tier_1": "Electronics",
  "category_tier_2": "Widgets",
  "primary_image_url": "https://example.com/images/widget.jpg",
  "additional_images": ["https://example.com/images/widget-2.jpg"],
  "additional_thumbnails": ["https://example.com/images/widget-2-thumb.jpg"],
  "tags": ["premium", "widget", "2024"],
  "weight": "1.5",
  "length": "10.0",
  "breadth": "8.0",
  "height": "5.0",
  "hsn_code": "8543",
  "meta_title": "Premium Widget 2024 - Best Widget",
  "meta_description": "Buy the best premium widget of 2024",
  "product_url": "/products/premium-widget-2024",
  "faqs": [
    {
      "question": "What is the warranty?",
      "answer": "1 year manufacturer warranty"
    }
  ],
  "inventory_quantity": 100,
  "has_variants": true,
  "variants": [
    {
      "option_name": "Color",
      "option_value": "Red",
      "sku": "WIDGET-2024-001-RED",
      "selling_price": "299.99",
      "inventory_quantity": 50
    }
  ]
}
```

#### Request Schema

| Field                   | Type    | Required | Description                                  |
| ----------------------- | ------- | -------- | -------------------------------------------- |
| `slug`                  | string  | ✅       | URL-friendly identifier (unique)             |
| `product_title`         | string  | ✅       | Product name                                 |
| `sku`                   | string  | ✅       | Stock Keeping Unit (unique)                  |
| `selling_price`         | string  | ✅       | Selling price (decimal format: "99.99")      |
| `status`                | enum    | ❌       | draft, active, archived (default: draft)     |
| `featured`              | boolean | ❌       | Featured product flag (default: false)       |
| `cost_price`            | string  | ❌       | Cost price (default: "0.00")                 |
| `compare_at_price`      | string  | ❌       | Original price for comparison                |
| `category_tier_1-4`     | string  | ❌       | Category hierarchy (4 tiers)                 |
| `primary_image_url`     | string  | ❌       | Main product image URL                       |
| `thumbnail_url`         | string  | ❌       | Main product thumbnail URL                   |
| `additional_images`     | array   | ❌       | Array of additional image URLs               |
| `additional_thumbnails` | array   | ❌       | Array of additional thumbnail URLs           |
| `tags`                  | array   | ❌       | Array of tag strings                         |
| `weight`                | string  | ❌       | Product weight                               |
| `length/breadth/height` | string  | ❌       | Product dimensions                           |
| `hsn_code`              | string  | ❌       | HSN/SAC code for tax                         |
| `meta_title`            | string  | ❌       | SEO meta title                               |
| `meta_description`      | string  | ❌       | SEO meta description                         |
| `product_url`           | string  | ❌       | Custom product URL path                      |
| `faqs`                  | array   | ❌       | Array of FAQ objects (question/answer pairs) |
| `inventory_quantity`    | number  | ❌       | Initial inventory quantity (default: 0)      |
| `has_variants`          | boolean | ❌       | Does the product have variants?              |
| `variants`              | array   | ❌       | Array of variant objects if has_variants     |

#### Success Response

**Status Code:** `201 Created`

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "slug": "premium-widget-2024",
    "product_title": "Premium Widget 2024",
    "sku": "WIDGET-2024-001",
    "selling_price": "299.99",
    "status": "draft",
    "featured": false,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Error Responses

| Status | Error            | Description                  |
| ------ | ---------------- | ---------------------------- |
| `400`  | Validation Error | Invalid request body         |
| `401`  | Unauthorized     | Missing or invalid JWT token |
| `403`  | Forbidden        | User is not an admin         |
| `409`  | Conflict         | SKU or slug already exists   |

---

### 2. Get All Products

Get paginated list of all products with optional filters.

**Endpoint:** `GET /api/products`

**Authentication:** Optional

**Authorization:** None required. If an Admin Bearer token is provided, the API returns full admin-level details (including draft/archived products, cost prices, etc.). If no token is provided, it acts as a **Storefront** endpoint, returning only active products and hiding sensitive fields.

#### Request Headers

```http
Authorization: Bearer <jwt_token>
```

#### Query Parameters

| Parameter         | Type    | Default | Max   | Description                              |
| ----------------- | ------- | ------- | ----- | ---------------------------------------- |
| `page`            | number  | `1`     | -     | Page number (min: 1)                     |
| `limit`           | number  | `20`    | `100` | Items per page                           |
| `status`          | string  | -       | -     | Filter by status (draft/active/archived) |
| `category_tier_1` | string  | -       | -     | Filter by primary category               |
| `featured`        | boolean | -       | -     | Filter by featured products              |

#### Example Request

```
GET /api/products?page=1&limit=20&status=active&category_tier_1=Electronics
```

#### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "slug": "premium-widget-2024",
      "product_title": "Premium Widget 2024",
      "sku": "WIDGET-2024-001",
      "selling_price": "299.99",
      "status": "active",
      "featured": true,
      "primary_image_url": "https://example.com/images/widget.jpg",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

#### Error Responses

| Status | Error        | Description                  |
| ------ | ------------ | ---------------------------- |
| `401`  | Unauthorized | Missing or invalid JWT token |
| `403`  | Forbidden    | User is not an admin         |

---

### 3. Get Product by ID

Get a specific product's details.

**Endpoint:** `GET /api/products/:id`

**Authentication:** Optional

**Authorization:** None required. If an Admin Bearer token is provided, all internal fields and variants are returned. If no token is provided (Storefront), sensitive fields like `cost_price` and inactive variants/products are hidden.

#### Path Parameters

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `id`      | UUID | Product ID  |

#### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "slug": "premium-widget-2024",
    "product_title": "Premium Widget 2024",
    "secondary_title": "The Ultimate Widget",
    "short_description": "A premium quality widget",
    "full_description": "<p>Detailed HTML description...</p>",
    "status": "active",
    "featured": true,
    "sku": "WIDGET-2024-001",
    "selling_price": "299.99",
    "cost_price": "150.00",
    "compare_at_price": "399.99",
    "discount": 25,
    "inStock": true,
    "total_stock": 100,
    "category_tier_1": "Electronics",
    "category_tier_2": "Widgets",
    "category_tier_3": null,
    "category_tier_4": null,
    "primary_image_url": "https://example.com/images/widget.jpg",
    "additional_images": ["https://example.com/images/widget-2.jpg"],
    "images": ["https://example.com/images/widget.jpg", "https://example.com/images/widget-2.jpg"],
    "tags": ["premium", "widget", "2024"],
    "weight": "1.5",
    "length": "10.0",
    "breadth": "8.0",
    "height": "5.0",
    "hsn_code": "8543",
    "meta_title": "Premium Widget 2024 - Best Widget",
    "meta_description": "Buy the best premium widget of 2024",
    "product_url": "/products/premium-widget-2024",
    "rating": 4.5,
    "review_count": 23,
    "faqs": [
      {
        "id": "faq-1",
        "question": "What is the warranty?",
        "answer": "1 year manufacturer warranty"
      }
    ],
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Error Responses

| Status | Error        | Description                  |
| ------ | ------------ | ---------------------------- |
| `401`  | Unauthorized | Missing or invalid JWT token |
| `403`  | Forbidden    | User is not an admin         |
| `404`  | Not Found    | Product not found            |

---

### 4. Update Product

Update product information. All fields are optional.

**Endpoint:** `PUT /api/products/:id`

**Authentication:** Required (Bearer Token)

**Authorization:** Admin only (`products:update` permission)

#### Request Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Path Parameters

| Parameter | Type | Description          |
| --------- | ---- | -------------------- |
| `id`      | UUID | Product ID to update |

#### Request Body

All fields are optional. Only include fields you want to update.

```json
{
  "product_title": "Updated Premium Widget 2024",
  "selling_price": "279.99",
  "status": "active",
  "featured": true,
  "inventory_quantity": 150
}
```

#### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "slug": "premium-widget-2024",
    "product_title": "Updated Premium Widget 2024",
    "selling_price": "279.99",
    "status": "active",
    "featured": true,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-16T14:20:00.000Z"
  }
}
```

#### Error Responses

| Status | Error            | Description                  |
| ------ | ---------------- | ---------------------------- |
| `400`  | Validation Error | Invalid request body         |
| `401`  | Unauthorized     | Missing or invalid JWT token |
| `403`  | Forbidden        | User is not an admin         |
| `404`  | Not Found        | Product not found            |
| `409`  | Conflict         | SKU or slug already exists   |

---

### 5. Delete Product

Soft delete a product.

**Endpoint:** `DELETE /api/products/:id`

**Authentication:** Required (Bearer Token)

**Authorization:** Admin only (`products:delete` permission)

#### Request Headers

```http
Authorization: Bearer <jwt_token>
```

#### Path Parameters

| Parameter | Type | Description          |
| --------- | ---- | -------------------- |
| `id`      | UUID | Product ID to delete |

#### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": null
}
```

#### Error Responses

| Status | Error        | Description                  |
| ------ | ------------ | ---------------------------- |
| `401`  | Unauthorized | Missing or invalid JWT token |
| `403`  | Forbidden    | User is not an admin         |
| `404`  | Not Found    | Product not found            |

---

## Product Schema (33 Core Fields)

### Core Fields

- `id` (UUID) - Primary identifier
- `slug` (string) - URL-friendly identifier
- `product_title` (string) - Product name
- `secondary_title` (string) - Subtitle/tagline
- `short_description` (text) - Brief description
- `full_description` (text) - Complete HTML description
- `admin_comment` (text) - Internal notes for staff

### Status & Visibility

- `status` (enum) - draft | active | archived
- `featured` (boolean) - Featured product flag

### Pricing

- `cost_price` (decimal) - Internal cost
- `selling_price` (decimal) - Public selling price
- `compare_at_price` (decimal) - Original price for discount display

### Identification

- `sku` (string) - Stock Keeping Unit
- `hsn_code` (string) - Tax classification code
- `barcode` (string) - Product barcode

### Dimensions

- `weight` (decimal)
- `length` (decimal)
- `breadth` (decimal)
- `height` (decimal)

### Categorization

- `category_tier_1` (string) - Primary category
- `category_tier_2` (string) - Secondary category
- `category_tier_3` (string) - Tertiary category
- `category_tier_4` (string) - Quaternary category

### Media

- `primary_image_url` (string) - Main product image
- `thumbnail_url` (string) - Main product thumbnail
- `additional_images` (jsonb) - Array of additional images

### Variants

- `has_variants` (boolean) - Whether the product has variants

### SEO

- `meta_title` (string)
- `meta_description` (string)
- `product_url` (string)

### Additional

- `tags` (jsonb) - Array of tag strings

### Audit Fields (Hidden from responses)

- `created_at`, `updated_at`
- `created_by`, `updated_by`
- `is_deleted`, `deleted_at`, `deleted_by`

---

## Related Features

### FAQs

Product FAQs are stored in a separate `product_faqs` table but returned with product details.

### Inventory

Product inventory is managed through the `/api/inventory` feature and linked by `product_id`.

### Reviews

Product ratings and reviews are managed separately but aggregate data (rating, review_count) is included in product responses.

---

## Response Sanitization

All product responses are sanitized to exclude internal/audit fields:

### Excluded Fields

- `is_deleted` - Internal soft delete flag
- `deleted_at` - Internal audit field
- `deleted_by` - Internal audit field
- `created_by` - Internal audit field
- `updated_by` - Internal audit field

---

## Caching

The product feature uses Redis-based caching with in-memory fallback:

- **Cache Keys**: Products are cached by ID, SKU, and slug
- **TTL**: 5 minutes
- **Invalidation**: Automatic on update/delete operations
- **Fallback**: In-memory cache when Redis unavailable

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "sku",
      "message": "Product with this SKU already exists"
    }
  ]
}
```

---

## Notes

### Removed Features

The following features were removed during schema simplification:

- Product scheduling (schedule status, scheduled_publish_at)
- Product delisting (is_delisted, delist_date)
- Brand management (brand_name, brand_slug)
- Product grouping (size_group, accessories_group)
- Internal comments (admin_comment)
- Product enhancements (highlights, features, specs)

### Storefront-Specific APIs Removed

The following APIs were removed as they're storefront-specific (not needed for admin panel):

- `GET /products/compare` - Product comparison
- `GET /products/filters` - Collection filters
- `GET /products/search` - Product search
- `GET /products/search/autocomplete` - Search suggestions
- `GET /products/search/popular` - Popular searches
- `GET /products/:id/bundles` - Product bundles
- `GET /products/:id/related` - Related products
- `GET /products/:id/reviews` - Product reviews
- `GET /products/category/:slug` - Category products

### Current API Surface

**5 Core CRUD APIs**

- POST / - Create product
- GET / - List products
- GET /:id - Get product detail
- PUT /:id - Update product
- DELETE /:id - Delete product
