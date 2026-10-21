'use client';

import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/utils/utils';
import type { TierNode } from '@/types/tier';

interface CategorySidebarProps {
    tiers: TierNode[];
    selectedCategories: string[];
    onToggleCategory: (categorySlug: string) => void;
}

interface CategoryNodeProps {
    node: TierNode;
    selectedCategories: string[];
    onToggle: (slug: string) => void;
    depth?: number;
}

function CategoryNode({ node, selectedCategories, onToggle, depth = 0 }: CategoryNodeProps) {
    const isSelected = selectedCategories.includes(node.code);
    const hasChildren = node.children && node.children.length > 0;

    // Auto-expand if a child is selected or if it's a root node (optional UX choice)
    const isChildSelected = (n: TierNode): boolean => {
        if (selectedCategories.includes(n.code)) return true;
        return n.children ? n.children.some(isChildSelected) : false;
    };

    // Initial state: expanded if child is selected
    const [isOpen, setIsOpen] = useState(isChildSelected(node));

    // Update expansion if selection changes externally
    useEffect(() => {
        if (isChildSelected(node)) {
            setIsOpen(true);
        }
    }, [selectedCategories, node]);

    return (
        <div className="w-full">
            {/* Node Row */}
            <div
                className={cn(
                    "flex items-center gap-2 py-2 px-3 cursor-pointer",
                    isSelected
                        ? "bg-gray-100 dark:bg-slate-800 font-medium"
                        : "hover:bg-gray-50 dark:hover:bg-slate-800/30"
                )}
                style={{ paddingLeft: `${depth * 16 + 12}px` }}
                onClick={(e) => {
                    // Always toggle selection (for both parent and leaf nodes)
                    onToggle(node.code);
                    // If has children, also expand
                    if (hasChildren) {
                        setIsOpen(true);
                    }
                }}
            >
                {/* Expand/Collapse Chevron */}
                {hasChildren ? (
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(!isOpen);
                        }}
                    >
                        <ChevronRight
                            className={cn(
                                "w-4 h-4 text-gray-400",
                                isOpen && "rotate-90"
                            )}
                        />
                    </div>
                ) : (
                    <div className="w-4" />
                )}

                <span className={cn(
                    "text-sm text-gray-700 dark:text-gray-300",
                    isSelected && "font-semibold"
                )}>
                    {node.name}
                </span>
            </div>

            {/* Children Recursion */}
            {hasChildren && isOpen && (
                <div>
                    {node.children.map(child => (
                        <CategoryNode
                            key={child.id}
                            node={child}
                            selectedCategories={selectedCategories}
                            onToggle={onToggle}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function CategorySidebar({
    tiers,
    selectedCategories,
    onToggleCategory,
}: CategorySidebarProps) {
    if (!tiers || tiers.length === 0) return null;

    const isAllProductsSelected = selectedCategories.length === 0;

    const handleAllProducts = () => {
        // Clear all category selections
        selectedCategories.forEach(slug => onToggleCategory(slug));
    };

    return (
        <div className="space-y-1">
            {/* All Products Option */}
            <div
                className={cn(
                    "flex items-center gap-2 py-2 px-3 cursor-pointer",
                    isAllProductsSelected
                        ? "bg-[#31CDD4]/10 font-semibold border-l-2 border-[#31CDD4]"
                        : "hover:bg-gray-50 dark:hover:bg-slate-800/30"
                )}
                onClick={handleAllProducts}
            >
                <div className="w-4" />
                <span className={cn(
                    "text-sm text-gray-700 dark:text-gray-300",
                    isAllProductsSelected && "font-semibold text-[#31CDD4]"
                )}>
                    All Products
                </span>
            </div>

            {/* Category Tree */}
            {tiers.map(tier => (
                <CategoryNode
                    key={tier.id}
                    node={tier}
                    selectedCategories={selectedCategories}
                    onToggle={onToggleCategory}
                    depth={0}
                />
            ))}
        </div>
    );
}
