import { Filter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdvancedRulesBuilder, type AdvancedConditionItem } from './AdvancedRulesBuilder';
import { RulesSection } from './RulesSection';


interface CommonConditionsBuilderProps {
  // Advanced Mode Props
  advancedRules: AdvancedConditionItem[];
  onAdvancedRulesChange: (rules: AdvancedConditionItem[]) => void;
  availableFields: string[];
  fieldOperators: Record<string, { value: string; label: string }[]>;
  getFieldType: (field: string) => 'text' | 'number' | 'date' | 'select';

  // Actions
  onApply: () => void;
  onClear: () => void;
  isApplying?: boolean;

  // New Unified Props
  matchType?: 'all' | 'any' | string;
  setMatchType?: (value: any) => void;
  children?: React.ReactNode;
  hideToggle?: boolean;
  useAdvancedRules?: boolean;
  setUseAdvancedRules?: (value: boolean) => void;

  // Simple Mode Mapping (Optional if children not provided)
  simpleRules?: any[];
  onSimpleRuleChange?: (id: string, field: string, value: any) => void;
  onAddSimpleRule?: () => void;
  onRemoveSimpleRule?: (id: string) => void;
  onCopySimpleRule?: (rule: any) => void;
  noCard?: boolean;
  fieldLabels?: Record<string, string>;
  fieldValueOptions?: Record<string, Array<{ value: string; label: string }>>;
}

export const CommonConditionsBuilder = ({
  advancedRules,
  onAdvancedRulesChange,
  availableFields,
  fieldOperators,
  getFieldType,
  onApply,
  onClear,
  isApplying = false,
  matchType = 'all',
  setMatchType,
  children,
  hideToggle = true,
  useAdvancedRules = true,
  setUseAdvancedRules,
  simpleRules,
  onSimpleRuleChange,
  onAddSimpleRule,
  onRemoveSimpleRule,
  onCopySimpleRule,
  noCard = false,
  fieldLabels,
  fieldValueOptions,
}: CommonConditionsBuilderProps) => {

  const headerActions = !hideToggle && setUseAdvancedRules ? (
    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
      <button
        onClick={() => setUseAdvancedRules(false)}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${!useAdvancedRules
          ? 'bg-white text-slate-900 shadow-sm'
          : 'text-slate-500 hover:text-slate-700'
          }`}
      >
        Simple
      </button>
      <button
        onClick={() => setUseAdvancedRules(true)}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${useAdvancedRules
          ? 'bg-white text-slate-900 shadow-sm'
          : 'text-slate-500 hover:text-slate-700'
          }`}
      >
        Advanced
      </button>
    </div>
  ) : null;

  const content = (
    <>
      <div className="mb-5">
        {/* Match Type Selection */}
        {setMatchType && (
          <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-100">
            <span className="text-sm font-medium text-slate-700">Match products that match:</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="matchType"
                  checked={matchType === 'all'}
                  onChange={() => setMatchType('all')}
                  className="size-4 text-[#0e042f] border-slate-300 focus:ring-[#0e042f] focus:ring-offset-0"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">All conditions</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="matchType"
                  checked={matchType === 'any'}
                  onChange={() => setMatchType('any')}
                  className="size-4 text-[#0e042f] border-slate-300 focus:ring-[#0e042f] focus:ring-offset-0"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Any condition</span>
              </label>
            </div>
          </div>
        )}

        {useAdvancedRules ? (
          <AdvancedRulesBuilder
            items={advancedRules}
            onChange={onAdvancedRulesChange}
            availableFields={availableFields}
            fieldOperators={fieldOperators}
            getFieldType={getFieldType}
            fieldLabels={fieldLabels}
            fieldValueOptions={fieldValueOptions}
          />
        ) : (
          children || (
            <div className="space-y-4">
              <div className="space-y-3">
                {simpleRules?.map((rule) => {
                  const operators = fieldOperators[rule.field] || fieldOperators['text'] || [];
                  const inputType = getFieldType(rule.field);

                  return (
                    <div key={rule.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                      <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-2">
                        <div className="flex-[2]">
                          <Select
                            value={rule.field}
                            onValueChange={(v) => onSimpleRuleChange?.(rule.id, 'field', v)}
                          >
                            <SelectTrigger className="bg-white h-9 rounded-lg">
                              <SelectValue placeholder="Field" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableFields.map(f => (
                                <SelectItem key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1).replace(/_/g, ' ')}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-[2]">
                          <Select
                            value={rule.operator || rule.condition}
                            onValueChange={(v) => onSimpleRuleChange?.(rule.id, rule.operator ? 'operator' : 'condition', v)}
                            disabled={!rule.field}
                          >
                            <SelectTrigger className="bg-white h-9 rounded-lg">
                              <SelectValue placeholder="Operator" />
                            </SelectTrigger>
                            <SelectContent>
                              {operators.map(op => (
                                <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-[2]">
                          <Input
                            type={inputType === 'number' ? 'number' : inputType === 'date' ? 'date' : 'text'}
                            value={rule.value}
                            onChange={(e) => onSimpleRuleChange?.(rule.id, 'value', e.target.value)}
                            className="bg-white h-9 rounded-lg"
                            placeholder="Value"
                            disabled={!rule.field}
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          {onCopySimpleRule && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onCopySimpleRule(rule)}
                              className="size-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                            >
                              <Plus className="size-4" />
                            </Button>
                          )}
                          {onRemoveSimpleRule && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onRemoveSimpleRule(rule.id)}
                              className="size-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={simpleRules.length === 1}
                            >
                              <Plus className="size-4 rotate-45" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {onAddSimpleRule && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddSimpleRule}
                  className="rounded-xl border-dashed border-2 hover:border-indigo-300 hover:bg-indigo-50/50"
                >
                  <Plus className="size-4 mr-2" />
                  Add Condition
                </Button>
              )}
            </div>
          )
        )}

        <div className="flex items-center gap-3 pt-4 border-t border-slate-200 mt-4">
          <Button
            onClick={onApply}
            className="rounded-xl bg-[#0e042f] hover:bg-[#0e042f]/90 text-white h-[44px] px-8 shadow-sm"
            disabled={isApplying}
          >
            {isApplying ? 'Applying...' : 'Apply Filters'}
          </Button>
          <Button
            variant="outline"
            onClick={onClear}
            className="rounded-xl h-[44px] px-8"
          >
            Clear All
          </Button>
        </div>
      </div>
    </>
  );

  if (noCard) {
    return (
      <div className="space-y-4">
        {headerActions && <div className="flex justify-end">{headerActions}</div>}
        {content}
      </div>
    );
  }

  return (
    <RulesSection
      title="Conditions / Filters"
      icon={Filter}
      headerActions={headerActions}
    >
      {content}
    </RulesSection>
  );
};
