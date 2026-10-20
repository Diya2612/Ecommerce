/**
 * ColumnToggle Component
 * Dropdown for toggling column visibility
 */

import { memo } from 'react';
import { Columns } from 'lucide-react';
import DropdownMenu from '../../ui/CustomDropdownMenu';
import { iconButtonClass, dropdownMenuPanelClass, dropdownMenuHeaderClass } from '../utils/styling';

interface ColumnItem {
  key: string;
  label: string;
  visible: boolean;
}

export interface ColumnToggleProps {
  /** Available columns */
  columns: ColumnItem[];
  /** Callback to toggle column visibility */
  onToggle: (key: string) => void;
  /** Callback to show all columns */
  onShowAll: () => void;
  /** Callback to hide all columns */
  onHideAll: () => void;
}

/**
 * Column visibility toggle dropdown
 */
const ColumnToggleComponent: React.FC<ColumnToggleProps> = ({
  columns,
  onToggle,
  onShowAll,
  onHideAll,
}) => {
  return (
    <DropdownMenu
      trigger={
        <button
          type="button"
          className={iconButtonClass(false)}
          title="Visible Columns"
        >
          <Columns size={20} strokeWidth={1.5} />
        </button>
      }
    >
      <div className={dropdownMenuPanelClass()}>
        <div className="flex items-center justify-between mb-2 px-2">
          <p className={dropdownMenuHeaderClass()}>Visible Columns</p>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={onShowAll}
              className="text-[10px] px-2 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Show all
            </button>
            <button
              type="button"
              onClick={onHideAll}
              className="text-[10px] px-2 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Hide all
            </button>
          </div>
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {columns.map((col) => (
            <label
              key={col.key}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={col.visible}
                onChange={() => onToggle(col.key)}
                className="accent-purple-600"
              />
              <span className="text-gray-700">{col.label}</span>
            </label>
          ))}
        </div>
      </div>
    </DropdownMenu>
  );
};

// Export memoized version
export const ColumnToggle = memo(ColumnToggleComponent);

ColumnToggle.displayName = 'ColumnToggle';
