import { useState } from 'react';
import { CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FormSection } from '@/components/forms';
import type { CustomerFormData } from '../../types/customer.types';

interface VerificationSectionProps {
  formData: CustomerFormData;
}

export function VerificationSection({ formData }: VerificationSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleAction = (
    <button
      onClick={() => setIsExpanded(!isExpanded)}
      className="p-1 hover:bg-slate-100 rounded-full transition-colors"
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
      icon={CheckCircle}
      title="Verification & Compliance"
      actions={toggleAction}
      collapsed={!isExpanded}
    >

      {isExpanded && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <span className="text-sm text-slate-700">Email Verified</span>
            <Badge className={formData.emailVerified ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
              {formData.emailVerified ? 'Verified' : 'Not Verified'}
            </Badge>
          </div>

          {/* <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <span className="text-sm text-slate-700">Phone Verified</span>
            <Badge className={formData.phoneVerified ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
              {formData.phoneVerified ? 'Verified' : 'Not Verified'}
            </Badge>
          </div> */}

          {/*           <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <span className="text-sm text-slate-700">GDPR Status</span>
            <Badge variant="outline">{formData.gdprStatus || 'N/A'}</Badge>
          </div> */}

          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-600 mb-1">Privacy Policy Version</p>
            <p className="text-sm font-medium text-slate-900">{formData.privacyPolicyVersion || 'N/A'}</p>
          </div>
        </div>
      )}
    </FormSection>
  );
}
