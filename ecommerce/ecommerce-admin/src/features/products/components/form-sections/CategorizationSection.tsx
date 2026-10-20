import { Tag, Loader2 } from 'lucide-react';
import { FormSection } from '@/components/forms';
import { useTiers } from '@/features/tiers/hooks/useTiers';
import { useMemo } from 'react';
import { TierSelect } from '@/features/products/components/selectors';
import { getChildCategories } from '@/features/tiers/utils/categoryHelpers';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import type { ProductSchemaData } from '@/features/products/validation/productSchema';

export function CategorizationSection() {
  const { control, formState: { errors } } = useFormContext<ProductSchemaData>();

  const [tier1Category, tier2Category, tier3Category] = useWatch({
    control,
    name: ['tier1Category', 'tier2Category', 'tier3Category']
  });

  // Fetch all active tiers from API
  const { data: allTiers = [], isLoading } = useTiers({ status: 'active' });

  // Filter tiers by level and parent using helper
  const tier1Categories = useMemo(() =>
    getChildCategories(allTiers, null, 1),
    [allTiers]
  );

  const tier2Categories = useMemo(() =>
    getChildCategories(allTiers, tier1Category || null, 2),
    [allTiers, tier1Category]
  );

  const tier3Categories = useMemo(() =>
    getChildCategories(allTiers, tier2Category || null, 3),
    [allTiers, tier2Category]
  );

  const tier4Categories = useMemo(() =>
    getChildCategories(allTiers, tier3Category || null, 4),
    [allTiers, tier3Category]
  );

  if (isLoading) {
    return (
      <FormSection icon={Tag} title="Product Categorization">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-slate-400" />
          <span className="ml-2 text-sm text-slate-500">Loading categories...</span>
        </div>
      </FormSection>
    );
  }

  return (
    <FormSection icon={Tag} title="Product Categorization" id="section-categorization">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Tier 1 */}
        <Controller
          control={control}
          name="tier1Category"
          render={({ field }) => (
            <TierSelect
              id="tier1Category"
              label="Tier 1 Category"
              value={field.value || ''}
              onChange={field.onChange}
              options={tier1Categories}
              required
              error={errors?.tier1Category?.message}
              isLoading={isLoading}
            />
          )}
        />

        {/* Tier 2 */}
        <Controller
          control={control}
          name="tier2Category"
          render={({ field }) => (
            <TierSelect
              id="tier2Category"
              label="Tier 2 Category"
              value={field.value || ''}
              onChange={field.onChange}
              options={tier2Categories}
              disabled={!tier1Category}
              error={errors?.tier2Category?.message}
              isLoading={isLoading}
            />
          )}
        />

        {/* Tier 3 */}
        <Controller
          control={control}
          name="tier3Category"
          render={({ field }) => (
            <TierSelect
              id="tier3Category"
              label="Tier 3 Category"
              value={field.value || ''}
              onChange={field.onChange}
              options={tier3Categories}
              disabled={!tier2Category}
              error={errors?.tier3Category?.message}
              isLoading={isLoading}
            />
          )}
        />

        {/* Tier 4 */}
        <Controller
          control={control}
          name="tier4Category"
          render={({ field }) => (
            <TierSelect
              id="tier4Category"
              label="Tier 4 Category"
              value={field.value || ''}
              onChange={field.onChange}
              options={tier4Categories}
              disabled={!tier3Category}
              error={errors?.tier4Category?.message}
              isLoading={isLoading}
            />
          )}
        />
      </div>
    </FormSection>
  );
}
