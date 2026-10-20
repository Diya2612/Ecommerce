import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDiscountForm } from '../hooks/useDiscountForm';
import { GeneralInfoSection } from './form-sections/GeneralInfoSection';
import { DiscountCodeSettingsSection } from './form-sections/DiscountCodeSettingsSection';
import { ValueTypeSection } from './form-sections/ValueTypeSection';
import { ExcludeProductsSection } from './form-sections/ExcludeProductsSection';
import { CustomerEligibilitySection } from './form-sections/CustomerEligibilitySection';
import { PerformanceSection } from './form-sections/PerformanceSection';
import { UsageLimitsSection } from './form-sections/UsageLimitsSection';
import { RestrictionsSection } from './form-sections/RestrictionsSection';
import { NotesTags } from '@/features/notes/components/NotesTags';
import { PageHeader } from '@/components/layouts/headers';

export default function DiscountForm() {
  const {
    formData,
    updateField,
    handleSave,
    handleDiscard,
    handleCancel,
    hasChanges,
    isEditMode,
  } = useDiscountForm();

  return (
    <div className="flex-1 w-full">
      <PageHeader
        title={isEditMode ? 'Edit Discount' : 'Add New Discount'}
        subtitle={isEditMode ? 'Update discount details and rules' : 'Create a new discount code or automatic discount'}
        breadcrumbs={[
          { label: 'Discounts', onClick: handleCancel },
          { label: isEditMode ? 'Edit' : 'Add New', active: true }
        ]}
        backIcon="arrow"
        onBack={handleCancel}
        titleSuffix={isEditMode && (
          <>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium",
              formData.status === "active" && "bg-emerald-50 text-emerald-700",
              formData.status === "scheduled" && "bg-amber-50 text-amber-700",
              formData.status === "expired" && "bg-red-50 text-red-700",
              formData.status === "inactive" && "bg-gray-100 text-gray-600"
            )}>
              {formData.status}
            </span>
            {formData.usageCount > 0 && (
              <span className="text-sm text-muted-foreground">
                • {formData.usageCount} redemptions
              </span>
            )}
          </>
        )}
        actions={
          (!isEditMode || hasChanges) ? (
            <div className="flex flex-col-reverse sm:flex-row gap-3 w-full lg:w-auto">
              <Button variant="outline" className="h-12 sm:h-10 w-full sm:w-32" onClick={isEditMode ? handleDiscard : handleCancel}>
                Cancel
              </Button>
              <Button
                className="h-12 sm:h-10 w-full sm:w-auto min-w-[140px] bg-[#0e032f] hover:bg-[#0e032f]/90"
                onClick={handleSave}
              >
                {isEditMode ? "Update Discount" : "Save Discount"}
              </Button>
            </div>
          ) : null
        }
      />

      <div className="px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-6">
            <GeneralInfoSection formData={formData} updateField={updateField} />
            <DiscountCodeSettingsSection formData={formData} updateField={updateField} />
            <ValueTypeSection formData={formData} updateField={updateField} />
            <ExcludeProductsSection formData={formData} updateField={updateField} />
            <CustomerEligibilitySection formData={formData} updateField={updateField} />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-6">
            <PerformanceSection />
            <UsageLimitsSection formData={formData} updateField={updateField} />
            <RestrictionsSection formData={formData} updateField={updateField} />
            <NotesTags
              adminComment={formData.adminComment}
              onAdminCommentChange={(val) => updateField('adminComment', val)}
              tags={formData.tags}
              onTagsChange={(val) => updateField('tags', val)}
              showCustomerNote={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
