import { Shield } from 'lucide-react';
import { FormSection } from '@/components/forms';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface ClassificationSectionProps {
  accountStatus: boolean;
  setAccountStatus: (value: boolean) => void;
}

export function ClassificationSection({
  accountStatus,
  setAccountStatus
}: ClassificationSectionProps) {
  return (
    <FormSection icon={Shield} title="Customer Classification & Control">

      <div className="space-y-5">
        {/* Account Status */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <Label className="text-sm font-medium text-slate-900">Account Status</Label>
            <p className="text-xs text-slate-600 mt-0.5">
              {accountStatus ? 'Customer account is active' : 'Customer account is inactive'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">{accountStatus ? 'Active' : 'Inactive'}</span>
            <Switch checked={accountStatus} onCheckedChange={setAccountStatus} />
          </div>
        </div>

        {/* Customer Segment - Commented Out */}
        {/* <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">Customer Segment <span className="text-red-500">*</span></Label>
          <div id="field-customerSegment">
            <MultiSelect
              options={customerSegmentOptions}
              value={customerSegment}
              onChange={setCustomerSegment}
              placeholder="Select customer segments"
              className="w-full rounded-xl"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1.5">
            Segments determine pricing, discounts, and policies applicable to this customer
          </p>
        </div> */}

        {/* Risk Profile */}
        {/* <div>
          <Label className="text-sm font-medium text-slate-700 mb-3 block">Risk Profile</Label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setRiskProfile('low')}
              className={`p-4 rounded-xl border-2 transition-all ${riskProfile === 'low'
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
            >
              <div className="text-center">
                <div
                  className={`size-3 rounded-full mx-auto mb-2 ${riskProfile === 'low' ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                />
                <p
                  className={`text-sm font-medium ${riskProfile === 'low' ? 'text-emerald-700' : 'text-slate-700'
                    }`}
                >
                  Low
                </p>
              </div>
            </button>

            <button
              onClick={() => setRiskProfile('medium')}
              className={`p-4 rounded-xl border-2 transition-all ${riskProfile === 'medium'
                ? 'border-amber-500 bg-amber-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
            >
              <div className="text-center">
                <div
                  className={`size-3 rounded-full mx-auto mb-2 ${riskProfile === 'medium' ? 'bg-amber-500' : 'bg-slate-300'
                    }`}
                />
                <p
                  className={`text-sm font-medium ${riskProfile === 'medium' ? 'text-amber-700' : 'text-slate-700'
                    }`}
                >
                  Medium
                </p>
              </div>
            </button>

            <button
              onClick={() => setRiskProfile('high')}
              className={`p-4 rounded-xl border-2 transition-all ${riskProfile === 'high'
                ? 'border-red-500 bg-red-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
            >
              <div className="text-center">
                <div
                  className={`size-3 rounded-full mx-auto mb-2 ${riskProfile === 'high' ? 'bg-red-500' : 'bg-slate-300'
                    }`}
                />
                <p
                  className={`text-sm font-medium ${riskProfile === 'high' ? 'text-red-700' : 'text-slate-700'
                    }`}
                >
                  High
                </p>
              </div>
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">Credit and payment risk assessment</p>
        </div> */}
      </div>
    </FormSection>
  );
}
