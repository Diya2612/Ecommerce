/**
 * ActionsDropdown Component
 * Dropdown menu for table actions
 */

import { memo } from 'react';
import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import DropdownMenu from '../../ui/CustomDropdownMenu';
import { iconButtonClass, dropdownMenuPanelClass, dropdownMenuHeaderClass, dropdownMenuItemClass, cn } from '../utils/styling';

interface ActionItem {
  label: string;
  icon: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export interface ActionsDropdownProps {
  /** Action items */
  actions: ActionItem[];
}

/**
 * Actions dropdown menu
 */
const ActionsDropdownComponent: React.FC<ActionsDropdownProps> = ({ actions }) => {
  return (
    <DropdownMenu
      trigger={
        <button
          type="button"
          className={iconButtonClass(false)}
          title="More actions"
        >
          <MoreHorizontal size={20} strokeWidth={1.5} />
        </button>
      }
    >
      <div className={dropdownMenuPanelClass()}>
        <p className={cn(dropdownMenuHeaderClass(), 'px-2')}>Actions</p>

        {actions.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            disabled={item.disabled}
            className={dropdownMenuItemClass(false, item.danger, item.disabled)}
            type="button"
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </DropdownMenu>
  );
};

// Export memoized version
export const ActionsDropdown = memo(ActionsDropdownComponent);

ActionsDropdown.displayName = 'ActionsDropdown';
