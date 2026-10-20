/**
 * FilterButton Component
 * Button to toggle filter panel
 */

import { memo } from 'react';
import { Filter } from 'lucide-react';
import { iconButtonClass } from '../utils/styling';

export interface FilterButtonProps {
  /** Whether filters are active/shown */
  active: boolean;
  /** Number of active filters */
  activeCount: number;
  /** Callback when clicked */
  onClick: () => void;
}

/**
 * Filter toggle button with badge
 */
const FilterButtonComponent: React.FC<FilterButtonProps> = ({
  active,
  activeCount,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={iconButtonClass(active || activeCount > 0)}
      title="Toggle Filters"
    >
      <div className="relative">
        <Filter size={20} strokeWidth={1.5} />
        {activeCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center border border-white">
            {activeCount}
          </span>
        )}
      </div>
    </button>
  );
};

// Export memoized version
export const FilterButton = memo(FilterButtonComponent);

FilterButton.displayName = 'FilterButton';
