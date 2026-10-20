/**
 * Styling utilities for data-table components
 * Handles className generation and responsive visibility
 */

export type ColumnAlign = 'left' | 'center' | 'right';

export interface ColumnVisibilityConfig {
  sm?: boolean;
  md?: boolean;
  lg?: boolean;
}

/**
 * Get alignment class for a column
 */
export function alignClass(align?: ColumnAlign): string {
  switch (align) {
    case 'center':
      return 'text-center';
    case 'right':
      return 'text-right';
    default:
      return 'text-left';
  }
}

/**
 * Get flex justification class based on alignment
 */
export function justifyClass(align?: ColumnAlign): string {
  switch (align) {
    case 'center':
      return 'justify-center';
    case 'right':
      return 'justify-end';
    default:
      return 'justify-start';
  }
}

/**
 * Generate visibility classes based on column configuration
 */
export function visibilityClasses(
  hiddenOnMobile?: boolean,
  hiddenOn?: ColumnVisibilityConfig
): string {
  const classes: string[] = [];

  // Legacy support for hiddenOnMobile
  if (hiddenOnMobile) {
    classes.push('hidden md:table-cell');
  }

  // New responsive visibility config
  if (hiddenOn?.sm) {
    classes.push('hidden sm:table-cell');
  }
  if (hiddenOn?.md) {
    classes.push('sm:hidden md:table-cell');
  }
  if (hiddenOn?.lg) {
    classes.push('md:hidden lg:table-cell');
  }

  return classes.join(' ');
}

/**
 * Get button variant classes
 */
export function buttonVariantClass(variant: 'primary' | 'secondary' | 'danger' = 'primary'): string {
  const baseClasses = 'h-[38px] px-2 sm:px-4 flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg text-[12px] sm:text-sm font-medium transition-all shadow-sm whitespace-nowrap flex-1 min-w-0 md:flex-none';
  
  switch (variant) {
    case 'primary':
      return `${baseClasses} bg-[#0e042f] text-white hover:bg-[#0e042f]/90`;
    case 'secondary':
      return `${baseClasses} border border-slate-200 bg-white text-slate-600 hover:bg-slate-50`;
    case 'danger':
      return `${baseClasses} bg-red-600 text-white hover:bg-red-700`;
    default:
      return baseClasses;
  }
}

/**
 * Get icon button classes
 */
export function iconButtonClass(active: boolean = false): string {
  return `h-[50px] w-[50px] rounded-xl border flex items-center justify-center shadow-sm transition-all ${
    active
      ? 'bg-purple-50 border-purple-200 text-purple-700'
      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
  }`;
}

/**
 * Get filter button classes
 */
export function filterButtonClass(active: boolean = false, count: number = 0): string {
  return `h-10 px-4 pr-10 rounded-xl border flex items-center gap-2 text-sm font-medium transition-all ${
    active || count > 0
      ? 'bg-purple-50 border-purple-200 text-purple-700'
      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
  }`;
}

/**
 * Get dropdown menu panel classes
 */
export function dropdownMenuPanelClass(): string {
  return 'px-1 py-1 rounded-xl';
}

/**
 * Get dropdown menu header classes
 */
export function dropdownMenuHeaderClass(): string {
  return 'text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2';
}

/**
 * Get dropdown menu item classes
 */
export function dropdownMenuItemClass(active: boolean = false, danger: boolean = false, disabled: boolean = false): string {
  const baseClasses = 'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors';
  
  if (disabled) {
    return `${baseClasses} text-gray-400 cursor-not-allowed`;
  }
  
  if (danger) {
    return `${baseClasses} text-red-500 hover:bg-red-50`;
  }
  
  if (active) {
    return `${baseClasses} bg-purple-50 text-purple-700`;
  }
  
  return `${baseClasses} text-gray-700 hover:bg-gray-50`;
}

/**
 * Generate conditional classes (similar to clsx but simpler)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get row classes based on state
 */
export function rowClass(isSelected: boolean = false, isHoverable: boolean = true, customClass?: string): string {
  return cn(
    'border-t border-gray-50 transition-colors',
    isHoverable && 'hover:bg-gray-50 cursor-pointer',
    isSelected && 'bg-purple-50/30',
    customClass
  );
}

/**
 * Get cell classes
 */
export function cellClass(align?: ColumnAlign, visibility?: string, customClass?: string): string {
  return cn(
    'px-4 py-2.5 text-sm text-gray-700',
    alignClass(align),
    visibility,
    customClass
  );
}

/**
 * Get checkbox container classes
 */
export function checkboxContainerClass(): string {
  return 'px-2 py-2.5 align-middle w-[48px] min-w-[48px] max-w-[48px]';
}

/**
 * Get table wrapper classes
 */
export function tableWrapperClass(fullHeight: boolean = false, forceTableOnMobile: boolean = false): string {
  return cn(
    'overflow-x-auto overflow-y-auto',
    fullHeight ? 'flex-1' : 'max-h-[600px]',
    forceTableOnMobile ? 'block' : 'hidden md:block'
  );
}

/**
 * Get mobile card container classes
 */
export function mobileCardContainerClass(forceTableOnMobile: boolean = false): string {
  return cn(
    'p-4 space-y-3',
    forceTableOnMobile ? 'hidden' : 'md:hidden'
  );
}
