import { useParams, useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { notifyError, notifySuccess } from '@/utils';
import { ROUTES } from '@/lib/constants';
import { DetailPageSkeleton } from '@/components/ui/loading-skeletons';
import { FormProvider } from 'react-hook-form';

import { useProductForm, useDeferredUpload, useProductValidation, useProductImageUpload } from '@/features/products/hooks';
import { useProduct, useUpdateProduct, useDeleteProduct } from '@/features/products/hooks/useProducts';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { UnsavedChangesGuard } from '@/components/guards/UnsavedChangesGuard';
import { useDialog } from '@/hooks';
import { openStorefrontPreview } from '@/utils';

import { PageHeader } from '@/components/layouts/headers';
import { Button } from '@/components/ui/button';
import { Save, ExternalLink, MoreVertical, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { ProductMetricsSection } from '../components/form-sections/ProductMetricsSection';
import { NotesTags } from '@/features/notes/components/NotesTags';
import type { ProductSchemaData } from '../validation/productSchema';
export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const deleteDialog = useDialog();
  const [isSaved, setIsSaved] = useState(false);

  // Load product data from API
  const { data: productData, isLoading, error } = useProduct(id || '');
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  // Initialize hook with loaded data
  const methods = useProductForm(productData);

  const {
    formState,
    watch,
    setValue,
    handleSubmit,
    // Custom helpers
    expandedVariantId,
    setExpandedVariantId,
    expandedFaqId,
    setExpandedFaqId,
    handleProductImagesChange,
  } = methods;

  const { isDirty } = formState;

  // Watch necessary fields for dependent components
  const formData = watch();

  // Product validation hook
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

  // Calculate if there are any pending uploads
  const hasPendingUploads = (pendingPrimaryImage !== null || pendingAdditionalImages.length > 0) && !isSaved;
  // Real dirty state includes RHF dirty state OR pending uploads
  const hasUnsavedChanges = (isDirty || hasPendingUploads) && !isSaved;

  const [availableTags] = useState<string[]>([]);
  const fetchProductTags = useCallback(async () => { }, []);

  const handleTagCreated = () => {
    // Refetch tags after a new one is created
    fetchProductTags();
  };

  const onSubmit = async (data: ProductSchemaData) => {
    const productId = data.id || id;
    if (!productId) return;

    // Manual Image Check
    const hasPrimary = !!data.productImages?.find(img => img.isPrimary) || !!pendingPrimaryImage;
    if (!hasPrimary) {
      notifyError("Product must have a primary image");
      scrollToError('productImages');
      return;
    }

    try {
      // Prepare and upload images using hook
      const { productImages, variantUploadResults } = await prepareImageUpload({
        formData: data, // Use validated data
        pendingPrimaryImage,
        pendingAdditionalImages,
        uploadPendingImages,
        uploadVariantImages,
        isEditMode: true,
      });

      // Step 4: Update product with all image URLs
      const productDataToUpdate = {
        ...data,
        productImages,
        // Update variants with uploaded image URLs
        productVariants: data.productVariants?.map(v => {
          // If we uploaded a new image for this variant
          if (v.id && variantUploadResults[v.id]) {
            return {
              ...v,
              image: variantUploadResults[v.id].url,
              // Backend doesn't expect file objects
              imageFile: undefined,
              previewUrl: undefined,
              // Also update thumbnail if your backend supports it on variants
              thumbnail_url: variantUploadResults[v.id].thumbnail
            };
          }
          return v;
        })
      };

      updateProductMutation.mutate({ id: productId, data: productDataToUpdate }, {
        onSuccess: () => {
          setIsSaved(true);
          notifySuccess('Product updated successfully!');
          // Small timeout to allow state to propagate before navigation
          setTimeout(() => {
            navigate(ROUTES.PRODUCTS.LIST);
          }, 0);
        },
        onError: (error: any) => {
          setIsSaved(false);
          const status = error?.response?.status;
          let errorMessage = 'Failed to update product';

          if (status === 409) {
            errorMessage = 'Product with this URL/Slug already exists. Please choose a unique one.';
          } else if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
          }

          notifyError('Error updating product', { description: errorMessage });
        }
      });
    } catch (e) {
      notifyError('Failed to prepare update');
      console.error(e);
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

  const handleHandleSave = () => {
    handleSubmit(onSubmit, onInvalid)();
  };

  const handleCancel = () => {
    navigate(ROUTES.PRODUCTS.LIST);
  };

  const handleBack = () => {
    navigate(ROUTES.PRODUCTS.LIST);
  };

  const handleDeleteClick = () => {
    deleteDialog.open();
  };

  const handleConfirmDelete = () => {
    const productId = formData?.id || id;
    if (!productId) return;

    deleteProductMutation.mutate(productId, {
      onSuccess: () => {
        deleteDialog.close();
        navigate(ROUTES.PRODUCTS.LIST);
      },
      onError: () => {
        // Dialog stays open on error, handle error state if needed
        notifyError('Failed to delete product');
      }
    });
  };

  // Preview button - opens product page on the website
  const handlePreview = () => {
    openStorefrontPreview('products', formData.slug);
  };

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (error || !productData) {
    return <div className="p-8 text-center text-red-500">Error loading product or product not found.</div>;
  }

  return (
    <UnsavedChangesGuard hasChanges={hasUnsavedChanges}>
      <div className="flex-1 w-full">
        <PageHeader
          title={formData.productTitle || "Product Details"}
          breadcrumbs={[
            { label: 'Products', onClick: handleBack },
            { label: formData.productTitle || 'Details', active: true }
          ]}
          backIcon="arrow"
          onBack={handleBack}
          actions={
            <div className="flex items-center gap-3">
              {hasUnsavedChanges ? (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleCancel}
                    className="rounded-xl"
                    disabled={updateProductMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleHandleSave}
                    disabled={updateProductMutation.isPending}
                    className="rounded-xl bg-[#0e042f] hover:bg-[#0e042f]/90 text-white"
                  >
                    <Save className="size-4 mr-2" />
                    {updateProductMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <Button
                  size="lg"
                  onClick={handlePreview}
                  className="rounded-xl bg-[#0e042f] hover:bg-[#0e042f]/90 text-white"
                >
                  <ExternalLink className="size-4 mr-2" />
                  Preview
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-xl h-10 w-10">
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleDeleteClick}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 text-sm"
                  >
                    <Trash2 className="size-4 mr-2" />
                    Delete Product
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          }
        />

        <div className="px-6 lg:px-8 pb-8">
          <FormProvider {...methods} key={productData?.id || 'product-form'}>
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
                  existingPrimaryImage={formData.productImages?.find(img => img.isPrimary)?.url}
                  existingPrimaryThumbnail={formData.productImages?.find(img => img.isPrimary)?.thumbnailUrl}
                  existingAdditionalImages={formData.productImages?.filter(img => !img.isPrimary).map(img => img.url) || []}
                  existingAdditionalThumbnails={formData.productImages?.filter(img => !img.isPrimary).map(img => img.thumbnailUrl || '') || []}
                  onExistingPrimaryChange={(url) => {
                    if (!url && formData.productImages) {
                      // Remove primary
                      handleProductImagesChange(formData.productImages.filter(img => !img.isPrimary));
                    }
                  }}
                  onExistingAdditionalChange={(urls) => {
                    if (!formData.productImages) return;
                    const primary = formData.productImages.find(img => img.isPrimary);
                    // Filter existing images to find matches for the kept URLs
                    const keptAdditional = formData.productImages.filter(img =>
                      !img.isPrimary && urls.includes(img.url)
                    );
                    handleProductImagesChange(primary ? [primary, ...keptAdditional] : keptAdditional);
                  }}
                  error={imageError || undefined}
                />

                {/* 3. Pricing & Inventory */}
                <PricingInventorySection productId={id} />

                {/* 3.5. Product Variants */}
                <ProductVariantsSection
                  isEditMode={true}
                  expandedVariantId={expandedVariantId}
                  onToggleExpand={setExpandedVariantId}
                />

                {/* 4. FAQ */}
                <FaqSection
                  expandedFaqId={expandedFaqId}
                  setExpandedFaqId={setExpandedFaqId}
                />

                {/* 5. SEO & URL */}
                <SeoSection readOnlyUrl={true} />
              </div>

              {/* RIGHT COLUMN - Secondary Content */}
              <div className="space-y-6">
                {/* Edit Mode Only: Metrics */}
                <ProductMetricsSection productMetadata={{
                  createdAt: productData.createdAt || new Date().toISOString(),
                  lastModified: productData.updatedAt || new Date().toISOString(),
                  totalViews: 0,
                  totalSales: 0,
                  createdBy: 'Admin'
                }} />

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

        <ConfirmationDialog
          isOpen={deleteDialog.isOpen}
          onClose={deleteDialog.close}
          onConfirm={handleConfirmDelete}
          title="Delete Product"
          description="Are you sure you want to delete this product? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
          isLoading={deleteProductMutation.isPending}
        />
      </div>
    </UnsavedChangesGuard>
  );
}