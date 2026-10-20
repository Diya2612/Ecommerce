# Phase 1 Refactoring Plan - Products Feature

**Date:** February 13, 2026  
**Target:** ProductListPage, AddProductPage, ProductDetailPage  
**Goal:** Eliminate code duplication using existing infrastructure

---

## 📊 Current Infrastructure Audit

### ✅ **Already Available (DO NOT RECREATE)**

#### 1. Global Components (`src/components/`)
- ✅ **ErrorBoundary** - Full error boundary implementation exists
- ✅ **UnsavedChangesGuard** - Already in use by product pages
- ✅ **FormSection** - Used by all product form sections
- ✅ **ConfirmationDialog** - Used in ProductListPage
- ✅ **GenericTable** - Powering ProductListPage
- ✅ **FiltersBar** - Handles all filtering logic
- ✅ **ActionButtons** - Import/Export/Create buttons
- ✅ **MetricsGrid** - Product stats display

#### 2. Media Components (`src/components/media/`)
- ✅ **useFileInput** - File input management
- ✅ **useImagePreview** - Image preview with keyboard nav
- ✅ **ImageUploadPlaceholder** - Empty state UI
- ✅ **ImagePreview** - Image display component
- ✅ **ImagePreviewModal** - Fullscreen image viewer

#### 3. Validation Infrastructure
- ✅ **validation.config.ts** - Global validation rules (IMAGE_VALIDATION, CURRENCY_CONFIG, etc.)
- ✅ **validation.ts** (utils) - Image validation functions
- ✅ **productSchema.ts** - Zod schemas (partially implemented)
- ✅ **validators.ts** (products/utils) - Price validators

#### 4. Form Utilities
- ✅ **useListState** - Centralized list state management
- ✅ **DateRangePicker** - Date range selection
- ✅ **input-helpers.ts** - Input helper functions

#### 5. Hooks
- ✅ **useProducts** - Query hook for products
- ✅ **useProductList** - List state hook
- ✅ **useProductForm** - Form state hook (complex)
- ✅ **useDeferredUpload** - Deferred image upload

### ❌ **Missing (NEED TO CREATE)**

1. **useDialog** - Global dialog state management
2. **useProductValidation** - Centralized validation with scroll-to-error
3. **useProductImageUpload** - Centralized image upload preparation
4. **Product Constants** - Filter values, status options, etc.
5. **Column Configuration Utility** - Extract table column logic
6. **Shared Types** - ValidationErrors, ExportOptions, etc.

---

## 🎯 Refactoring Strategy

### **Key Principle:** Use existing infrastructure, don't reinvent the wheel!

### Phase 1.1: Create Missing Core Utilities (Week 1, Days 1-2)

#### Task 1.1a: Create `useDialog` Hook ⭐ NEW
**Location:** `src/hooks/useDialog.ts`

**Why:** Currently 15+ places manually manage dialog state with `useState(false)`

**Implementation:**
```typescript
export function useDialog(defaultOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev),
    setIsOpen
  };
}
```

**Usage:**
```typescript
// Before:
const [showDeleteDialog, setShowDeleteDialog] = useState(false);
const handleDeleteClick = () => setShowDeleteDialog(true);

// After:
const deleteDialog = useDialog();
<Button onClick={deleteDialog.open}>Delete</Button>
<ConfirmationDialog isOpen={deleteDialog.isOpen} onClose={deleteDialog.close} />
```

**Impact:** 
- ProductListPage: Remove 2 lines
- AddProductPage: N/A (uses UnsavedChangesGuard)
- ProductDetailPage: Remove 2 lines + cleaner code

---

#### Task 1.1b: Create `useProductValidation` Hook ⭐ NEW
**Location:** `src/features/products/hooks/useProductValidation.ts`

**Why:** 150+ lines of duplicate validation + scroll logic in Add/Detail pages

**Leverages:**
- Existing `validators.ts` (priceValidators)
- Existing `validation.config.ts` (VALIDATION_MESSAGES)
- Existing `productSchema.ts` (Zod schemas)

**Implementation:**
```typescript
import { priceValidators } from '../utils/validators';
import { VALIDATION_MESSAGES } from '@/config/validation.config';

export function useProductValidation(callbacks?: {
  setExpandedVariantId?: (id: string) => void;
  setExpandedFaqId?: (id: string) => void;
}) {
  const [imageError, setImageError] = useState<string | null>(null);

  // Field ID mapping for scroll-to-error
  const fieldIdMap = {...};

  // Scroll to error with accordion expansion support
  const scrollToError = useCallback((errorKey: string) => {
    // Handle variants, FAQs, and regular fields
    // Expand accordions if needed
    // Scroll and focus
  }, [callbacks]);

  // Validate with image requirement check
  const validateWithImageCheck = useCallback((
    validate: () => ValidationErrors,
    options: {
      pendingPrimaryImage: File | null;
      existingImages?: ProductImage[];
      isEditMode?: boolean;
    }
  ) => {
    const errors = validate();
    
    // Add image validation using VALIDATION_MESSAGES
    const { pendingPrimaryImage, existingImages, isEditMode } = options;
    const hasImage = isEditMode 
      ? (existingImages?.length ?? 0) > 0 || pendingPrimaryImage !== null
      : pendingPrimaryImage !== null;
    
    if (!hasImage) {
      errors.productImages = VALIDATION_MESSAGES.IMAGE_NOT_PROVIDED;
      setImageError(VALIDATION_MESSAGES.IMAGE_NOT_PROVIDED);
    }
    
    return Object.keys(errors).length > 0 ? errors : null;
  }, []);

  return { imageError, scrollToError, validateWithImageCheck, clearImageError };
}
```

**Usage in pages:**
```typescript
// Before (95 lines):
const validationErrors = validate();
if (!pendingPrimaryImage) { /* ... */ }
if (Object.keys(validationErrors).length > 0) {
  // 50+ lines of scroll logic
}

// After (5 lines):
const { validateWithImageCheck, scrollToError } = useProductValidation({
  setExpandedVariantId, setExpandedFaqId
});
const errors = validateWithImageCheck(validate, { pendingPrimaryImage, existingImages, isEditMode });
if (errors) scrollToError(Object.keys(errors)[0]);
```

**Impact:**
- AddProductPage: Remove ~85 lines
- ProductDetailPage: Remove ~90 lines
- Total: ~175 lines eliminated

---

#### Task 1.1c: Create `useProductImageUpload` Hook ⭐ NEW
**Location:** `src/features/products/hooks/useProductImageUpload.ts`

**Why:** 30+ lines of duplicate image preparation logic

**Leverages:**
- Existing `useDeferredUpload` (already does the heavy lifting)
- Just needs wrapper to standardize the preparation flow

**Implementation:**
```typescript
export function useProductImageUpload() {
  const generateFolderPath = useCallback((formData: ProductFormData) => {
    const slug = formData.slug || formData.productTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    return `products/${slug}`;
  }, []);

  const prepareImageUpload = useCallback(async ({
    formData,
    pendingPrimaryImage,
    pendingAdditionalImages,
    uploadPendingImages,
    uploadVariantImages,
    isEditMode
  }) => {
    // Centralized logic for uploading and building ProductImage[]
    // Returns: { productImages, variantUploadResults }
  }, []);

  return { prepareImageUpload, generateFolderPath };
}
```

**Impact:**
- AddProductPage: Remove ~30 lines
- ProductDetailPage: Remove ~35 lines
- Total: ~65 lines eliminated

---

### Phase 1.2: Create Product Constants (Week 1, Day 3)

#### Task 1.2a: Create Product Constants File ⭐ NEW
**Location:** `src/features/products/constants/index.ts`

**Why:** Magic strings scattered throughout ProductListPage

**Leverages:**
- Pattern from existing `API_ROUTES` constant structure
- Follows product feature structure

**Implementation:**
```typescript
// src/features/products/constants/filters.ts
export const PRODUCT_FILTER_VALUES = {
  STATUS: {
    ACTIVE: 'active',
    DRAFT: 'draft',
    ARCHIVED: 'archived'
  },
  QUICK: {
    LOW_STOCK: 'low-stock',
    ZERO_AVAILABLE: 'zero-available',
    RECENTLY_UPDATED: 'recently-updated',
    BLOCKED: 'blocked'
  }
} as const;

export const PRODUCT_FILTER_OPTIONS = {
  status: [
    { label: "All Status", value: "" },
    { label: "Active", value: PRODUCT_FILTER_VALUES.STATUS.ACTIVE },
    // ... more
  ],
  // ... more filter groups
};

// src/features/products/constants/statuses.ts
export const PRODUCT_STATUSES = {
  ACTIVE: 'active',
  DRAFT: 'draft',
  ARCHIVED: 'archived',
  SCHEDULED: 'scheduled'
} as const;

export const PRODUCT_STATUS_CONFIG = {
  [PRODUCT_STATUSES.ACTIVE]: {
    label: 'Active',
    color: 'emerald',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  // ... more
};

// src/features/products/constants/sorts.ts
export const PRODUCT_SORT_OPTIONS = [
  { label: "Newest First", value: "newest", direction: "desc" as const },
  { label: "Oldest First", value: "oldest", direction: "asc" as const },
  { label: "Price (High-Low)", value: "price_desc", direction: "desc" as const },
  { label: "Price (Low-High)", value: "price_asc", direction: "asc" as const },
];

// src/features/products/constants/index.ts
export * from './filters';
export * from './statuses';
export * from './sorts';
```

**Usage:**
```typescript
// Before:
{
  label: "Low Stock",
  value: "low-stock", // Magic string!
}

// After:
import { PRODUCT_FILTER_VALUES, PRODUCT_FILTER_OPTIONS } from '../constants';

// Use pre-configured options:
filterGroups={[
  {
    id: "status",
    label: "Status",
    options: PRODUCT_FILTER_OPTIONS.status.map(opt => ({
      ...opt,
      onSelect: () => handleStatusChange(opt.value),
      isActive: status.includes(opt.value)
    }))
  }
]}
```

**Impact:**
- ProductListPage: Remove ~100 lines of inline filter definitions
- Type safety: TypeScript autocomplete for all filter values
- Consistency: Same values used everywhere

---

#### Task 1.2b: Create Shared Types File ⭐ NEW
**Location:** `src/features/products/types/shared.ts`

**Why:** Common types reused across hooks and pages

**Implementation:**
```typescript
/**
 * Validation errors map
 */
export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Callbacks for expanding accordions during validation
 */
export interface ValidationCallbacks {
  setExpandedVariantId?: (id: string) => void;
  setExpandedFaqId?: (id: string) => void;
}

/**
 * Image validation options
 */
export interface ImageValidationOptions {
  pendingPrimaryImage: File | null;
  existingImages?: ProductImage[];
  isEditMode?: boolean;
}

/**
 * Export options
 */
export interface ExportOptions {
  scope: 'all' | 'selected';
  format: 'csv' | 'xlsx';
  selectedColumns: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  selectedIds?: string[];
  status?: string[];
  stockStatus?: string[];
  categoryId?: string[];
  search?: string;
}

/**
 * Import options
 */
export interface ImportOptions {
  mode: 'create' | 'update' | 'upsert';
  data: any[];
}
```

**Impact:**
- Better type safety
- No more 'any' types
- Explicit interfaces

---

### Phase 1.3: Extract Column Configuration (Week 1, Day 4)

#### Task 1.3a: Create Column Config Utility ⭐ NEW
**Location:** `src/features/products/utils/columnConfig.ts`

**Why:** 150+ lines of inline column mapping logic in ProductListPage

**Leverages:**
- Existing `GenericTable` column system
- Existing tier data

**Implementation:**
```typescript
import type { ColumnConfig } from '@/components/data-table';
import { PRODUCT_STATUS_CONFIG } from '../constants';

/**
 * Create column definition for a single column
 */
export function createColumnDefinition(
  column: ColumnConfig,
  tiers: Tier[],
  navigate: NavigateFunction
) {
  const config: any = {
    key: column.key,
    label: column.label,
    sortable: !NON_SORTABLE_COLUMNS.includes(column.key),
  };

  // Product title column
  if (column.key === 'product_title') {
    config.render = (value: string) => (
      <div className="w-[200px]">
        <p className="font-medium text-slate-700 truncate" title={value}>
          {value}
        </p>
      </div>
    );
  }
  
  // Status column
  else if (column.key === 'status') {
    config.type = 'badge';
    config.render = (value: string) => {
      const statusConfig = PRODUCT_STATUS_CONFIG[value];
      return (
        <span className={`px-2 py-0.5 rounded-full text-xs ${statusConfig?.badge}`}>
          {statusConfig?.label || value}
        </span>
      );
    };
  }
  
  // ... more column types
  
  return config;
}

/**
 * Get all product column configurations
 */
export function getProductColumnConfig(
  visibleColumns: ColumnConfig[],
  tiers: Tier[],
  navigate: NavigateFunction
) {
  return visibleColumns
    .filter(c => c.visible)
    .map(c => createColumnDefinition(c, tiers, navigate));
}

// Non-sortable columns list
const NON_SORTABLE_COLUMNS = [
  'barcode',
  'hsn_code',
  'primary_image_url',
  'weight',
  'tags'
];
```

**Usage:**
```typescript
// Before (150 lines of inline logic):
columns={visibleColumns.filter(c => c.visible).map(c => {
  let type = "text";
  let render = undefined;
  if (c.key === 'product_title') {
    // 10 lines
  } else if (c.key === 'status') {
    // 15 lines
  }
  // ... 120 more lines
})}

// After (1 line + memo):
const columns = useMemo(
  () => getProductColumnConfig(visibleColumns, tiers, navigate),
  [visibleColumns, tiers, navigate]
);
```

**Impact:**
- ProductListPage: Remove ~150 lines
- Improved performance with useMemo
- Easier to test and modify

---

### Phase 1.4: Update Pages to Use New Infrastructure (Week 1, Day 5 - Week 2)

#### Task 1.4a: Refactor ProductListPage ⭐ REFACTOR

**Changes:**
1. Replace dialog state with `useDialog`
2. Use `PRODUCT_FILTER_OPTIONS` constants
3. Use `getProductColumnConfig` utility
4. Add explicit types (no 'any')

**Before → After:**
```typescript
// BEFORE: Manual dialog state
const [showDeleteDialog, setShowDeleteDialog] = useState(false);
const handleDeleteClick = () => setShowDeleteDialog(true);

// AFTER: useDialog hook
const deleteDialog = useDialog();
```

```typescript
// BEFORE: Inline filter options (100+ lines)
filterGroups={[
  {
    id: "status",
    label: "Status",
    options: [
      { label: "Active", value: "active", /* ... */ },
      // ... 50 more lines
    ]
  }
]}

// AFTER: Constants (5 lines)
import { PRODUCT_FILTER_OPTIONS } from '../constants';
filterGroups={buildFilterGroups()}
```

**Estimated:**
- Lines removed: ~250
- Lines added: ~50
- Net savings: ~200 lines
- Time: 4 hours

---

#### Task 1.4b: Refactor AddProductPage ⭐ REFACTOR

**Changes:**
1. Use `useProductValidation` hook
2. Use `useProductImageUpload` hook
3. Fix useEffect dependencies
4. Add explicit types

**Before → After:**
```typescript
// BEFORE: 95 lines of validation + scroll logic
const validationErrors = validate();
if (!pendingPrimaryImage) {
  validationErrors.productImages = 'Primary product image is required';
  setImageError('Primary product image is required');
}
if (Object.keys(validationErrors).length > 0) {
  // 50+ lines of scroll logic
  const fieldIdMap = {...};
  // ... complex logic
}

// AFTER: 5 lines
const { validateWithImageCheck, scrollToError } = useProductValidation({
  setExpandedVariantId,
  setExpandedFaqId
});
const errors = validateWithImageCheck(validate, {
  pendingPrimaryImage,
  existingImages: [],
  isEditMode: false
});
if (errors) {
  notifyError(errors[Object.keys(errors)[0]]);
  scrollToError(Object.keys(errors)[0]);
  return;
}
```

```typescript
// BEFORE: 30 lines of image upload prep
const productSlug = formData.slug || formData.productTitle
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-');
const folderPath = `products/${productSlug}`;
const result = await uploadPendingImages(folderPath);
// ... build productImages array (20 lines)

// AFTER: 3 lines
const { prepareImageUpload } = useProductImageUpload();
const { productImages, variantUploadResults } = await prepareImageUpload({
  formData, pendingPrimaryImage, pendingAdditionalImages,
  uploadPendingImages, uploadVariantImages, isEditMode: false
});
```

**Estimated:**
- Lines removed: ~120
- Lines added: ~15
- Net savings: ~105 lines
- Time: 3 hours

---

#### Task 1.4c: Refactor ProductDetailPage ⭐ REFACTOR

**Changes:**
1. Use `useDialog` hook
2. Use `useProductValidation` hook
3. Use `useProductImageUpload` hook
4. Fix useEffect dependencies with useCallback

**Before → After:**
```typescript
// BEFORE: Manual dialog state
const [showDeleteDialog, setShowDeleteDialog] = useState(false);

// AFTER: useDialog
const deleteDialog = useDialog();
```

```typescript
// BEFORE: Duplicate validation (same 90 lines as AddProductPage)
const validationErrors = validate();
if (!hasExistingImage && !hasPendingImage) {
  // ... error handling
}
// ... 50+ lines of scroll logic

// AFTER: useProductValidation (same 5 lines as AddProductPage)
const errors = validateWithImageCheck(validate, {
  pendingPrimaryImage,
  existingImages: formData.productImages,
  isEditMode: true
});
if (errors) {
  scrollToError(Object.keys(errors)[0]);
  return;
}
```

```typescript
// BEFORE: Manual useEffect (missing deps)
useEffect(() => {
  fetchProductTags();
}, []); // ❌ Missing dependency

// AFTER: Wrapped in useCallback
const fetchProductTags = useCallback(async () => {
  try {
    const response = await tagService.getAllTags({ type: 'product', status: 'active' });
    if (response?.tags) {
      setAvailableTags(response.tags.map(tag => tag.name));
    }
  } catch (error) {
    console.error('Failed to fetch product tags', error);
  }
}, []);

useEffect(() => {
  fetchProductTags();
}, [fetchProductTags]); // ✅ Correct dependencies
```

**Estimated:**
- Lines removed: ~130
- Lines added: ~20
- Net savings: ~110 lines
- Time: 3 hours

---

### Phase 1.5: Testing & Validation (Week 2, Days 4-5)

#### Task 1.5a: Manual Testing Checklist

**ProductListPage:**
- [ ] Filters work correctly with constants
- [ ] Delete dialog opens/closes with useDialog
- [ ] Column rendering matches previous behavior
- [ ] No TypeScript errors
- [ ] Performance is same or better

**AddProductPage:**
- [ ] Validation works with new hook
- [ ] Image upload still functions
- [ ] Error scroll-to works for all fields
- [ ] Variant validation scroll works
- [ ] FAQ validation scroll works
- [ ] useEffect deps don't cause re-renders

**ProductDetailPage:**
- [ ] Edit mode validation correct
- [ ] Image upload works
- [ ] Delete dialog with useDialog
- [ ] Tags fetch on mount
- [ ] No infinite loops from useEffect

#### Task 1.5b: Create Unit Tests (Optional but Recommended)

```typescript
// src/hooks/__tests__/useDialog.test.ts
describe('useDialog', () => {
  it('should initialize with default closed state', () => {
    const { result } = renderHook(() => useDialog());
    expect(result.current.isOpen).toBe(false);
  });

  it('should open and close', () => {
    const { result } = renderHook(() => useDialog());
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });
});
```

---

## 📊 Expected Impact Summary

### Lines of Code Reduction
| Page | Before | After | Savings |
|------|--------|-------|---------|
| ProductListPage | ~503 | ~350 | ~153 lines (30%) |
| AddProductPage | ~468 | ~360 | ~108 lines (23%) |
| ProductDetailPage | ~665 | ~550 | ~115 lines (17%) |
| **Total** | **1,636** | **1,260** | **376 lines (23%)** |

### Code Quality Improvements
- ✅ Zero code duplication in validation logic
- ✅ All useEffect dependencies correct
- ✅ No TypeScript 'any' types
- ✅ Centralized constants (no magic strings)
- ✅ Reusable hooks for common patterns
- ✅ Better performance (useMemo for columns)

### New Reusable Assets
- `useDialog` - Can be used by 15+ other features
- `useProductValidation` - Reusable for custom product forms
- `useProductImageUpload` - Reusable for bulk upload
- Product constants - Used by filters, reports, analytics

---

## 🚀 Implementation Timeline

### Week 1: Core Infrastructure
- **Day 1:** Create useDialog + useProductValidation
- **Day 2:** Create useProductImageUpload
- **Day 3:** Create product constants + shared types
- **Day 4:** Create column config utility
- **Day 5:** Start page refactoring (ProductListPage)

### Week 2: Page Refactoring + Testing
- **Day 1:** Finish ProductListPage
- **Day 2:** Refactor AddProductPage
- **Day 3:** Refactor ProductDetailPage
- **Day 4:** Manual testing + bug fixes
- **Day 5:** Code review + documentation

---

## ✅ Success Criteria

### Must Have
- [ ] All 3 pages refactored
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] useEffect dependencies correct
- [ ] Manual testing completed

### Nice to Have
- [ ] Unit tests for new hooks (80% coverage)
- [ ] Storybook stories for new components
- [ ] Performance benchmarks
- [ ] Migration guide for other features

---

## 🎯 Key Decisions & Rationale

### Why NOT Create These?

1. **ErrorBoundary** - Already exists in `src/components/layouts/ErrorBoundary.tsx`
   - Full implementation with dev mode error display
   - Just need to wrap product pages

2. **Image Upload Components** - Already exist in `src/components/media/`
   - `useFileInput`, `useImagePreview`, `ImageUploadPlaceholder`
   - Product feature uses different pattern (deferred upload)
   - Keep product-specific for now

3. **Form Components** - Already exist in `src/components/forms/`
   - `FormSection`, `FormFieldGroup`, `FormButton`
   - Already used by all product form sections

4. **Validation Config** - Already exists in `src/config/validation.config.ts`
   - `IMAGE_VALIDATION`, `CURRENCY_CONFIG`, etc.
   - Use these constants instead of hardcoding

### Why Create These?

1. **useDialog** - Pattern repeated 15+ times in codebase
   - Simple, reusable, no existing equivalent
   - Can be moved to global hooks

2. **useProductValidation** - 150+ lines duplicated exactly
   - Product-specific but eliminates major duplication
   - Leverages existing validation utilities

3. **useProductImageUpload** - 30+ lines duplicated
   - Wraps `useDeferredUpload` with product context
   - Centralizes folder path logic

4. **Product Constants** - Magic strings throughout
   - Type-safe filter values
   - Single source of truth

---

## 📝 Next Steps

After completing Phase 1:

1. **Measure Impact**
   - Run before/after bundle size comparison
   - Measure render performance
   - Check code coverage

2. **Document Patterns**
   - Update BEST_PRACTICES.md with new hooks
   - Add JSDoc comments
   - Create usage examples

3. **Roll Out to Other Features**
   - Use `useDialog` in Orders, Customers, etc.
   - Create similar validation hooks for other features
   - Standardize column config pattern

4. **Move to Phase 2**
   - Performance optimization
   - Component memoization
   - Virtualization for long lists

---

## 🔗 Related Files

### To Create
- [ ] `src/hooks/useDialog.ts`
- [ ] `src/features/products/hooks/useProductValidation.ts`
- [ ] `src/features/products/hooks/useProductImageUpload.ts`
- [ ] `src/features/products/constants/index.ts`
- [ ] `src/features/products/constants/filters.ts`
- [ ] `src/features/products/constants/statuses.ts`
- [ ] `src/features/products/constants/sorts.ts`
- [ ] `src/features/products/types/shared.ts`
- [ ] `src/features/products/utils/columnConfig.ts`

### To Update
- [ ] `src/features/products/pages/ProductListPage.tsx`
- [ ] `src/features/products/pages/AddProductPage.tsx`
- [ ] `src/features/products/pages/ProductDetailPage.tsx`
- [ ] `src/features/products/hooks/index.ts` (add exports)
- [ ] `src/hooks/index.ts` (add useDialog export)

### To Reference
- ✅ `src/components/layouts/ErrorBoundary.tsx` (existing)
- ✅ `src/components/guards/UnsavedChangesGuard.tsx` (existing)
- ✅ `src/config/validation.config.ts` (existing)
- ✅ `src/utils/validation.ts` (existing)
- ✅ `src/features/products/utils/validators.ts` (existing)

---

**Ready to start implementation? Let's begin with creating the useDialog hook!**
