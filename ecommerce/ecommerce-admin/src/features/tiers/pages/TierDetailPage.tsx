import { useNavigate, useParams } from 'react-router-dom';
import { Save, Layers, ChevronRight, Plus, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FormProvider } from 'react-hook-form';
import { notifySuccess, notifyError } from '@/utils';
import { PageHeader } from '@/components/layouts/headers';
import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTierForm } from '../hooks/useTierForm';
import { useTier, useUpdateTier, useCreateTier, useBulkDeleteTiers } from '../hooks/useTiers';
import { ROUTES } from '@/lib/constants';
import { Package } from 'lucide-react';
import { TierTree } from '../components/TierTree';
import { TierBasicInfoSection, TierStatusSection } from '../components/form-sections';
import { useTierHierarchy } from '../hooks/useTiers';
import type { Tier } from '../types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { UnsavedChangesGuard } from '@/components/guards/UnsavedChangesGuard';

// Helper to find a tier node in the hierarchy tree
const findTierNode = (nodes: Tier[], targetId: string): Tier | undefined => {
    for (const node of nodes) {
        if (node.id === targetId) return node;
        if (node.children) {
            const found = findTierNode(node.children, targetId);
            if (found) return found;
        }
    }
    return undefined;
};

/**
 * Get the entire root (Tier 1) branch that contains the target tier
 * Shows all tiers within that Tier 1 parent, not just the path to selected tier
 */
const getRootTierBranch = (allTiers: Tier[], targetId: string): Tier[] => {
    // Helper to check if a tier or its descendants contain the target
    const containsTier = (tier: Tier, target: string): boolean => {
        if (tier.id === target) return true;
        if (tier.children) {
            return tier.children.some(child => containsTier(child, target));
        }
        return false;
    };

    // Find the root tier (level 1) that contains the target
    const rootTier = allTiers.find(tier => containsTier(tier, targetId));

    // Return only that root tier (with all its descendants)
    return rootTier ? [rootTier] : allTiers;
};

export default function TierDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();

    // State for selected tier and mode
    const selectedTierId = id || '';
    const [mode, setMode] = useState<'edit' | 'add-sub-tier'>('edit');
    const [targetParent, setTargetParent] = useState<Tier | null>(null);

    // Mutations
    const createTierMutation = useCreateTier();
    const updateTierMutation = useUpdateTier();
    const bulkDeleteTierMutation = useBulkDeleteTiers();

    // Delete dialog state
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Load selected tier data
    const { data: selectedTierData, isLoading: isSelectedLoading, error: selectedError } = useTier(selectedTierId || '');
    const { data: tierHierarchy = [] } = useTierHierarchy();

    // Single form hook that handles both edit and create modes
    const formOptions = useMemo(() => ({
        mode: mode === 'edit' ? 'edit' as const : 'create' as const,
        initialData: mode === 'edit' ? selectedTierData : undefined,
        selectedParent: mode === 'add-sub-tier' ? (targetParent || selectedTierData) : undefined,
    }), [mode, selectedTierData, targetParent]);

    const methods = useTierForm(formOptions);

    const {
        handleSubmit,
        formState: { isDirty },
        getValues,
        resetForSubTier,
    } = methods;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [expandedTiers, setExpandedTiers] = useState<Set<string>>(new Set());

    const handleDiscardChanges = () => {
        navigate(ROUTES.TIERS?.LIST || '/tiers');
    };

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
        setMode('edit');
    };

    const handleAddSubTier = (tier?: Tier) => {
        const parent = tier || selectedTierData;
        if (parent) {
            setTargetParent(parent);
            resetForSubTier(parent);
            setMode('add-sub-tier');
        }
    };

    const handleCancelSubTier = () => {
        setMode('edit');
        setTargetParent(null);
    };

    const handleSaveSubTier = async (data: any) => {
        setIsSubmitting(true);

        try {
            await createTierMutation.mutateAsync(data);
            notifySuccess('Sub-tier created successfully!');
            setMode('edit');
        } catch (error: any) {
            notifyError(error?.message || 'Failed to create sub-tier');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSave = async (data: any) => {
        if (!selectedTierId) return;

        setIsSubmitting(true);

        try {
            await updateTierMutation.mutateAsync({ id: selectedTierId, data });
            notifySuccess('Tier updated successfully!');
            setIsSuccess(true);

            setTimeout(() => {
                navigate(ROUTES.TIERS?.LIST || '/tiers');
            }, 500);

        } catch (error: any) {
            notifyError(error?.message || 'Failed to update tier');
        } finally {
            setIsSubmitting(false);
        }
    };

    const onInvalid = () => {
        notifyError('Please fix form errors');
    };

    if (isSelectedLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-slate-600">Loading tier...</p>
            </div>
        );
    }

    if (selectedError || !selectedTierData) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-red-600">Failed to load tier</p>
            </div>
        );
    }

    const handleBack = () => {
        navigate(ROUTES.TIERS?.LIST || '/tiers');
    };

    // Get children from hierarchy if not available in single tier data
    const hierarchyNode = selectedTierId ? findTierNode(tierHierarchy, selectedTierId) : undefined;
    const displayChildren = hierarchyNode?.children || selectedTierData?.children || [];

    // Get the entire root (Tier 1) branch that contains the selected tier
    const tierBranch = selectedTierId ? getRootTierBranch(tierHierarchy, selectedTierId) : tierHierarchy;

    return (
        <UnsavedChangesGuard hasChanges={isDirty && !isSubmitting && !isSuccess} onDiscard={handleDiscardChanges}>

            <div className="flex-1 w-full">
                <PageHeader
                    title={mode === 'add-sub-tier' ? 'New Sub-Tier' : (getValues('name') || 'Tier Details')}
                    subtitle={mode === 'add-sub-tier' ? `Create a new sub-tier under "${targetParent?.name || selectedTierData?.name}"` : (getValues('code') ? `Manage details for "${getValues('code')}"` : 'Manage tier information')}
                    breadcrumbs={[
                        { label: 'Tiers', onClick: handleBack },
                        { label: mode === 'add-sub-tier' ? 'New Sub-Tier' : (getValues('name') || 'Details'), active: true }
                    ]}
                    backIcon="arrow"
                    onBack={handleBack}
                    actions={
                        <>
                            {(mode !== 'edit' || isDirty) && (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleDiscardChanges}
                                        className="rounded-xl h-[44px] px-6"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleSubmit(mode === 'edit' ? handleSave : handleSaveSubTier, onInvalid)}
                                        disabled={isSubmitting}
                                        className="rounded-xl bg-[var(--sidebar-bg)] hover:bg-[var(--sidebar-hover)] text-[var(--text-white)]/90 h-[44px] px-6 gap-2 shadow-sm"
                                    >
                                        <Save className="size-4 mr-2" />
                                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </>
                            )}

                            {/* More Options Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon" className="rounded-xl h-[44px] w-[44px]">
                                        <MoreVertical className="size-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() => setShowDeleteDialog(true)}
                                        className="text-red-600 focus:text-red-600 focus:bg-red-50 text-sm"
                                    >
                                        <Trash2 className="size-4 mr-2" />
                                        Delete Tier
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    }
                />

                {/* Main Content */}
                <div className="px-6 lg:px-8 pb-8">
                    <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                        {/* Column - Tree View & Audit Logs (4 cols) */}
                        <div className="lg:col-span-4 space-y-6">
                            <Card className="h-full rounded-[20px] border-slate-200 shadow-sm flex flex-col gap-0 py-0 min-h-[500px]">
                                <CardHeader className="px-4 pt-4 pb-2">
                                    <h3 className="text-lg font-semibold text-slate-900 px-2">Tier Hierarchy</h3>
                                    <p className="text-xs text-slate-500 px-2">Click to expand and view sub-tiers</p>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    <TierTree
                                        tiers={tierBranch}
                                        selectedTier={selectedTierData}
                                        expandedTiers={expandedTiers}
                                        onSelectTier={handleSelectTier}
                                        onToggleExpand={handleToggleExpand}
                                        onAddSubTier={(tier: Tier) => {
                                            if (tier.level < 4) {
                                                handleAddSubTier(tier);
                                            }
                                        }}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Column - Details (8 cols) */}
                        <div className="lg:col-span-8">
                            <FormProvider {...methods}>
                                <Card className="rounded-[20px] border-slate-200 shadow-sm bg-white overflow-hidden">
                                    <CardHeader className="px-4 pt-4 pb-0">
                                        <div className="px-2 flex items-center justify-between">
                                            <div>
                                                <h2 className="text-xl font-semibold text-slate-900">
                                                    {mode === 'edit' ? 'Tier Details' : 'New Sub-Tier'}
                                                </h2>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {mode === 'edit' ? 'Configure tier information and settings' : `Creating a new sub-tier under "${targetParent?.name || selectedTierData?.name}"`}
                                                </p>
                                            </div>
                                            {mode === 'edit' && selectedTierData && selectedTierData.level < 4 && (
                                                <Button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleAddSubTier();
                                                    }}
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-2 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
                                                >
                                                    <Plus className="size-4" />
                                                    Add Sub Tier
                                                </Button>
                                            )}
                                            {mode === 'add-sub-tier' && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={handleCancelSubTier}
                                                        variant="outline"
                                                        size="sm"
                                                        className="rounded-xl"
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        onClick={handleSubmit(handleSaveSubTier, onInvalid)}
                                                        disabled={isSubmitting}
                                                        size="sm"
                                                        className="rounded-xl bg-[var(--sidebar-bg)] hover:bg-[var(--sidebar-hover)] text-white gap-1"
                                                    >
                                                        <Plus className="size-3" />
                                                        {isSubmitting ? 'Creating...' : 'Create Sub Tier'}
                                                    </Button>
                                                </div>
                                            )}
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

                                            {/* Usage */}
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                    USAGE
                                                </Label>
                                                <div className="h-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-slate-900 font-medium overflow-hidden">
                                                        <Package className="size-4 text-slate-400 shrink-0" />
                                                        <span className="truncate whitespace-nowrap">
                                                            {mode === 'add-sub-tier' ? 0 : (selectedTierData?.usageCount || 0)} products using this tier
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <TierStatusSection />
                                    </CardContent>
                                </Card>

                                {/* Sub-Tiers List */}
                                <div className="mt-6 space-y-4">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        SUB-TIERS ({displayChildren.length})
                                    </Label>

                                    {displayChildren.length > 0 ? (
                                        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
                                            {displayChildren.map((child: Tier) => (
                                                <div key={child.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                                                            <Layers className="size-4 text-slate-500" />
                                                        </div>
                                                        <span className="font-medium text-slate-900">{child.name}</span>
                                                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5">T{child.level}</Badge>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-xs text-slate-500">{child.usageCount || 0} items</span>
                                                        <ChevronRight className="size-4 text-slate-400" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                            <p className="text-sm text-slate-500">No sub-tiers found.</p>
                                        </div>
                                    )}
                                </div>
                            </FormProvider>
                        </div>
                    </div>
                </div >
            </div>

            <ConfirmationDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={async () => {
                    if (!selectedTierId || !selectedTierData) return;

                    try {
                        const getAllIdsToDelete = (root: Tier): string[] => {
                            let ids = [root.id];
                            if (root.children) {
                                root.children.forEach(child => {
                                    ids = [...ids, ...getAllIdsToDelete(child)];
                                });
                            }
                            return ids;
                        };

                        const nodeToDelete = findTierNode(tierHierarchy, selectedTierId);
                        const idsToDeleteUnsorted = nodeToDelete ? getAllIdsToDelete(nodeToDelete) : [selectedTierId];

                        await bulkDeleteTierMutation.mutateAsync([selectedTierId]);

                        setShowDeleteDialog(false);

                        let redirectPath: string;
                        if (selectedTierData.level === 1) {
                            redirectPath = ROUTES.TIERS?.LIST || '/tiers';
                        } else {
                            const findRootParent = (tierId: string, nodes: Tier[]): string | null => {
                                for (const node of nodes) {
                                    if (node.id === tierId && node.level === 1) return node.id;
                                    if (node.id === tierId && node.parentId) return findRootParent(node.parentId, tierHierarchy);
                                    if (node.children) {
                                        const found = findRootParent(tierId, node.children);
                                        if (found) return found;
                                    }
                                }
                                return null;
                            };

                            const parentId = selectedTierData.parentId;
                            if (parentId) {
                                const rootParentId = findRootParent(parentId, tierHierarchy);
                                redirectPath = rootParentId ? `/tiers/${rootParentId}` : (ROUTES.TIERS?.LIST || '/tiers');
                            } else {
                                redirectPath = ROUTES.TIERS?.LIST || '/tiers';
                            }
                        }

                        navigate(redirectPath);
                        notifySuccess(`Deleted ${idsToDeleteUnsorted.length} tier(s) successfully!`);

                        setTimeout(() => {
                            queryClient.invalidateQueries({ queryKey: ['tiers'] });
                        }, 100);

                    } catch (error: any) {
                        console.error('Tier delete error:', error);
                        const message = error?.response?.data?.message || error?.response?.data?.error?.message || error?.message || 'Failed to delete tier';
                        notifyError(message);
                        setShowDeleteDialog(false);
                    }
                }}
                title={`Delete ${(() => {
                    const node = findTierNode(tierHierarchy, selectedTierId);
                    const count = node ? (function count(n: Tier): number { return 1 + (n.children?.reduce((acc, c) => acc + count(c), 0) || 0); })(node) : 1;
                    return count > 1 ? `Delete ${count} Tiers` : 'Delete Tier';
                })()}`}
                description={`Are you sure you want to delete "${getValues('name')}"? ${(() => {
                    const node = findTierNode(tierHierarchy, selectedTierId);
                    const subCount = node ? (function count(n: Tier): number { return (n.children?.reduce((acc, c) => acc + 1 + (c.children?.reduce((a, x) => a + count(x), 0) || 0), 0) || 0); })(node) : 0;
                    return subCount > 0 ? `This will also delete ${subCount} sub-tiers.` : '';
                })()} This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                isLoading={bulkDeleteTierMutation.isPending}
            />
        </UnsavedChangesGuard>
    );
}
