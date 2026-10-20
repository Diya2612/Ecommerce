import { Label } from '@/components/ui/label';

interface TypeSelectorProps {
  value: string;
  onChange: (value: 'manual' | 'automated') => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  manualLabel?: string;
  manualDescription?: string;
  automatedLabel?: string;
  automatedDescription?: string;
}

export function TypeSelector({
  value,
  onChange,
  disabled = false,
  label = 'Type',
  required = false,
  manualLabel = 'Manual',
  manualDescription = 'Add items one by one',
  automatedLabel = 'Automated',
  automatedDescription = 'Items are automatically added based on conditions'
}: TypeSelectorProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Label className="text-sm font-medium text-slate-700">{label}</Label>
        {required && <span className="text-red-500 font-bold">*</span>}
      </div>
      <div className="space-y-2.5">
        <button
          onClick={() => onChange('manual')}
          className={`w-full p-3 rounded-xl border-2 transition-all text-left ${value === 'manual'
            ? 'border-[#0e042f] bg-[#0e042f]/5'
            : 'border-slate-200 bg-white hover:border-slate-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          type="button"
          disabled={disabled}
        >
          <div className="flex items-start gap-2.5">
            <div
              className={`mt-0.5 size-4 rounded-full border-2 flex items-center justify-center shrink-0 ${value === 'manual' ? 'border-[#0e042f] bg-[#0e042f]' : 'border-slate-300'
                }`}
            >
              {value === 'manual' && <div className="size-1.5 rounded-full bg-white" />}
            </div>
            <div>
              <p className="font-medium text-slate-900">{manualLabel}</p>
              <p className="text-sm text-slate-600 mt-0.5">
                {manualDescription}
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onChange('automated')}
          className={`w-full p-3 rounded-xl border-2 transition-all text-left ${value === 'automated'
            ? 'border-[#0e042f] bg-[#0e042f]/5'
            : 'border-slate-200 bg-white hover:border-slate-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          type="button"
          disabled={disabled}
        >
          <div className="flex items-start gap-2.5">
            <div
              className={`mt-0.5 size-4 rounded-full border-2 flex items-center justify-center shrink-0 ${value === 'automated' ? 'border-[#0e042f] bg-[#0e042f]' : 'border-slate-300'
                }`}
            >
              {value === 'automated' && <div className="size-1.5 rounded-full bg-white" />}
            </div>
            <div>
              <p className="font-medium text-slate-900">{automatedLabel}</p>
              <p className="text-sm text-slate-600 mt-0.5">
                {automatedDescription}
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
