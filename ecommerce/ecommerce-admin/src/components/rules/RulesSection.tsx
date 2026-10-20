import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RulesSectionProps {
  title: string;
  icon?: LucideIcon;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
  badge?: React.ReactNode;
  required?: boolean;
}

export const RulesSection = ({
  title,
  icon: Icon,
  description,
  children,
  className,
  headerActions,
  badge,
  required = false
}: RulesSectionProps) => {
  return (
    <div className={cn("bg-white rounded-[20px] border border-slate-200 p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="size-5 text-gray-400" />}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-slate-900">{title}</h2>
              {required && <span className="text-red-500 font-bold">*</span>}
              {badge}
            </div>
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>
        </div>
        {headerActions}
      </div>
      {children}
    </div>
  );
};
