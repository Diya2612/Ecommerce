
/**
 * Generic item with ID and label, useful for selects/lists
 */
export interface SelectOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}

/**
 * Filter group option
 */
export interface FilterGroupOption {
    label: string;
    value: string;
    onSelect: () => void;
    isActive: boolean;
}

/**
 * Filter group
 */
export interface FilterGroup {
    id: string;
    label: string;
    options: FilterGroupOption[];
}
