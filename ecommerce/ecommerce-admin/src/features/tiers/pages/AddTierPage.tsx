import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layouts/headers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FormProvider } from 'react-hook-form';
import { notifySuccess, notifyError } from '@/utils';
import { useState, useMemo } from 'react';
import { UnsavedChangesGuard } from '@/components/guards/UnsavedChangesGuard';

import { useTierForm } from '../hooks/useTierForm';
import { useCreateTier, useTier, useTierHierarchy } from '../hooks/useTiers';
import { TierTree } from '../components/TierTree';
import { TierBasicInfoSection, TierStatusSection } from '../components/form-sections';
import type { Tier } from '../types';
import { ROUTES } from '@/lib/constants';

export default function AddTierPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const parentId = searchParams.get('parentId');

    // Load parent tier if creating a sub-tier
    const { data: parentTier } = useTier(parentId || '');

    const methods = useTierForm({
        mode: 'create',
        selectedParent: parentTier,
    });

    const {
        handleSubmit,
        formState: { isDirty },
        getValues,
    } = methods;

    const createTierMutation = useCreateTier();
    const { data: tierHierarchy = [] } = useTierHierarchy();
    const [expandedTiers, setExpandedTiers] = useState<Set<string>>(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter hierarchy to show only relevant tiers
    const relevantTiers = useMemo(() => {
        if (!parentId || !parentTier) {
            return [];
        }
        return tierHierarchy.filter(tier => tier.id === parentId);
    }, [tierHierarchy, parentId, parentTier]);

    // Tree handlers
    const handleToggleExpand = (tierId: string) => {
        const newExpanded = new Set(expandedTiers);
        if (newExpanded.has(tierId)) {
            newExpanded.delete(tierId);
        } else {
            newExpanded.add(tierId);
        }
        setExpandedTiers(newExpanded);
    };

    const handleSelectTier = (tier: Tier) => {
        navigate(ROUTES.TIERS?.DETAIL(tier.id) || `/tiers/${tier.id}`);
    };

    const handleAddSubTier = (tier: Tier) => {
        if (tier.level < 4) {
            navigate(`${ROUTES.TIERS?.CREATE || '/tiers/new'}?parentId=${tier.id}`);
        }
    };

    const handleSave = async (data: any) => {
        setIsSubmitting(true);

        try {
            const newTier = await createTierMutation.mutateAsync(data);
            notifySuccess('Tier created successfully!');
            navigate(ROUTES.TIERS?.DETAIL(newTier.id) || `/tiers/${newTier.id}`);
        } catch (error: any) {
            notifyError(error?.message || 'Failed to create tier');
            setIsSubmitting(false);
        }
    };

    const onInvalid = () => {
        notifyError('Please fix form errors');
    };

    const handleCancel = () => {
        navigate(ROUTES.TIERS?.LIST || '/tiers');
    };

    const handleBack = () => {
        navigate(ROUTES.TIERS?.LIST || '/tiers');
    };

    return (
        <UnsavedChangesGuard hasChanges={isDirty && !isSubmitting} onDiscard={handleCancel}>
            <div className="flex-1 w-full">
                <PageHeader
                    title={parentTier ? `Add Sub-Tier to ${parentTier.name}` : 'Add Tier'}
                    subtitle="Create a new tier in the hierarchy"
                    breadcrumbs={[
                        { label: 'Tiers', onClick: handleBack },
                        { label: parentTier ? `Sub-tier of ${parentTier.name}` : 'Add New', active: true }
                    ]}
                    backIcon="arrow"
                    onBack={handleBack}
                    actions={
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                className="rounded-xl h-[44px] px-6"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSubmit(handleSave, onInvalid)}
                                disabled={isSubmitting}
                                className="rounded-xl bg-[var(--sidebar-bg)] hover:bg-[var(--sidebar-hover)] text-[var(--text-white)]/90 h-[44px] px-6 gap-2 shadow-sm"
                            >
                                <Plus className="size-[18px]" />
                                {isSubmitting ? 'Adding...' : 'Add Tier'}
                            </Button>
                        </>
                    }
                />

                {/* Main Content */}
                <div className="px-6 lg:px-8 pb-8">
                    <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Left Column - Tree View (4 cols) */}
                        <div className="lg:col-span-4 self-stretch">
                            <Card className="h-full rounded-[20px] border-slate-200 shadow-sm flex flex-col gap-0 py-0">
                                <CardHeader className="px-4 pt-4 pb-2">
                                    <h3 className="text-lg font-semibold text-slate-900 px-2">Tier Hierarchy</h3>
                                    <p className="text-xs text-slate-500 px-2">
                                        {parentTier ? `Your new tier will be added under "${parentTier.name}"` : 'Your new tier will be added at the root level'}
                                    </p>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                                    <TierTree
                                        tiers={relevantTiers}
                                        selectedTier={null}
                                        expandedTiers={expandedTiers}
                                        onSelectTier={handleSelectTier}
                                        onToggleExpand={handleToggleExpand}
                                        onAddSubTier={handleAddSubTier}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Details (8 cols) */}
                        <div className="lg:col-span-8">
                            <FormProvider {...methods}>
                                <Card className="rounded-[20px] border-slate-200 shadow-sm bg-white overflow-hidden">
                                    <CardHeader className="px-4 pt-4 pb-0">
                                        <div className="px-2">
                                            <h2 className="text-xl font-semibold text-slate-900">
                                                Tier Details
                                            </h2>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Configure tier information and settings
                                            </p>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        <TierBasicInfoSection />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                                            {/* Tier Level */}
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                    TIER LEVEL
                                                </Label>
                                                <div className="h-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 flex items-center font-medium">
                                                    Level {getValues('level')}
                                                </div>
                                            </div>

                                            {/* Parent Tier */}
                                            {parentTier && (
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                        PARENT TIER
                                                    </Label>
                                                    <div className="h-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 flex items-center font-medium">
                                                        {parentTier.name}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <TierStatusSection />
                                    </CardContent>
                                </Card>
                            </FormProvider>
                        </div>
                    </div>
                </div >
            </div >
        </UnsavedChangesGuard>
    );
}
