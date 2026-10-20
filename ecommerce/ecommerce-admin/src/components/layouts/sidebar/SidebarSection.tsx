import { cn } from "@/lib/utils";

interface SidebarSectionProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}

export const SidebarSection = ({ title, description, children, className }: SidebarSectionProps) => {
    return (
        <div className={cn("space-y-3", className)}>
            <div className="space-y-1">
                <h3 className="text-sm font-medium text-slate-900">{title}</h3>
                {description && <p className="text-xs text-slate-500">{description}</p>}
            </div>
            <div className="space-y-3">
                {children}
            </div>
        </div>
    );
};
