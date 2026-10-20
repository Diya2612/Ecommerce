import { useState } from 'react';
import { Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FormSection } from '@/components/forms';
import type { CustomerFormData } from '../../types/customer.types';

interface SecuritySectionProps {
  formData: CustomerFormData;
}

export function SecuritySection({ formData }: SecuritySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleButton = (
    <button
      onClick={() => setIsExpanded(!isExpanded)}
      className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
    >
      {isExpanded ? (
        <ChevronUp className="size-5 text-slate-400" />
      ) : (
        <ChevronDown className="size-5 text-slate-400" />
      )}
    </button>
  );

  return (
    <FormSection
      icon={Lock}
      title="Security & Login"
      actions={toggleButton}
      collapsed={!isExpanded}
    >
      {isExpanded && (
        <div className="space-y-4 mt-2">
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-600 mb-1">Last Login</p>
            <p className="text-sm font-medium text-slate-900">{formData.lastLoginDate || 'Never'}</p>
            {formData.lastLoginIP && (
              <p className="text-xs text-slate-500 mt-1">IP: {formData.lastLoginIP}</p>
            )}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-600 mb-1">Last Logout</p>
            <p className="text-sm font-medium text-slate-900">{formData.lastLogoutDate || 'N/A'}</p>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <span className="text-sm text-slate-700">Failed Login Attempts</span>
            <Badge variant={formData.failedLoginAttempts && formData.failedLoginAttempts > 0 ? 'destructive' : 'outline'}>
              {formData.failedLoginAttempts || 0}
            </Badge>
          </div>

          {formData.accountLockedUntil && (
            <div className="p-3 bg-red-50 rounded-xl border border-red-200">
              <p className="text-xs text-red-600 mb-1">Account Locked Until</p>
              <p className="text-sm font-medium text-red-900">{formData.accountLockedUntil}</p>
            </div>
          )}
        </div>
      )}
    </FormSection>
  );
}
