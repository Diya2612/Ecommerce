/**
 * Badge Component
 * Displays status badges with consistent styling
 */

import { memo } from 'react';
import { BADGE_VARIANTS, type BadgeVariant } from '../utils/constants';
import { cn } from '../utils/styling';

export interface BadgeProps {
  /** Badge value/label */
  value: string | number | boolean | null | undefined;
  /** Badge variant (determines color scheme) */
  variant?: BadgeVariant | 'auto';
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Automatically determine badge variant based on value
 */
function getVariantFromValue(value: string): BadgeVariant {
  const val = String(value).toLowerCase();

  if (val === 'active' || val === 'true' || val === 'enabled' || val === 'success') {
    return 'active';
  }
  if (val === 'inactive' || val === 'false' || val === 'disabled') {
    return 'inactive';
  }
  if (val === 'draft' || val === 'pending' || val === 'warning') {
    return 'draft';
  }

  return 'default';
}

/**
 * Get size classes for badge
 */
function getSizeClasses(size: 'sm' | 'md' | 'lg' = 'md'): string {
  switch (size) {
    case 'sm':
      return 'px-1.5 py-0 text-[10px]';
    case 'lg':
      return 'px-3 py-1 text-xs';
    case 'md':
    default:
      return 'px-2 py-0.5 text-[11px]';
  }
}

/**
 * Badge component for displaying status and labels
 */
const BadgeComponent: React.FC<BadgeProps> = ({
  value,
  variant = 'auto',
  className,
  size = 'md',
}) => {
  // Handle empty/null values
  if (value === null || value === undefined || value === '') {
    return <span className="text-gray-400">—</span>;
  }

  const displayValue = String(value);
  const finalVariant = variant === 'auto' ? getVariantFromValue(displayValue) : variant;
  const variantClasses = BADGE_VARIANTS[finalVariant];

  return (
    <span
      className={cn(
        'rounded-full border inline-flex items-center uppercase font-medium',
        getSizeClasses(size),
        variantClasses.bg,
        variantClasses.text,
        variantClasses.border,
        className
      )}
    >
      {displayValue}
    </span>
  );
};

// Export memoized version
export const Badge = memo(BadgeComponent);

Badge.displayName = 'Badge';
