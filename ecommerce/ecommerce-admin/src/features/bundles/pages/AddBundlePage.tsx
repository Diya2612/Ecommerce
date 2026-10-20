import { useNavigate } from 'react-router-dom';
import { Save, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBundleForm } from '../hooks/useBundleForm';
import { BundleBasicDetails } from '../components/BundleBasicDetails';
import { BundlePricing } from '../components/BundlePricing';
import { BundleItems } from '../components/BundleItems';
import { BundleAdvancedRules } from '../components/BundleAdvancedRules';
import { BundleConditionalActivation } from '../components/BundleConditionalActivation';
import { BundlePreview } from '../components/BundlePreview';
import { BundleSidebar } from '../components/BundleSidebar';
import { CommonConditionsSection } from '@/components/rules/CommonConditionsSection';
import { NotesTags } from '@/features/notes/components/NotesTags';
import { TypeSelector } from '@/components/forms/inputs/TypeSelector';
import { useState } from 'react';
import { logger } from '@/utils/logger';
import { PageHeader } from '@/components/layouts/headers';

// Define configuration for Bundle rules
const bundleConditionConfig: Record<string, { label: string; conditions: { value: string; label: string }[]; inputType: 'text' | 'number' | 'date' | 'select' }> = {
    'Cart Total': {
        label: 'Cart Total',
        inputType: 'number',
        conditions: [
            { value: 'is_equal_to', label: 'is equal to' },
            { value: 'greater_than', label: 'greater than' },
            { value: 'less_than', label: 'less than' },
            { value: 'is_not_equal_to', label: 'is not equal to' },
        ]
    },
    'Customer Tag': {
        label: 'Customer Tag',
        inputType: 'select',
        conditions: [
            { value: 'is_equal_to', label: 'is equal to' },
            { value: 'is_not_equal_to', label: 'is not equal to' },
        ]
    },
    'Product Quantity': {
        label: 'Product Quantity',
        inputType: 'number',
        conditions: [
            { value: 'is_equal_to', label: 'is equal to' },
            { value: 'greater_than', label: 'greater than' },
            { value: 'less_than', label: 'less than' },
        ]
    },
    'Order Count': {
        label: 'Order Count',
        inputType: 'number',
        conditions: [
            { value: 'is_equal_to', label: 'is equal to' },
            { value: 'greater_than', label: 'greater than' },
            { value: 'less_than', label: 'less than' },
        ]
    },
    'Shipping Country': {
        label: 'Shipping Country',
        inputType: 'text',
        conditions: [
            { value: 'is_equal_to', label: 'is equal to' },
            { value: 'is_not_equal_to', label: 'is not equal to' },
        ]
    },
    'Currency': {
        label: 'Currency',
        inputType: 'select',
        conditions: [
            { value: 'is_equal_to', label: 'is equal to' },
            { value: 'is_not_equal_to', label: 'is not equal to' },
        ]
    },
    'Device Type': {
        label: 'Device Type',
        inputType: 'select',
        conditions: [
            { value: 'is_equal_to', label: 'is equal to' },
            { value: 'is_not_equal_to', label: 'is not equal to' },
        ]
    },
    'Customer Since': {
        label: 'Customer Since',
        inputType: 'date',
        conditions: [
            { value: 'is', label: 'is' },
            { value: 'is_before', label: 'is before' },
            { value: 'is_after', label: 'is after' },
            { value: 'is_between', label: 'is between' },
        ]
    }
};

export default function AddBundlePage() {
    const navigate = useNavigate();
    const { formState, handlers } = useBundleForm();

    const [bundleConditions, setBundleConditions] = useState<any[]>([{ id: '1', field: '', operator: '', value: '' }]);
    const [bundleMatchType, setBundleMatchType] = useState<'all' | 'any'>('all');
    const [bundleMode, setBundleMode] = useState<'manual' | 'automated'>('manual');

    const handleSave = () => {
        logger.info('Saving bundle...', formState);
        navigate(-1);
    };

    const BundleTypeSelector = (props: { value: string; onChange: (value: string) => void }) => (
        <TypeSelector
            {...props}
            label="Bundle Type"
            manualDescription="Add products to this bundle manually"
            automatedDescription="Products are automatically added based on conditions"
        />
    );

    const ManualBundleItems = () => (
        <div className="mt-6">
            <BundleItems
                items={formState.bundleItems}
                onAddProduct={handlers.handleAddProduct}
                onRemoveProduct={handlers.handleRemoveProduct}
                onUpdateItem={handlers.handleItemChange}
            />
        </div>
    );

    return (
        <div className="flex-1 w-full">
            <PageHeader
                title="Create New Bundle"
                subtitle="Configure bundle settings, products, and pricing rules"
                breadcrumbs={[
                    { label: 'Bundles', onClick: () => navigate(-1) },
                    { label: 'Add New', active: true }
                ]}
                backIcon="arrow"
                onBack={() => navigate(-1)}
                actions={
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                        <Button onClick={handleSave} className="bg-[var(--sidebar-bg)] text-white hover:opacity-90">
                            <Save className="w-4 h-4 mr-2" />
                            Save Bundle
                        </Button>
                    </div>
                }
            />

            <div className="px-6 lg:px-8 pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="xl:col-span-2 space-y-6 min-w-0">
                        <BundleBasicDetails
                            title={formState.bundleTitle}
                            setTitle={formState.setBundleTitle}
                            description={formState.bundleDescription}
                            setDescription={formState.setBundleDescription}
                            type={formState.bundleType}
                            setType={formState.setBundleType}
                            image={formState.bundleImage}
                            setImage={formState.setBundleImage}
                        />

                        <BundlePricing
                            priceType={formState.priceType}
                            setPriceType={formState.setPriceType}
                            fixedPrice={formState.fixedPrice}
                            setFixedPrice={formState.setFixedPrice}
                            discountPercentage={formState.discountPercentage}
                            setDiscountPercentage={formState.setDiscountPercentage}
                        />

                        {/* Unified Rules/Items */}
                        <CommonConditionsSection
                            title={bundleMode === 'manual' ? "Bundle Items" : "Bundle Rules"}
                            icon={Filter}
                            collectionType={bundleMode}
                            onCollectionTypeChange={(val: string) => setBundleMode(val as 'manual' | 'automated')}
                            CollectionTypeSelector={BundleTypeSelector}
                            ProductSelector={ManualBundleItems}
                            showPreview={false} // Hide default preview as BundleItems handles it

                            conditions={bundleConditions}
                            onConditionsChange={setBundleConditions}
                            matchType={bundleMatchType}
                            onMatchTypeChange={setBundleMatchType}
                            conditionConfigs={bundleConditionConfig}
                            onApplyConditions={() => logger.info('Applied bundle rules')}
                            onClearConditions={() => setBundleConditions([{ id: Date.now().toString(), field: '', operator: '', value: '' }])}
                        />

                        <BundleAdvancedRules
                            maxItemsSelect={formState.maxItemsSelect}
                            setMaxItemsSelect={formState.setMaxItemsSelect}
                            minTotalQuantity={formState.minTotalQuantity}
                            setMinTotalQuantity={formState.setMinTotalQuantity}
                            allowDuplicates={formState.allowDuplicates}
                            setAllowDuplicates={formState.setAllowDuplicates}
                            autoAdjustPrice={formState.autoAdjustPrice}
                            setAutoAdjustPrice={formState.setAutoAdjustPrice}
                            disableOnOutOfStock={formState.disableOnOutOfStock}
                            setDisableOnOutOfStock={formState.setDisableOnOutOfStock}
                        />

                        <BundlePreview
                            title={formState.bundleTitle}
                            description={formState.bundleDescription}
                            items={formState.bundleItems}
                            calculateTotalPrice={handlers.calculateTotalPrice}
                            calculateDiscount={handlers.calculateDiscount}
                        />

                        {/* Conditional Activation - Separate Card */}
                        <BundleConditionalActivation
                            conditionalCartValue={formState.conditionalCartValue}
                            setConditionalCartValue={formState.setConditionalCartValue}
                            conditionalSegment={formState.conditionalSegment}
                            setConditionalSegment={formState.setConditionalSegment}
                            conditionalProduct={formState.conditionalProduct}
                            setConditionalProduct={formState.setConditionalProduct}
                        />
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6 min-w-0">
                        <BundleSidebar
                            status={formState.status}
                            setStatus={formState.setStatus}
                            startDate={formState.startDate}
                            setStartDate={formState.setStartDate}
                            endDate={formState.endDate}
                            setEndDate={formState.setEndDate}
                            stopOnStockOut={formState.stopOnStockOut}
                            setStopOnStockOut={formState.setStopOnStockOut}
                            allowBackorder={formState.allowBackorder}
                            setAllowBackorder={formState.setAllowBackorder}
                            purchaseLimit={formState.purchaseLimit}
                            setPurchaseLimit={formState.setPurchaseLimit}
                        />

                        <NotesTags
                            adminComment={formState.adminComment}
                            onAdminCommentChange={formState.setAdminComment}
                            tags={formState.tags}
                            onTagsChange={formState.setTags}
                            showCustomerNote={false}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
