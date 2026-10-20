import { notifyError, notifyInfo, notifySuccess } from '@/utils';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UnsavedChangesGuard } from '@/components/guards/UnsavedChangesGuard';
import { FormProvider } from 'react-hook-form';

import { useProductForm, useDeferredUpload, useProductValidation, useProductImageUpload } from '@/features/products/hooks';
import { PageHeader } from '@/components/layouts/headers';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  BasicDetailsSection,
  DeferredMediaSection,
  PricingInventorySection,
  ProductVariantsSection,
  CategorizationSection,
  SeoSection,
  FaqSection,
  AvailabilitySection,
  AssociationsSection,
} from '../components/form-sections';
import { NotesTags } from '@/features/notes/components/NotesTags';
import { ROUTES } from '@/lib/constants';
import { productService } from '@/features/products/services/productService';
import type { ProductSchemaData } from '@/features/products/validation/productSchema';

export default function AddProductPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaveSuccess, setIsSaveSuccess] = useState(false);

  // Initialize form hook
  const methods = useProductForm({ mode: 'create' });

  const {
    formState,
    handleSubmit,
    setValue,
    watch,
    // Custom helpers returned from hook
    expandedVariantId,
    setExpandedVariantId,
    expandedFaqId,
    setExpandedFaqId,
    handleProductImagesChange, // Still needed for deferred media section
  } = methods;

  const { isDirty } = formState;
  const formData = watch();

  // Product validation hook - used for scrolling to errors and image validation
  const { scrollToError, imageError } = useProductValidation({
    setExpandedVariantId,
    setExpandedFaqId,
  });

  // Product image upload hook
  const { prepareImageUpload } = useProductImageUpload();

  // Deferred upload hook for pending images (separate primary and additional)
  const {
    pendingPrimaryImage,
    setPendingPrimaryImage,
    pendingAdditionalImages,
    setPendingAdditionalImages,
    uploadPendingImages,
    uploadVariantImages,
  } = useDeferredUpload();

  const onBack = () => {
    navigate(ROUTES.PRODUCTS.LIST);
  };

  /* Fetch Tags specific to Products */
  const [availableTags] = useState<string[]>([]);
  const fetchProductTags = useCallback(async () => {}, []);

  // Sync pending images to form state so Zod validation passes
  useEffect(() => {
    const currentImages = methods.getValues('productImages') || [];
    // Keep images that are not local blobs (e.g. existing images from backend)
    const existingImages = currentImages.filter(img => !img.url.startsWith('blob:'));
    
    const syncImages = [...existingImages];

    if (pendingPrimaryImage) {
      syncImages.push({
        id: 'temp-primary',
        url: pendingPrimaryImage.previewUrl,
        isPrimary: true,
        file: pendingPrimaryImage.file
      } as any);
    }

    pendingAdditionalImages.forEach((img, index) => {
      syncImages.push({
        id: `temp-addl-${index}`,
        url: img.previewUrl,
        isPrimary: false,
        file: img.file
      } as any);
    });

    // Only update if shape changed to prevent loops
    const currentUrls = currentImages.map(i => i.url).join(',');
    const syncUrls = syncImages.map(i => i.url).join(',');
    
    if (currentUrls !== syncUrls) {
      handleProductImagesChange(syncImages);
    }
  }, [pendingPrimaryImage, pendingAdditionalImages, handleProductImagesChange, methods]);

  const handleTagCreated = () => {
    // Refetch tags after a new one is created
    fetchProductTags();
  };

  // RHF Valid Submit Handler
  const onSubmit = async (data: ProductSchemaData) => {
    // 1. Manual Image Validation (since it uses pending state, not just form state)
    // We check against the form data and pending images
    // If validateImageRequirements is not available, we implement a simple check or assume useProductValidation has it.
    // Based on previous code, `validateWithImageCheck` did this. We'll reconstruct the check.

    // Check if we have a primary image
    const hasPrimary = !!data.productImages?.find(img => img.isPrimary) || !!pendingPrimaryImage;

    if (!hasPrimary) {
      notifyError("Product must have a primary image");
      scrollToError('productImages');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare and upload images using hook
      const { productImages, variantUploadResults } = await prepareImageUpload({
        formData: data, // Use the validated data
        pendingPrimaryImage,
        pendingAdditionalImages,
        uploadPendingImages,
        uploadVariantImages,
      });

      // Create product with all image URLs
      const productData = {
        ...data,
        productImages,
        // Update variants with uploaded image URLs
        productVariants: data.productVariants?.map(v => {
          if (v.id && variantUploadResults[v.id]) {
            return {
              ...v,
              image: variantUploadResults[v.id].url,
              // Backend doesn't expect file objects
              imageFile: undefined,
              previewUrl: undefined
            };
          }
          return v;
        })
      };

      const response = await productService.createProduct(productData);
      
      console.log('Product creation response:', response);

      setIsSaveSuccess(true);

      notifySuccess('Product created successfully!', {
        description: 'The product has been added to your catalog.',
      });

      // Navigate to product detail page directly
      const newProductId = response?.data?.id;

      if (newProductId) {
        navigate(ROUTES.PRODUCTS.DETAIL(newProductId));
      } else {
        // Fallback to list if ID not found
        console.warn('Could not determine new product ID, redirecting to list');
        navigate(ROUTES.PRODUCTS.LIST);
      }
    } catch (error: any) {
      const status = error?.response?.status;
      let errorMessage = error?.response?.data?.message || error?.message || 'Failed to create product';

      if (status === 409) {
        errorMessage = 'Product with this URL/Slug already exists. Please choose a unique one.';
      }

      notifyError('Error creating product', {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInvalid = (errors: any) => {
    let firstErrorKey = Object.keys(errors)[0];
    let firstErrorMessage = errors[firstErrorKey]?.message;

    // Handle nested array errors (like variants)
    if (firstErrorKey === 'productVariants' && Array.isArray(errors.productVariants)) {
      const variantErrorIndex = errors.productVariants.findIndex((v: any) => v != null);
      if (variantErrorIndex !== -1) {
        const variantError = errors.productVariants[variantErrorIndex];
        const fieldErrorKey = Object.keys(variantError)[0];
        firstErrorMessage = variantError[fieldErrorKey]?.message;
        
        // Translate to the ID format expected by scrollToError
        const variantId = methods.getValues().productVariants?.[variantErrorIndex]?.id;
        if (variantId) {
          firstErrorKey = `variant-${variantId}-${fieldErrorKey}`;
        }
      }
    }

    if (!firstErrorMessage) {
      firstErrorMessage = 'Please check the highlighted fields.';
    }
    
    notifyError("Please fix form errors", {
      description: firstErrorMessage
    });
    scrollToError(firstErrorKey);
  };

  const handleCancel = () => {
    navigate(ROUTES.PRODUCTS.LIST);
  };

  const handleDiscardChanges = () => {
    notifyInfo('Changes discarded');
  };

  return (
    <UnsavedChangesGuard
      hasChanges={isDirty && !isSubmitting && !isSaveSuccess}
      onDiscard={handleDiscardChanges}
    >
      <div className="flex-1 w-full">
        <PageHeader
          title="Add New Product"
          subtitle="Create and manage product details"
          breadcrumbs={[
            { label: 'Products', onClick: onBack },
            { label: 'Add New', active: true }
          ]}
          backIcon="arrow"
          onBack={onBack}
          actions={
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="rounded-xl h-11 px-6"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit(onSubmit, onInvalid)}
                disabled={isSubmitting}
                className="rounded-xl bg-[#0e042f] hover:bg-[#0e042f]/90 text-white h-11 px-6 gap-2 shadow-sm"
              >
                <Plus className="size-4.5" />
                {isSubmitting ? 'Creating...' : 'Add Product'}
              </Button>
            </>
          }
        />

        <div className="px-6 lg:px-8 pb-8">
          <FormProvider {...methods}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT COLUMN - Primary Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* 1. Basic Product Details */}
                <BasicDetailsSection />

                {/* 2. Media (Deferred Upload) */}
                <DeferredMediaSection
                  pendingPrimaryImage={pendingPrimaryImage}
                  pendingAdditionalImages={pendingAdditionalImages}
                  onPendingPrimaryChange={setPendingPrimaryImage}
                  onPendingAdditionalChange={setPendingAdditionalImages}
                  existingPrimaryImage={formData.productImages?.find(img => img.isPrimary && !img.url.startsWith('blob:'))?.url}
                  existingPrimaryThumbnail={formData.productImages?.find(img => img.isPrimary && !img.url.startsWith('blob:'))?.thumbnailUrl}
                  existingAdditionalImages={formData.productImages?.filter(img => !img.isPrimary && !img.url.startsWith('blob:')).map(img => img.url) || []}
                  existingAdditionalThumbnails={formData.productImages?.filter(img => !img.isPrimary && !img.url.startsWith('blob:')).map(img => img.thumbnailUrl || '') || []}
                  onExistingPrimaryChange={(url) => {
                    if (!url && formData.productImages) {
                      const newImages = formData.productImages.filter(img => {
                        if (img.isPrimary && !img.url.startsWith('blob:')) return false;
                        return true;
                      });
                      handleProductImagesChange(newImages);
                    }
                  }}
                  onExistingAdditionalChange={(urls) => {
                    if (!formData.productImages) return;
                    const newImages = formData.productImages.filter(img => {
                      if (img.isPrimary) return true;
                      if (img.url.startsWith('blob:')) return true;
                      return urls.includes(img.url);
                    });
                    handleProductImagesChange(newImages);
                  }}
                  error={imageError || undefined}
                />

                {/* 3. Pricing & Inventory */}
                <PricingInventorySection />

                {/* 3.5. Product Variants */}
                <ProductVariantsSection
                  isEditMode={false}
                  expandedVariantId={expandedVariantId}
                  onToggleExpand={setExpandedVariantId}
                />

                {/* 4. FAQ */}
                <FaqSection
                  expandedFaqId={expandedFaqId}
                  setExpandedFaqId={setExpandedFaqId}
                />

                {/* 5. SEO & URL */}
                <SeoSection readOnlyUrl={false} />
              </div>

              {/* RIGHT COLUMN - Secondary Content */}
              <div className="space-y-6">
                {/* 1. Availability & Flags */}
                <AvailabilitySection />

                {/* 2. Associations */}
                <AssociationsSection />

                {/* 3. Categorization */}
                <CategorizationSection />

                {/* 4. Notes & Tags */}
                <NotesTags
                  tags={formData.tags || []}
                  availableTags={availableTags}
                  onTagsChange={(val) => setValue('tags', val, { shouldDirty: true, shouldValidate: true })}
                  adminComment={formData.adminComment}
                  onAdminCommentChange={(val) => setValue('adminComment', val, { shouldDirty: true })}
                  showCustomerNote={false}
                  tagType="product"
                  onTagCreated={handleTagCreated}
                />
              </div>
            </div>
          </FormProvider>
        </div>
      </div>
    </UnsavedChangesGuard>
  );
}
