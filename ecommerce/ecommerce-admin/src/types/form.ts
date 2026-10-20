
/**
 * Validation errors map
 */
export interface ValidationErrors {
    [key: string]: string;
}

/**
 * Base props shared by form section components
 */
export interface BaseFormSectionProps<T = any> {
    formData?: T;
    handleInputChange?: (field: keyof T, value: any) => void;
    errors?: Partial<Record<keyof T, string>>;
    isEditMode?: boolean;
}
