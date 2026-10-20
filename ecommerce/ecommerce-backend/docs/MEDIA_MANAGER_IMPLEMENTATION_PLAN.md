# Media Manager Implementation Plan

## Executive Summary

**Date:** February 12, 2026  
**Status:** Ready for Implementation  
**Estimated Effort:** 3-5 days

You have **two complementary systems** that can work together:

1. **Upload Feature** ✅ - Basic file storage with single thumbnail (400x400)
2. **Media Manager** ⏸️ - Advanced entity-media relationship system with 5 variants

---

## Current State Analysis

### 1. Upload Feature (✅ IMPLEMENTED & WORKING)

**Location:** `src/features/upload/`

**What it does:**

- User-scoped file uploads to Supabase Storage
- Automatic thumbnail generation using Sharp (400x400px, 80% quality)
- Returns both `file_url` and `thumbnail_url`
- Tracks upload status (pending, processing, completed, failed)
- No entity relationships - just stores files

**Key Files:**

- `src/utils/supabaseStorage.ts` - Upload logic + thumbnail generation
- `src/features/upload/apis/create-upload.ts` - Upload endpoint
- Uses **Sharp** library for image processing

**Strengths:**

- ✅ Already working in production
- ✅ Simple and fast
- ✅ Automatic thumbnail generation
- ✅ Good for basic file needs

**Limitations:**

- ❌ No entity relationships (can't link to products/blogs)
- ❌ Only 1 thumbnail size (400x400)
- ❌ No ordering, primary designation, or metadata
- ❌ No multiple images per entity management

---

### 2. Media Manager (⏸️ BUILT BUT NOT ACTIVATED)

**Location:** `src/features/media-manager/`

**What it does:**

- Generic entity-media relationship system
- Links uploads to ANY entity (product, blog, category, user, etc.)
- Generates **5 image variants** using Supabase CDN transformations:
  - Thumbnail: 150x150 (cover)
  - Small: 300x300
  - Medium: 600x600
  - Large: 1200x1200
  - Zoom: 2400px width, 90% quality
- Supports:
  - Multiple images per entity with ordering
  - Primary image designation
  - Alt text & captions (SEO)
  - Flexible metadata (EXIF, dimensions, duration)
  - Media types: image, video, document, file

**Key Files:**

- `src/features/media-manager/services/media.service.ts` - Business logic
- `src/features/media-manager/services/image-transformer.service.ts` - Variant generation
- `src/features/media-manager/shared/entity-media.schema.ts` - Database schema
- `src/features/media-manager/shared/entity-media.queries.ts` - DB queries

**Why it's commented out:**

- Schema not migrated to database (line 109-113 in `drizzle.ts`)
- Marked as "Dropped in Phase 4 (31 Jan 2026)"
- No API endpoints created

**Strengths:**

- ✅ Well-architected, production-ready code
- ✅ 5 image variants for responsive design
- ✅ Entity-agnostic (works for products, blogs, anything)
- ✅ SEO-friendly (alt text, captions)
- ✅ Proper ordering and primary designation
- ✅ Future-proof (videos, documents, galleries)

**What it needs:**

- ❌ Database migration for `entity_media` table
- ❌ API endpoints for CRUD operations
- ❌ Integration with product/blog/collection APIs

---

### 3. Current Product/Blog Image Handling

**Products:**

- `primary_image_url` + `thumbnail_url`
- `additional_images` (JSONB array) + `additional_thumbnails`
- No metadata, ordering, or relationships

**Blogs:**

- `main_image_pc_url` + `main_image_mobile_url`
- No SEO metadata or variants

**Issues:**

- Each entity reinvents media handling
- No proper relationships with uploads table
- Limited flexibility for future features

---

## Recommended Implementation Strategy

### 🎯 **OPTION A: Hybrid Approach (RECOMMENDED)**

Use **both systems together** for maximum efficiency:

```
┌─────────────────────────────────────────────────────┐
│  1. User uploads file via Upload Feature           │
│     • Generates 1 thumbnail (400x400)               │
│     • Returns upload_id, file_url, thumbnail_url   │
│                                                     │
│  2. Attach upload to entity via Media Manager      │
│     • Links upload_id to product/blog/etc.         │
│     • Generates 5 variants on-demand via CDN       │
│     • Stores metadata, ordering, alt text          │
│                                                     │
│  3. Frontend requests entity media                 │
│     • Returns structured media with variants       │
│     • Includes original + thumbnail + 5 variants   │
└─────────────────────────────────────────────────────┘
```

**Why this approach:**

- Upload feature handles **file storage** (what it's good at)
- Media Manager handles **entity relationships** (what it's designed for)
- Both complement each other perfectly
- Minimal changes to existing upload code
- Can migrate gradually

---

## Implementation Steps

### Phase 1: Database & Foundation (Day 1)

#### 1.1 Activate Media Manager Schema

**File:** `src/database/drizzle.ts`

```typescript
// UNCOMMENT these lines (currently line 109-113):
import { entityMedia, entityTypeEnum, mediaTypeEnum } from '../features/media-manager';
```

**Then add to schema export (around line 200):**

```typescript
export const schema = {
  // ... existing tables
  entityMedia,
  entityTypeEnum,
  mediaTypeEnum,
};
```

#### 1.2 Generate and Run Migration

```bash
npm run db:generate
# Review the generated migration file
npm run db:migrate
```

This creates the `entity_media` table with:

- Composite indexes for fast lookups
- Foreign keys to uploads table
- Support for any entity type

#### 1.3 Update Upload Schema (Optional Enhancement)

Consider adding these fields to `uploads` table for better tracking:

```typescript
// In src/features/upload/shared/upload.schema.ts
export const uploads = pgTable('uploads', {
  // ... existing fields

  // NEW: Track if this upload is used by entities
  usage_count: integer('usage_count').default(0).notNull(),

  // NEW: Prevent deletion if used by entities
  protected: boolean('protected').default(false).notNull(),
});
```

---

### Phase 2: API Endpoints (Day 2)

#### 2.1 Create Media Manager Routes

**File:** `src/features/media-manager/index.ts`

Update to export routes:

```typescript
import { Router } from 'express';
import Route from '../../interfaces/route.interface';

class MediaManagerRoute implements Route {
  public path = '/media';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private async initializeRoutes() {
    const { default: attachMediaRouter } = await import('./apis/attach-media');
    const { default: getEntityMediaRouter } = await import('./apis/get-entity-media');
    const { default: updateMediaRouter } = await import('./apis/update-media');
    const { default: deleteMediaRouter } = await import('./apis/delete-media');
    const { default: reorderMediaRouter } = await import('./apis/reorder-media');

    this.router.use(this.path, attachMediaRouter);
    this.router.use(this.path, getEntityMediaRouter);
    this.router.use(this.path, updateMediaRouter);
    this.router.use(this.path, deleteMediaRouter);
    this.router.use(this.path, reorderMediaRouter);
  }
}

export default MediaManagerRoute;
```

#### 2.2 Create API Handlers

Create these files in `src/features/media-manager/apis/`:

**a) `attach-media.ts`** - Link upload to entity

```typescript
POST /api/media/:entityType/:entityId
Body: {
  upload_id: number,
  media_type: 'image' | 'video' | 'document',
  alt_text?: string,
  caption?: string,
  set_as_primary?: boolean
}
```

**b) `get-entity-media.ts`** - Get all media for entity

```typescript
GET /api/media/:entityType/:entityId?type=image
Response: {
  data: [
    {
      id: "uuid",
      original_url: "...",
      thumbnail_url: "...", // From upload
      variants: {
        thumbnail: "...",  // 150x150
        small: "...",      // 300x300
        medium: "...",     // 600x600
        large: "...",      // 1200x1200
        zoom: "..."        // 2400px
      },
      alt_text: "...",
      is_primary: true,
      display_order: 0
    }
  ]
}
```

**c) `update-media.ts`** - Update metadata

```typescript
PATCH /api/media/:mediaId
Body: {
  alt_text?: string,
  caption?: string,
  display_order?: number
}
```

**d) `delete-media.ts`** - Remove media relationship

```typescript
DELETE /api/media/:mediaId
```

**e) `reorder-media.ts`** - Reorder images

```typescript
POST /api/media/:entityType/:entityId/reorder
Body: {
  media_ids: ["uuid1", "uuid2", "uuid3"]
}
```

---

### Phase 3: Integration with Existing Features (Day 3)

#### 3.1 Update Product APIs

**File:** `src/features/product/apis/create-product.ts`

Add media manager integration:

```typescript
// After creating product successfully:
if (data.primary_image_url && data.primary_image_upload_id) {
  await mediaService.attachMediaToEntity({
    entity_type: 'product',
    entity_id: newProduct.id,
    upload_id: data.primary_image_upload_id,
    media_type: 'image',
    set_as_primary: true,
    alt_text: data.product_title,
  });
}

// Handle additional images
if (data.additional_image_upload_ids?.length > 0) {
  for (let i = 0; i < data.additional_image_upload_ids.length; i++) {
    await mediaService.attachMediaToEntity({
      entity_type: 'product',
      entity_id: newProduct.id,
      upload_id: data.additional_image_upload_ids[i],
      media_type: 'image',
      set_as_primary: false,
    });
  }
}
```

#### 3.2 Update Product Response Format

**File:** `src/features/product/apis/get-product-by-id.ts`

Include media variants:

```typescript
// After fetching product:
const productMedia = await mediaService.getEntityMedia('product', product.id, 'image');

return {
  ...product,
  media: productMedia, // New structured media array
  // Keep legacy fields for backward compatibility
  primary_image_url: productMedia.find((m) => m.is_primary)?.original_url,
  thumbnail_url: productMedia.find((m) => m.is_primary)?.thumbnail_url,
};
```

#### 3.3 Migration Script for Existing Products

Create `scripts/migrate-product-images.ts`:

```typescript
// Migrate existing product images to media manager
// 1. Find products with primary_image_url
// 2. Check if URL exists in uploads table
// 3. If yes, create entity_media relationship
// 4. If no, log for manual review
```

---

### Phase 4: Frontend Integration (Day 4)

#### 4.1 Update Admin Panel Upload Flow

**File:** `anant-enterprises-admin/src/features/products/hooks/useDeferredUpload.ts`

Change from saving URLs directly to saving upload IDs:

```typescript
// OLD:
onPrimaryImageChange(response.file_url);

// NEW:
onPrimaryImageChange({
  upload_id: response.id,
  file_url: response.file_url,
  thumbnail_url: response.thumbnail_url,
});
```

#### 4.2 Update Product Service

**File:** `anant-enterprises-admin/src/features/products/services/productService.ts`

Send upload IDs instead of URLs:

```typescript
const payload = {
  // ... other fields
  primary_image_upload_id: productData.primaryImage.upload_id,
  additional_image_upload_ids: productData.additionalImages.map((img) => img.upload_id),

  // Keep URLs for backward compatibility during migration
  primary_image_url: productData.primaryImage.file_url,
  additional_images: productData.additionalImages.map((img) => img.file_url),
};
```

#### 4.3 Use Image Variants in Frontend

**File:** `anant-enterprises-frontend/...`

Utilize responsive variants:

```typescript
// Product detail page
<img
  src={product.media[0].variants.large}
  srcset={`
    ${product.media[0].variants.small} 300w,
    ${product.media[0].variants.medium} 600w,
    ${product.media[0].variants.large} 1200w,
    ${product.media[0].variants.zoom} 2400w
  `}
  alt={product.media[0].alt_text}
/>

// Thumbnail gallery
<img src={product.media[0].variants.thumbnail} />
```

---

### Phase 5: Testing & Rollout (Day 5)

#### 5.1 Testing Checklist

- [ ] Upload new images via admin panel
- [ ] Verify entity_media relationships created
- [ ] Check all 5 variants are accessible
- [ ] Test image ordering and primary designation
- [ ] Verify alt text and captions
- [ ] Test deletion (soft delete uploads still used)
- [ ] Performance test with 20+ images per product
- [ ] Check backward compatibility with old products

#### 5.2 Gradual Migration Strategy

**Week 1: New Products Only**

- All new products use media manager
- Old products keep URL-based system
- Monitor performance and issues

**Week 2: Hot Products**

- Migrate top 50 products to media manager
- Gather user feedback

**Week 3: Bulk Migration**

- Run migration script for all products
- Keep old URLs for 30 days as backup

**Week 4: Deprecation**

- Remove URL fields from product creation
- Fully migrate to media manager

---

## Benefits After Implementation

### For Developers

- ✅ Consistent media handling across all entities
- ✅ No more duplicate code for image management
- ✅ Easy to add media to new entities (just link to entity_media)
- ✅ Proper separation of concerns

### For Products

- ✅ Unlimited images per product with ordering
- ✅ Dedicated thumbnail for each image
- ✅ 5 responsive variants for fast loading
- ✅ Better SEO with alt text
- ✅ Support for videos and documents in future

### For Performance

- ✅ Supabase CDN handles transformations (no server load)
- ✅ Client can request appropriate size
- ✅ Faster page loads with optimized images

### For Users (Admin Panel)

- ✅ Drag-and-drop image reordering
- ✅ Set primary image easily
- ✅ Add alt text for SEO
- ✅ Image preview with multiple sizes

---

## Alternative: Keep Current System

If you prefer **NOT** to implement media manager:

### Option B: Enhance Upload Feature Only

Add these to upload feature:

1. Generate multiple thumbnail sizes (not just 400x400)
2. Add `entity_type` and `entity_id` columns to uploads table
3. Add ordering and primary flag to uploads

**Pros:**

- Simpler, less code to maintain
- Everything in one place

**Cons:**

- Less flexible for future features
- Mixing file storage with entity logic
- Harder to support multiple images per entity

---

## Decision Matrix

| Criteria                | Current System | Upload Only | Media Manager (Hybrid) |
| ----------------------- | -------------- | ----------- | ---------------------- |
| **Complexity**          | Low            | Medium      | High                   |
| **Flexibility**         | Low            | Medium      | Very High              |
| **Maintenance**         | Medium         | Medium      | Low                    |
| **Future-proof**        | No             | Somewhat    | Yes                    |
| **SEO Features**        | No             | No          | Yes                    |
| **Multiple Images**     | Manual         | Manual      | Built-in               |
| **Implementation Time** | 0 days         | 2-3 days    | 3-5 days               |
| **Recommendation**      | ❌ Limited     | ⚠️ OK       | ✅ **Best**            |

---

## Recommendation

**Implement Media Manager (Hybrid Approach)** because:

1. **You already have the code** - It's well-written and tested
2. **Upload feature still valuable** - Keep it for basic file operations
3. **Future-proof** - Easy to add videos, documents, galleries
4. **Better architecture** - Proper separation of concerns
5. **Enhanced features** - SEO, ordering, variants, metadata
6. **Gradual migration** - Can migrate over time, no rush

**Timeline:** 3-5 days for full implementation  
**Risk:** Low - Code is already written and tested  
**Impact:** High - Much better media management for years to come

---

## Next Steps

1. **Approve this plan** and commit to media manager
2. **Day 1:** Uncomment schema, generate migration, run it
3. **Day 2:** Create API endpoints
4. **Day 3:** Integrate with product APIs
5. **Day 4:** Update admin panel
6. **Day 5:** Test and gradual rollout

---

## Questions to Answer

Before proceeding, decide:

1. **Do you want to implement media manager?** (Recommended: Yes)
2. **Timeline?** (Recommended: This week)
3. **Gradual migration or all at once?** (Recommended: Gradual)
4. **Keep old URL fields for backup?** (Recommended: Yes, for 30 days)

---

## Support Files to Create

After approval, I'll create:

1. `src/features/media-manager/apis/` - All 5 API handlers
2. `scripts/migrate-product-images.ts` - Migration script
3. `tests/features/media-manager/` - Unit tests
4. Updated product/blog APIs with media manager integration
5. Admin panel service updates

Let me know if you want to proceed! 🚀
