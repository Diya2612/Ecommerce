'use client';

import { motion } from 'motion/react';
import type { ProductVariant } from '@/types/product';
import { Check } from 'lucide-react';

interface VariantSelectorProps {
    variants: ProductVariant[];
    selectedVariantId: string | number | null;
    onVariantSelect: (variantId: string | number | null) => void;
}

/**
 * VariantSelector - Flexible variant selection component
 * 
 * Automatically adapts UI based on option_name:
 * - Color: Shows color swatches/buttons
 * - Size: Shows size buttons
 * - Other: Shows text buttons
 */
export function VariantSelector({
    variants,
    selectedVariantId,
    onVariantSelect
}: VariantSelectorProps) {
    if (!variants || variants.length === 0) {
        return null;
    }

    // Group variants by option_name
    const variantGroups = variants.reduce((groups, variant) => {
        const optionName = variant.option_name;
        if (!groups[optionName]) {
            groups[optionName] = [];
        }
        groups[optionName].push(variant);
        return groups;
    }, {} as Record<string, ProductVariant[]>);

    return (
        <div className="space-y-6">
            {Object.entries(variantGroups).map(([optionName, variantList]) => (
                <div key={optionName}>
                    {renderVariantGroup(
                        optionName,
                        variantList,
                        selectedVariantId,
                        onVariantSelect
                    )}
                </div>
            ))}
        </div>
    );
}

/**
 * Render a group of variants based on option_name
 */
function renderVariantGroup(
    optionName: string,
    variants: ProductVariant[],
    selectedVariantId: string | number | null,
    onVariantSelect: (variantId: string | number | null) => void
) {
    const selectedVariant = variants.find(v => String(v.id) === String(selectedVariantId));
    const selectedLabel = selectedVariant?.option_value || 'Select';

    // Determine render style based on option_name
    const isColor = optionName.toLowerCase().includes('color') || optionName.toLowerCase().includes('colour');
    const isSize = optionName.toLowerCase().includes('size');

    return (
        <>
            <h3 className="text-[18px] font-semibold text-[#0B1F51] mb-3">
                {optionName}: <span className="text-[#00C4CC]">{selectedLabel}</span>
            </h3>

            {isColor ? (
                <ColorVariants
                    variants={variants}
                    selectedVariantId={selectedVariantId}
                    onVariantSelect={onVariantSelect}
                />
            ) : isSize ? (
                <SizeVariants
                    variants={variants}
                    selectedVariantId={selectedVariantId}
                    onVariantSelect={onVariantSelect}
                />
            ) : (
                <TextVariants
                    variants={variants}
                    selectedVariantId={selectedVariantId}
                    onVariantSelect={onVariantSelect}
                />
            )}
        </>
    );
}

/**
 * Color variant selector - shows color swatches
 */
function ColorVariants({
    variants,
    selectedVariantId,
    onVariantSelect
}: VariantSelectorProps & { selectedVariantId: string | number | null }) {
    return (
        <div className="flex flex-wrap gap-3">
            {/* Base Option */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onVariantSelect(null)}
                className={`relative w-16 h-16 rounded-xl border-2 transition-all duration-300 flex items-center justify-center ${selectedVariantId === null
                    ? 'border-[#0B1F51] ring-2 ring-[#00C4CC] ring-offset-2 shadow-lg scale-105 bg-white'
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                    }`}
                aria-label="Select Base Product"
                aria-pressed={selectedVariantId === null}
                title="Base Product"
            >
                <span className="text-xs font-semibold text-gray-600">Base</span>
            </motion.button>

            {variants.map((variant) => {
                const isSelected = String(variant.id) === String(selectedVariantId);
                const isOutOfStock = variant.inventory_quantity !== undefined && variant.inventory_quantity <= 0;
                const disabled = !variant.is_active || isOutOfStock;

                return (
                    <motion.button
                        key={variant.id}
                        whileHover={!disabled ? { scale: 1.05 } : undefined}
                        whileTap={!disabled ? { scale: 0.95 } : undefined}
                        onClick={() => onVariantSelect(variant.id)}
                        className={`relative w-16 h-16 rounded-xl border-2 transition-all duration-300 flex items-center justify-center ${isSelected
                            ? 'border-[#0B1F51] ring-2 ring-[#00C4CC] ring-offset-2 shadow-lg scale-105'
                            : disabled
                                ? 'border-gray-200 opacity-50 cursor-pointer'
                                : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                            }`}
                        aria-label={`Select ${variant.option_value}`}
                        aria-pressed={isSelected}
                        title={disabled ? 'Out of stock' : variant.option_value}
                    >
                        {/* Color Background */}
                        {variant.image_url || variant.thumbnail_url ? (
                            <img
                                src={variant.image_url || variant.thumbnail_url || ''}
                                alt={variant.option_value}
                                className="absolute inset-0.5 rounded-lg object-cover"
                            />
                        ) : (
                            <div
                                className="absolute inset-0.5 rounded-lg"
                                style={{ backgroundColor: getColorHex(variant.option_value) }}
                            />
                        )}

                        {/* Selected Check Icon */}
                        {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                                <div className="bg-[#00C4CC] rounded-full p-1">
                                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                                </div>
                            </div>
                        )}

                        {/* Out of Stock Overlay */}
                        {isOutOfStock && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-lg">
                                <span className="text-[10px] font-bold text-red-500 transform -rotate-45">
                                    OUT
                                </span>
                            </div>
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}

/**
 * Size variant selector - shows size buttons
 */
function SizeVariants({
    variants,
    selectedVariantId,
    onVariantSelect
}: VariantSelectorProps & { selectedVariantId: string | number | null }) {
    return (
        <div className="flex flex-wrap gap-3">
            {/* Base Option */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onVariantSelect(null)}
                className={`min-w-[60px] px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all duration-300 ${selectedVariantId === null
                        ? 'border-[#0B1F51] bg-[#0B1F51] text-white shadow-lg'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-[#00C4CC] hover:text-[#00C4CC]'
                    }`}
                aria-label="Select Base Product"
                aria-pressed={selectedVariantId === null}
                title="Base Product"
            >
                Base
            </motion.button>

            {variants.map((variant) => {
                const isSelected = String(variant.id) === String(selectedVariantId);
                const isOutOfStock = variant.inventory_quantity !== undefined && variant.inventory_quantity <= 0;
                const disabled = !variant.is_active || isOutOfStock;

                return (
                    <motion.button
                        key={variant.id}
                        whileHover={!disabled ? { scale: 1.05 } : undefined}
                        whileTap={!disabled ? { scale: 0.95 } : undefined}
                        onClick={() => onVariantSelect(variant.id)}
                        className={`min-w-[60px] px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all duration-300 ${isSelected
                            ? 'border-[#0B1F51] bg-[#0B1F51] text-white shadow-lg'
                            : disabled
                                ? 'border-gray-200 bg-gray-50 text-gray-400 opacity-75 cursor-pointer'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-[#00C4CC] hover:text-[#00C4CC] cursor-pointer'
                            }`}
                        aria-label={`Select size ${variant.option_value}`}
                        aria-pressed={isSelected}
                        title={disabled ? 'Out of stock' : undefined}
                    >
                        {variant.option_value}
                        {isOutOfStock && (
                            <span className="block text-[10px] text-red-500 mt-0.5">Out</span>
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}

/**
 * Text variant selector - generic button style for other options
 */
function TextVariants({
    variants,
    selectedVariantId,
    onVariantSelect
}: VariantSelectorProps & { selectedVariantId: string | number | null }) {
    return (
        <div className="flex flex-wrap gap-3">
            {/* Base Option */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onVariantSelect(null)}
                className={`px-5 py-3 rounded-xl border-2 font-medium text-sm transition-all duration-300 ${selectedVariantId === null
                        ? 'border-[#0B1F51] bg-[#0B1F51] text-white shadow-lg'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-[#00C4CC] hover:text-[#00C4CC]'
                    }`}
                aria-label="Select Base Product"
                aria-pressed={selectedVariantId === null}
                title="Base Product"
            >
                Base
            </motion.button>

            {variants.map((variant) => {
                const isSelected = String(variant.id) === String(selectedVariantId);
                const isOutOfStock = variant.inventory_quantity !== undefined && variant.inventory_quantity <= 0;
                const disabled = !variant.is_active || isOutOfStock;

                return (
                    <motion.button
                        key={variant.id}
                        whileHover={!disabled ? { scale: 1.05 } : undefined}
                        whileTap={!disabled ? { scale: 0.95 } : undefined}
                        onClick={() => onVariantSelect(variant.id)}
                        className={`px-5 py-3 rounded-xl border-2 font-medium text-sm transition-all duration-300 ${isSelected
                            ? 'border-[#0B1F51] bg-[#0B1F51] text-white shadow-lg'
                            : disabled
                                ? 'border-gray-200 bg-gray-50 text-gray-400 opacity-75 cursor-pointer'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-[#00C4CC] hover:text-[#00C4CC] cursor-pointer'
                            }`}
                        aria-label={`Select ${variant.option_value}`}
                        aria-pressed={isSelected}
                        title={disabled ? 'Out of stock' : undefined}
                    >
                        {variant.option_value}
                        {isOutOfStock && ' (Out of stock)'}
                    </motion.button>
                );
            })}
        </div>
    );
}

/**
 * Helper: Convert color names to hex codes
 */
function getColorHex(colorName: string): string {
    const colorMap: Record<string, string> = {
        'white': '#FFFFFF',
        'pearl white': '#FFFFFF',
        'black': '#000000',
        'midnight black': '#1C2A54',
        'silver': '#C0C0C0',
        'chrome silver': '#C0C0C0',
        'red': '#EF4444',
        'blue': '#3B82F6',
        'green': '#22C55E',
        'yellow': '#FFC107',
        'orange': '#FF9800',
        'purple': '#9C27B0',
        'pink': '#E91E63',
        'brown': '#795548',
        'gray': '#9E9E9E',
        'grey': '#9E9E9E',
    };

    const normalized = colorName.toLowerCase().trim();
    return colorMap[normalized] || '#E5E7EB'; // Default gray
}
