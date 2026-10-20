/**
 * SortDropdown Component  
 * Dropdown menu for sort options
 */

import { memo } from 'react';
import { ArrowUpDown } from 'lucide-react';
import DropdownMenu from '../../ui/CustomDropdownMenu';
import { iconButtonClass, dropdownMenuPanelClass, dropdownMenuHeaderClass, dropdownMenuItemClass, cn } from '../utils/styling';
import type { SortOption } from '../FiltersBar';

export interface SortDropdownProps {
  /** Sort options */
  options: SortOption[];
  /** Whether any option is active */
  hasActiveSort: boolean;
}

/**
 * Sort dropdown menu
 */
const SortDropdownComponent: React.FC<SortDropdownProps> = ({
  options,
  hasActiveSort,
}) => {
  return (
    <DropdownMenu
      trigger={
        <button
          type="button"
          className={iconButtonClass(hasActiveSort)}
          title="Sort"
        >
          <ArrowUpDown
            size={20}
            strokeWidth={1.5}
            className={hasActiveSort ? 'text-purple-700' : undefined}
          />
        </button>
      }
    >
      <div className={dropdownMenuPanelClass()}>
        <p className={cn(dropdownMenuHeaderClass(), 'px-2')}>Sort By</p>

        {options.map((item) => (
          <button
            key={item.value}
            className={dropdownMenuItemClass(item.isActive, false, false)}
            onClick={() => item.onSelect(item.value)}
            type="button"
          >
            <span>{item.label}</span>
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              {item.isActive && item.direction && (
                <span className="uppercase">{item.direction}</span>
              )}
              <ArrowUpDown size={14} />
            </span>
          </button>
        ))}
      </div>
    </DropdownMenu>
  );
};

// Export memoized version
export const SortDropdown = memo(SortDropdownComponent);

SortDropdown.displayName = 'SortDropdown';
