import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronRight } from 'lucide-react';
import type { TierHierarchySectionProps } from '../../types';

/**
 * Tier Hierarchy Section
 * Handles tier level, parent selection, and breadcrumb display
 */
export function TierHierarchySection({
    level,
    parentId,
    availableParents = [],
    onLevelChange,
    onParentChange,
    errors = {},
    mode = 'create',
    selectedParent,
    breadcrumbTrail = [],
}: TierHierarchySectionProps) {
    const isLevelDisabled = mode === 'edit' || (mode === 'create' && selectedParent !== undefined);

    return (
        <Card className="rounded-[20px] border-slate-200">
            <CardContent className="p-6 space-y-4">
                {/* Breadcrumb Trail (if exists) */}
                {breadcrumbTrail.length > 0 && (
                    <div>
                        <Label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                            Tier Hierarchy
                        </Label>
                        <div className="flex items-center gap-2 text-sm p-3 bg-slate-50 rounded-lg border border-slate-200">
                            {breadcrumbTrail.map((tier, index) => (
                                <div key={tier.id} className="flex items-center gap-2">
                                    <span className="text-slate-700 font-medium">{tier.name}</span>
                                    {index < breadcrumbTrail.length - 1 && (
                                        <ChevronRight className="size-4 text-slate-400" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tier Level */}
                <div id="tier-level-section">
                    <Label htmlFor="tier-level" className="block text-sm font-medium text-slate-900 mb-2">
                        Tier Level <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={level.toString()}
                        onValueChange={(val) => onLevelChange(parseInt(val) as 1 | 2 | 3 | 4)}
                        disabled={isLevelDisabled}
                    >
                        <SelectTrigger className={`rounded-xl ${errors.level ? 'border-red-300' : ''}`}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">Tier 1 (Root Category)</SelectItem>
                            <SelectItem value="2">Tier 2 (Sub-category)</SelectItem>
                            <SelectItem value="3">Tier 3 (Sub-sub-category)</SelectItem>
                            <SelectItem value="4">Tier 4 (Leaf Category)</SelectItem>
                        </SelectContent>
                    </Select>
                    {isLevelDisabled && mode === 'edit' && (
                        <p className="text-xs text-slate-500 mt-1">
                            Level cannot be changed after creation
                        </p>
                    )}
                    {errors.level && (
                        <p className="text-xs text-red-600 mt-1">{errors.level}</p>
                    )}
                </div>

                {/* Parent Tier (only for level > 1) */}
                {level > 1 && (
                    <div id="parent-tier-section">
                        <Label htmlFor="parent-tier" className="block text-sm font-medium text-slate-900 mb-2">
                            Parent Tier <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={parentId || ''}
                            onValueChange={(val) => onParentChange(val || null)}
                            disabled={mode === 'create' && selectedParent !== undefined}
                        >
                            <SelectTrigger className={`rounded-xl ${errors.parentId ? 'border-red-300' : ''}`}>
                                <SelectValue placeholder="Select parent tier..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableParents.length === 0 ? (
                                    <div className="p-2 text-sm text-slate-500">
                                        No available parent tiers
                                    </div>
                                ) : (
                                    availableParents.map((parent) => (
                                        <SelectItem key={parent.id} value={parent.id}>
                                            {parent.name} (Level {parent.level})
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        {selectedParent && mode === 'create' && (
                            <p className="text-xs text-slate-600 mt-1">
                                Auto-selected: {selectedParent.name}
                            </p>
                        )}
                        {errors.parentId && (
                            <p className="text-xs text-red-600 mt-1">{errors.parentId}</p>
                        )}
                    </div>
                )}

                {/* Helper Text */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700">
                        <strong>Tier Structure:</strong> Tier 1 → Tier 2 → Tier 3 → Tier 4
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                        Each tier must have a parent from the level above (except Tier 1)
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
