import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface FormSectionProps {
    /** Icon component from lucide-react */
    icon?: LucideIcon;
    /** Section title */
    title: ReactNode;
    /** Optional subtitle or description */
    subtitle?: string;
    /** Optional badge or status indicator in the header */
    badge?: ReactNode;
    /** Optional action buttons in the header */
    actions?: ReactNode;
    /** Section content */
    children: ReactNode;
    /** Additional CSS classes */
    className?: string;
    /** Whether the section is collapsed (hides content, reduces spacing) */
    collapsed?: boolean;
    /** Optional ID for scrolling/anchoring */
    id?: string;
}

/**
 * FormSection - Universal wrapper for form sections with consistent styling
 * 
 * Provides consistent card styling with icon, title, and optional badge/actions.
 * Eliminates the need for duplicate wrapper code across 43+ form sections.
 * 
 * @example
 * ```tsx
 * <FormSection icon={User} title="Basic Information" badge={<Badge>Editing</Badge>}>
 *   <div className="space-y-4">
 *     <Input label="Name" />
 *   </div>
 * </FormSection>
 * ```
 */
export function FormSection({
    icon: Icon,
    title,
    subtitle,
    badge,
    actions,
    children,
    className = '',
    collapsed = false,
    id,
}: FormSectionProps) {
    return (
        <div id={id} className={`bg-white rounded-card border border-slate-200 p-6 ${className}`}>
            {/* Header */}
            <div className={`flex items-center justify-between ${collapsed ? '' : 'mb-6'}`}>
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="size-5 text-icon-muted" />}
                    <div>
                        <h2 className="font-semibold text-slate-900">{title}</h2>
                        {subtitle && (
                            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
                        )}
                    </div>
                </div>

                {/* Badge or Actions */}
                {(badge || actions) && (
                    <div className="flex items-center gap-2">
                        {badge}
                        {actions}
                    </div>
                )}
            </div>

            {/* Content - only render wrapper when not collapsed */}
            {!collapsed && (
                <div className="space-y-4">
                    {children}
                </div>
            )}
        </div>
    );
}
