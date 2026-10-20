import {
  ChevronRight,
  ChevronDown,
  Plus,
  FolderTree,
  AlertTriangle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { TierTreeProps, Tier } from '../types';

export function TierTree({
  tiers,
  selectedTier,
  expandedTiers,
  onSelectTier,
  onToggleExpand,
  onAddSubTier
}: TierTreeProps) {

  const renderTierNode = (tier: Tier, parentLevel: number = 0) => {
    const isExpanded = expandedTiers.has(tier.id);
    const hasChildren = tier.children && tier.children.length > 0;
    const isSelected = selectedTier?.id === tier.id;

    // Integrity Check: Level Invalid
    // Child level must be greater than parent level
    // (Root nodes have parentLevel=0, so tier.level=1 is valid)
    const isInvalidLevel = tier.level <= parentLevel;

    // Using Anant admin's primary color scheme
    const levelColors: Record<number, string> = {
      1: 'bg-purple-50 text-purple-700 border-purple-200',
      2: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      3: 'bg-blue-50 text-blue-700 border-blue-200',
      4: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };

    const levelBadges: Record<number, string> = {
      1: 'bg-purple-100 text-purple-700',
      2: 'bg-indigo-100 text-indigo-700',
      3: 'bg-blue-100 text-blue-700',
      4: 'bg-emerald-100 text-emerald-700'
    };

    return (
      <div key={tier.id} className="relative group">
        <div
          className={`flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all border ${isSelected
            ? `${levelColors[tier.level]} shadow-sm`
            : 'border-transparent hover:bg-slate-50 hover:border-slate-200'
            }`}
        >
          {/* Expand/Collapse Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) onToggleExpand(tier.id);
            }}
            className={`p-0.5 rounded-md hover:bg-black/5 transition-colors ${hasChildren ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            {hasChildren && (
              isExpanded ? (
                <ChevronDown className="size-4 text-slate-500" />
              ) : (
                <ChevronRight className="size-4 text-slate-500" />
              )
            )}
          </button>

          {/* Tier Info */}
          <div
            onClick={() => onSelectTier(tier)}
            className="flex-1 flex items-center gap-2 min-w-0"
          >
            {/* Icon - Show warning if invalid level */}
            {isInvalidLevel ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-amber-500 shrink-0">
                      <AlertTriangle className="size-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-amber-50 text-amber-900 border-amber-200">
                    <p className="font-semibold">Invalid Hierarchy</p>
                    <p className="text-xs">
                      This tier is level {tier.level}, but its parent is level {parentLevel}.<br />
                      Child level must be greater than parent level.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <FolderTree className={`size-4 shrink-0 ${isSelected ? 'text-current' : 'text-slate-400'}`} />
            )}

            <span className={`text-sm font-medium truncate ${isSelected ? 'text-current' : 'text-slate-700'}`}>
              {tier.name}
            </span>

            <Badge variant="secondary" className={`text-[10px] px-1.5 h-5 ${levelBadges[tier.level]} border-0`}>
              T{tier.level}
            </Badge>

            {tier.usageCount > 0 && (
              <span className="text-xs text-slate-400 shrink-0">
                ({tier.usageCount})
              </span>
            )}

            {tier.status === 'inactive' && (
              <Badge variant="outline" className="text-[10px] px-1.5 h-5 text-slate-500 bg-slate-50 border-slate-200">
                Inactive
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            {tier.level < 4 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddSubTier(tier);
                      }}
                      className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all border border-transparent hover:border-slate-100"
                    >
                      <Plus className="size-3.5 text-slate-600" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Add Sub-tier</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* Children Container with Visual Guide Line */}
        {hasChildren && isExpanded && (
          <div className="relative ml-6 pl-4 border-l border-slate-200/60 my-1">
            <div className="flex flex-col gap-1">
              {tier.children!.map((child: Tier) => renderTierNode(child, tier.level))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1 select-none">
      {tiers.map((tier: Tier) => renderTierNode(tier, 0))}

      {tiers.length === 0 && (
        <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <p className="text-sm text-slate-500">No tiers found</p>
        </div>
      )}
    </div>
  );
}