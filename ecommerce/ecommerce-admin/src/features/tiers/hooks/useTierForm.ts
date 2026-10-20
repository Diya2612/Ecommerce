import { useEffect } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tierValidationSchema, type TierSchemaData } from '../validation/tierSchema';
import type { TierFormData, Tier } from '../types';

/**
 * Standard form hook options interface
 */
interface UseTierFormOptions {
    mode?: 'create' | 'edit';
    initialData?: Partial<TierFormData> | Tier;
    selectedParent?: Tier;
}

/**
 * Default form data for new tiers
 */
const getDefaultFormData = (): Partial<TierSchemaData> => ({
    name: '',
    code: '',
    description: '',
    level: 1,
    parentId: null,
    status: 'active',
});

/**
 * Extended interface for the hook return value
 * Includes both RHF methods and legacy compatibility helpers
 */
export interface UseTierFormReturn extends UseFormReturn<TierSchemaData> {
    // UI State for legacy compatibility
    mode: 'create' | 'edit';
    formData: TierSchemaData; // Reactive watch() for components using props
    errors: Partial<Record<keyof TierSchemaData, string>>; // Transformed errors
    hasChanges: boolean;
    isValid: boolean;

    // Handlers for legacy compatibility
    handleInputChange: (field: keyof TierSchemaData, value: any) => void;
    handleNameChange: (value: string) => void;
    validate: () => boolean;
    resetForSubTier: (parent: Tier) => void;
}

/**
 * Refactored Tier Form Hook using React Hook Form
 * Aligned with useProductForm architecture
 */
export function useTierForm(options: UseTierFormOptions = {}): UseTierFormReturn {
    const { mode = 'create', initialData, selectedParent } = options;

    // Prepare default values
    const defaultValues = (() => {
        const defaults = getDefaultFormData();

        // If creating a sub-tier, pre-fill level and parentId
        if (mode === 'create' && selectedParent) {
            return {
                ...defaults,
                level: (selectedParent.level + 1) as 2 | 3 | 4,
                parentId: selectedParent.id,
            } as TierSchemaData;
        }

        if (initialData && Object.keys(initialData).length > 0) {
            return {
                ...defaults,
                ...initialData,
            } as TierSchemaData;
        }

        return defaults as TierSchemaData;
    })();

    // Initialize RHF
    const form = useForm<TierSchemaData>({
        resolver: zodResolver(tierValidationSchema) as any,
        defaultValues,
        mode: 'onChange',
    });

    const { setValue, watch, trigger, reset, formState } = form;

    // Sync formData when initialData changes (for Edit mode loading)
    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            reset({
                ...getDefaultFormData(),
                ...initialData,
            } as TierSchemaData);
        }
    }, [initialData, reset]);

    // Handle selectedParent change (for sub-tier creation)
    useEffect(() => {
        if (mode === 'create' && selectedParent) {
            setValue('level', (selectedParent.level + 1) as 2 | 3 | 4);
            setValue('parentId', selectedParent.id);
        }
    }, [selectedParent, mode, setValue]);

    // Auto-generate code from name
    const tierName = watch('name');
    const tierCode = watch('code');

    useEffect(() => {
        if (tierName && !formState.touchedFields.code) {
            const generatedCode = tierName
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();

            if (tierCode !== generatedCode) {
                setValue('code', generatedCode, { shouldValidate: true });
            }
        }
    }, [tierName, setValue, formState.touchedFields.code, tierCode]);

    // Legacy Helpers & Data Mappings
    const formData = watch(); // Reactive object for legacy components

    // Transform RHF formState.errors to simple string record for legacy use
    const legacyErrors = Object.keys(formState.errors).reduce((acc, key) => {
        const field = key as keyof TierSchemaData;
        acc[field] = formState.errors[field]?.message as string;
        return acc;
    }, {} as Partial<Record<keyof TierSchemaData, string>>);

    const handleInputChange = (field: keyof TierSchemaData, value: any) => {
        setValue(field, value, { shouldValidate: true, shouldDirty: true });
    };

    const handleNameChange = (value: string) => {
        setValue('name', value, { shouldValidate: true, shouldDirty: true });
    };

    const validate = () => {
        // Trigger RHF validation
        trigger();
        return formState.isValid;
    };

    const resetForSubTier = (parent: Tier) => {
        reset({
            ...getDefaultFormData(),
            level: (parent.level + 1) as 2 | 3 | 4,
            parentId: parent.id,
        } as TierSchemaData);
    };

    return {
        ...form,
        mode,
        formData,
        errors: legacyErrors,
        hasChanges: formState.isDirty,
        isValid: formState.isValid,
        handleInputChange,
        handleNameChange,
        validate,
        resetForSubTier,
    } as unknown as UseTierFormReturn;
}
