import { useState, useCallback } from 'react';
import type { ValidationErrors, ValidationCallbacks, ImageValidationOptions } from '../types';

/**
 * Custom hook for product validation logic
 * Centralizes validation, error scrolling, and focus management
 * 
 * @example
 * ```tsx
 * const { validateWithImageCheck, scrollToError } = useProductValidation({
 *   setExpandedVariantId,
 *   setExpandedFaqId
 * });
 * 
 * const errors = validateWithImageCheck(validate, {
 *   pendingPrimaryImage,
 *   existingImages: formData.productImages,
 *   isEditMode: true
 * });
 * 
 * if (errors) {
 *   notifyError(errors[Object.keys(errors)[0]]);
 *   scrollToError(Object.keys(errors)[0]);
 * }
 * ```
 */
export function useProductValidation(callbacks?: ValidationCallbacks) {
  const [imageError, setImageError] = useState<string | null>(null);

  /**
   * Map of form field keys to their corresponding DOM element IDs
   */
  const fieldIdMap: Record<string, string> = {
    productImages: 'section-media',
    tier1Category: 'section-categorization',
    productTitle: 'productTitle',
    sellingPrice: 'sellingPrice',
    costPrice: 'costPrice',
    inventoryQuantity: 'inventoryQuantity',
    sku: 'sku',
  };

  /**
   * Map of variant fields to their input ID prefixes
   */
  const variantFieldPrefixMap: Record<string, string> = {
    optionName: 'option-name',
    optionValue: 'option-value',
    sku: 'sku',
    sellingPrice: 'selling-price',
    costPrice: 'cost-price',
    inventoryQuantity: 'inventory',
  };

  /**
   * Scroll to and focus on the error field
   * Handles regular fields, variant fields, and FAQ fields with accordion expansion
   */
  const scrollToError = useCallback(
    (errorKey: string) => {
      if (!errorKey) return;

      // Handle variant field errors (format: variant-{id}-{field})
      const variantMatch = errorKey.match(/^variant-([^-]+)-(.+)$/);
      if (variantMatch) {
        const [, variantId, field] = variantMatch;
        
        // Expand the variant accordion
        callbacks?.setExpandedVariantId?.(variantId);

        // Wait for accordion to expand, then scroll
        setTimeout(() => {
          const elementPrefix = variantFieldPrefixMap[field] || field;
          const elementId = `${elementPrefix}-${variantId}`;
          const element = document.getElementById(elementId);

          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
          }
        }, 300);
        return;
      }

      // Handle FAQ field errors (format: faq-{id}-{field})
      const faqMatch = errorKey.match(/^faq-([^-]+)-(.+)$/);
      if (faqMatch) {
        const [, faqId, field] = faqMatch;
        
        // Expand the FAQ accordion
        callbacks?.setExpandedFaqId?.(faqId);

        // Wait for accordion to expand, then scroll
        setTimeout(() => {
          const elementId = `faq-${faqId}-${field}`;
          const element = document.getElementById(elementId);

          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
          }
        }, 300);
        return;
      }

      // Handle regular field errors
      const targetId = fieldIdMap[errorKey] || errorKey;
      const element = document.getElementById(targetId);

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Only focus if it's an input element (not a section)
        if (targetId !== 'section-media' && targetId !== 'section-categorization') {
          element.focus();
        }
      }
    },
    [callbacks, fieldIdMap, variantFieldPrefixMap]
  );

  /**
   * Validate form with image requirement check
   * Returns validation errors if any, or null if valid
   */
  const validateWithImageCheck = useCallback(
    (
      validate: () => ValidationErrors,
      options: ImageValidationOptions
    ): ValidationErrors | null => {
      const { pendingPrimaryImage, existingImages = [], isEditMode = false } = options;

      // Run standard validation
      const validationErrors = validate();

      // Check image requirements
      const hasExistingImage = existingImages && existingImages.length > 0;
      const hasPendingImage = pendingPrimaryImage !== null;

      if (isEditMode) {
        // Edit mode: valid if we have existing OR pending image
        if (!hasExistingImage && !hasPendingImage) {
          validationErrors.productImages = 'Primary product image is required';
          setImageError('Primary product image is required');
        } else {
          setImageError(null);
        }
      } else {
        // Create mode: only check pending image
        if (!hasPendingImage) {
          validationErrors.productImages = 'Primary product image is required';
          setImageError('Primary product image is required');
        } else {
          setImageError(null);
        }
      }

      // Return null if no errors, otherwise return errors
      return Object.keys(validationErrors).length > 0 ? validationErrors : null;
    },
    []
  );

  /**
   * Clear image validation error
   */
  const clearImageError = useCallback(() => {
    setImageError(null);
  }, []);

  return {
    imageError,
    clearImageError,
    scrollToError,
    validateWithImageCheck,
  };
}
