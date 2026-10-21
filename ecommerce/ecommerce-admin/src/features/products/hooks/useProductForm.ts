import { useState, useEffect, useMemo, useRef } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productValidationSchema, type ProductSchemaData } from '../validation/productSchema';
import type { ProductFormData } from '../types';

/**
 * Standard form hook options interface
 */
interface UseProductFormOptions {
  mode?: 'create' | 'edit';
  initialData?: Partial<ProductFormData>;
  productId?: string;
}

/**
 * Default form data for new products
 */
const getDefaultFormData = (): Partial<ProductSchemaData> => ({
  productTitle: '',
  secondaryTitle: '',
  shortDescription: '',
  fullDescription: '',
  costPrice: '',
  sellingPrice: '',
  compareAtPrice: '',
  sku: '',
  hsnNumber: '',
  barcode: '',
  inventoryQuantity: '',
  weight: '',
  length: '',
  breadth: '',
  height: '',
  tier1Category: '',
  tier2Category: '',
  tier3Category: '',
  tier4Category: '',
  productStatus: 'draft',
  featured: false,
  productImages: [],
  productUrl: '',
  metaTitle: '',
  metaDescription: '',
  faqs: [],
  tags: [],
  slug: '',
  salesChannels: ['Online Store'], // Default channel
  productVariants: [],
});

/**
 * Extended interface for the hook return value
 * Includes both RHF methods and legacy compatibility helpers
 */
export interface UseProductFormReturn extends UseFormReturn<ProductSchemaData> {
  // UI State
  mode: 'create' | 'edit';
  hasChanges: boolean;

  // Accordion/Expansion State
  expandedVariantId: string | null;
  setExpandedVariantId: (id: string | null) => void;
  expandedFaqId: string | null;
  setExpandedFaqId: (id: string | null) => void;

  handleProductImagesChange: (images: any[]) => void;
}

/**
 * Refactored Product Form Hook using React Hook Form
 */
export function useProductForm(optionsOrData?: UseProductFormOptions | ProductFormData): UseProductFormReturn {
  // Determine configuration
  const isLegacyCall = optionsOrData && !('mode' in optionsOrData) && !('initialData' in optionsOrData) && ('productTitle' in optionsOrData || Object.keys(optionsOrData).length > 0);
  const mode = isLegacyCall ? 'edit' : (optionsOrData as UseProductFormOptions)?.mode || 'create';
  const initialDataRaw = isLegacyCall ? (optionsOrData as ProductFormData) : (optionsOrData as UseProductFormOptions)?.initialData;

  // Prepare default values by merging default structure with initial data
  const defaultValues = useMemo<ProductSchemaData>(() => {
    const defaults = getDefaultFormData();
    if (initialDataRaw && Object.keys(initialDataRaw).length > 0) {
      // Create new references for arrays to prevent mutation issues
      return {
        ...defaults,
        ...initialDataRaw,
        // Ensure arrays are initialized
        productImages: initialDataRaw.productImages ? [...initialDataRaw.productImages] : [],
        faqs: initialDataRaw.faqs ? [...initialDataRaw.faqs] : [],
        productVariants: initialDataRaw.productVariants ? [...initialDataRaw.productVariants] : [],
      } as ProductSchemaData;
    }
    return defaults as ProductSchemaData;
  }, [initialDataRaw]);

  // Initialize RHF
  const form = useForm<ProductSchemaData>({
    resolver: zodResolver(productValidationSchema),
    values: defaultValues, // Using 'values' instead of 'defaultValues' auto-resets form when async data loads
    mode: 'onChange', // Validate on change for immediate feedback
  });

  const { setValue, watch, formState } = form;

  // UI State
  const [expandedVariantId, setExpandedVariantId] = useState<string | null>(null);
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  // Handle auto-generation of fields (Slug, SKU, etc.)
  const productTitle = watch('productTitle');
  const productUrl = watch('productUrl');
  const shortDescription = watch('shortDescription');
  const tier1Category = watch('tier1Category');
  const tier2Category = watch('tier2Category');
  const tier3Category = watch('tier3Category');

  // Helper to normalize and generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Track initial values on mount to detect changes in edit mode
  const initialTitleRef = useRef<string | null>(null);
  const initialDescRef = useRef<string | null>(null);

  useEffect(() => {
    if (initialTitleRef.current === null && productTitle) {
      initialTitleRef.current = productTitle;
    }
  }, [productTitle]);

  useEffect(() => {
    if (initialDescRef.current === null && shortDescription) {
      initialDescRef.current = shortDescription;
    }
  }, [shortDescription]);

  // Auto-generate slug, productUrl, and metaTitle directly from product name
  useEffect(() => {
    if (productTitle) {
      const slugValue = generateSlug(productTitle);
      const isTitleEdited = initialTitleRef.current !== null && initialTitleRef.current !== productTitle;

      if (mode === 'create' || isTitleEdited) {
        setValue('productUrl', slugValue, { shouldValidate: true, shouldDirty: true });
        setValue('slug', slugValue, { shouldDirty: true });
        setValue('metaTitle', productTitle.slice(0, 60), { shouldDirty: true });
      }
    }
  }, [productTitle, mode, setValue]);

  // Sync manual edits of productUrl to slug
  useEffect(() => {
    if (productUrl) {
      const slugValue = generateSlug(productUrl);
      if (slugValue !== productUrl) {
        setValue('slug', slugValue, { shouldDirty: true });
      } else {
        setValue('slug', productUrl, { shouldDirty: true });
      }
    }
  }, [productUrl, setValue]);

  // Auto-fill Meta Description from shortDescription or productTitle
  useEffect(() => {
    const isDescEdited = initialDescRef.current !== null && initialDescRef.current !== shortDescription;
    const isTitleEdited = initialTitleRef.current !== null && initialTitleRef.current !== productTitle;

    if (mode === 'create' || isDescEdited || isTitleEdited) {
      const desc = shortDescription || productTitle || '';
      if (desc) {
        setValue('metaDescription', desc.slice(0, 160), { shouldDirty: true });
      }
    }
  }, [shortDescription, productTitle, mode, setValue]);

  // Auto-generate SKU for new products
  useEffect(() => {
    if (mode === 'create' && productTitle && !formState.touchedFields.sku) {
      const currentSku = form.getValues('sku');
      if (!currentSku) {
        const timestamp = Date.now().toString().slice(-4);
        const generatedSku = (productTitle.slice(0, 3).toUpperCase() + timestamp).replace(/[^A-Z0-9]/g, '');
        setValue('sku', generatedSku);
      }
    }
  }, [productTitle, mode, setValue, formState.touchedFields.sku, form]);

  // Reset subcategories when parent changes
  useEffect(() => {
    if (formState.dirtyFields.tier1Category) {
      setValue('tier2Category', '');
      setValue('tier3Category', '');
      setValue('tier4Category', '');
    }
  }, [tier1Category, setValue, formState.dirtyFields.tier1Category]);

  useEffect(() => {
    if (formState.dirtyFields.tier2Category) {
      setValue('tier3Category', '');
      setValue('tier4Category', '');
    }
  }, [tier2Category, setValue, formState.dirtyFields.tier2Category]);

  useEffect(() => {
    if (formState.dirtyFields.tier3Category) {
      setValue('tier4Category', '');
    }
  }, [tier3Category, setValue, formState.dirtyFields.tier3Category]);

  // Image Helper
  const handleProductImagesChange = (images: any[]) => {
    // Replace entire array
    setValue('productImages', images, { shouldValidate: true, shouldDirty: true });
  };

  return {
    ...form,
    mode,
    hasChanges: formState.isDirty,

    expandedVariantId,
    setExpandedVariantId,
    expandedFaqId,
    setExpandedFaqId,

    handleProductImagesChange
  };
}
