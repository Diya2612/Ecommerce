/**
 * Product Filter Values
 * Type-safe constants for product filtering
 */
export const PRODUCT_FILTER_VALUES = {
  STATUS: {
    ACTIVE: 'active',
    DRAFT: 'draft',
    ARCHIVED: 'archived',
  },
  QUICK: {
    LOW_STOCK: 'low-stock',
    ZERO_AVAILABLE: 'zero-available',
    RECENTLY_UPDATED: 'recently-updated',
    BLOCKED: 'blocked',
  },
} as const;

/**
 * Product Filter Options Factory
 * Creates filter groups with state handlers for FiltersBar component
 */
export const PRODUCT_FILTER_OPTIONS = {
  /**
   * Status filter group
   * @param status - Current status array
   * @param setStatus - Status setter function
   * @param setPage - Page setter to reset pagination
   */
  STATUS: (
    status: string[],
    setStatus: (status: string[]) => void,
    setPage: (page: number) => void
  ) => ({
    id: 'status',
    label: 'Status',
    options: [
      {
        label: 'All Status',
        value: '',
        onSelect: () => {
          setStatus([]);
          setPage(1);
        },
        isActive: status.length === 0,
      },
      {
        label: 'Active',
        value: PRODUCT_FILTER_VALUES.STATUS.ACTIVE,
        onSelect: () => {
          const newStatus = status.includes(PRODUCT_FILTER_VALUES.STATUS.ACTIVE)
            ? status.filter((s) => s !== PRODUCT_FILTER_VALUES.STATUS.ACTIVE)
            : [...status, PRODUCT_FILTER_VALUES.STATUS.ACTIVE];
          setStatus(newStatus);
          setPage(1);
        },
        isActive: status.includes(PRODUCT_FILTER_VALUES.STATUS.ACTIVE),
      },
      {
        label: 'Draft',
        value: PRODUCT_FILTER_VALUES.STATUS.DRAFT,
        onSelect: () => {
          const newStatus = status.includes(PRODUCT_FILTER_VALUES.STATUS.DRAFT)
            ? status.filter((s) => s !== PRODUCT_FILTER_VALUES.STATUS.DRAFT)
            : [...status, PRODUCT_FILTER_VALUES.STATUS.DRAFT];
          setStatus(newStatus);
          setPage(1);
        },
        isActive: status.includes(PRODUCT_FILTER_VALUES.STATUS.DRAFT),
      },
      {
        label: 'Archived',
        value: PRODUCT_FILTER_VALUES.STATUS.ARCHIVED,
        onSelect: () => {
          const newStatus = status.includes(PRODUCT_FILTER_VALUES.STATUS.ARCHIVED)
            ? status.filter((s) => s !== PRODUCT_FILTER_VALUES.STATUS.ARCHIVED)
            : [...status, PRODUCT_FILTER_VALUES.STATUS.ARCHIVED];
          setStatus(newStatus);
          setPage(1);
        },
        isActive: status.includes(PRODUCT_FILTER_VALUES.STATUS.ARCHIVED),
      },
    ],
  }),

  /**
   * Quick filters group
   * @param quickFilters - Current quick filters array
   * @param setQuickFilters - Quick filters setter function
   * @param setPage - Page setter to reset pagination
   */
  QUICK_FILTERS: (
    quickFilters: string[],
    setQuickFilters: (filters: string[]) => void,
    setPage: (page: number) => void
  ) => ({
    id: 'quick',
    label: 'Quick Filters',
    options: [
      {
        label: 'All Products',
        value: '',
        onSelect: () => {
          setQuickFilters([]);
          setPage(1);
        },
        isActive: quickFilters.length === 0,
      },
      {
        label: 'Low Stock',
        value: PRODUCT_FILTER_VALUES.QUICK.LOW_STOCK,
        onSelect: () => {
          const newFilters = quickFilters.includes(PRODUCT_FILTER_VALUES.QUICK.LOW_STOCK)
            ? quickFilters.filter((f) => f !== PRODUCT_FILTER_VALUES.QUICK.LOW_STOCK)
            : [...quickFilters, PRODUCT_FILTER_VALUES.QUICK.LOW_STOCK];
          setQuickFilters(newFilters);
          setPage(1);
        },
        isActive: quickFilters.includes(PRODUCT_FILTER_VALUES.QUICK.LOW_STOCK),
      },
      {
        label: 'Zero Available',
        value: PRODUCT_FILTER_VALUES.QUICK.ZERO_AVAILABLE,
        onSelect: () => {
          const newFilters = quickFilters.includes(PRODUCT_FILTER_VALUES.QUICK.ZERO_AVAILABLE)
            ? quickFilters.filter((f) => f !== PRODUCT_FILTER_VALUES.QUICK.ZERO_AVAILABLE)
            : [...quickFilters, PRODUCT_FILTER_VALUES.QUICK.ZERO_AVAILABLE];
          setQuickFilters(newFilters);
          setPage(1);
        },
        isActive: quickFilters.includes(PRODUCT_FILTER_VALUES.QUICK.ZERO_AVAILABLE),
      },
      {
        label: 'Recently Updated',
        value: PRODUCT_FILTER_VALUES.QUICK.RECENTLY_UPDATED,
        onSelect: () => {
          const newFilters = quickFilters.includes(PRODUCT_FILTER_VALUES.QUICK.RECENTLY_UPDATED)
            ? quickFilters.filter((f) => f !== PRODUCT_FILTER_VALUES.QUICK.RECENTLY_UPDATED)
            : [...quickFilters, PRODUCT_FILTER_VALUES.QUICK.RECENTLY_UPDATED];
          setQuickFilters(newFilters);
          setPage(1);
        },
        isActive: quickFilters.includes(PRODUCT_FILTER_VALUES.QUICK.RECENTLY_UPDATED),
      },
      // {
      //   label: 'Blocked > 0',
      //   value: PRODUCT_FILTER_VALUES.QUICK.BLOCKED,
      //   onSelect: () => { ... },
      //   isActive: quickFilters.includes(PRODUCT_FILTER_VALUES.QUICK.BLOCKED),
      // },
    ],
  }),

  /**
   * Category filter group
   * @param category - Current category array
   * @param setCategory - Category setter function
   * @param setPage - Page setter to reset pagination
   * @param tiers - Array of tier data for categories
   */
  CATEGORY: (
    category: string[],
    setCategory: (category: string[]) => void,
    setPage: (page: number) => void,
    tiers: Array<{ id: string; name: string }>
  ) => ({
    id: 'category',
    label: 'Category',
    options: [
      {
        label: 'All Categories',
        value: '',
        onSelect: () => {
          setCategory([]);
          setPage(1);
        },
        isActive: category.length === 0,
      },
      ...tiers.map((t) => ({
        label: t.name,
        value: t.id,
        onSelect: () => {
          const newCategory = category.includes(t.id)
            ? category.filter((c) => c !== t.id)
            : [...category, t.id];
          setCategory(newCategory);
          setPage(1);
        },
        isActive: category.includes(t.id),
      })),
    ],
  }),
};

