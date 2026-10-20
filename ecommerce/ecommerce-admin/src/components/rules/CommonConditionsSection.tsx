import { Filter } from 'lucide-react';
import { useMemo, useState } from 'react';
import { RulesSection as UIRulesSection } from './RulesSection';
import { CommonConditionsBuilder } from './CommonConditionsBuilder';
import type { AdvancedConditionItem } from './AdvancedRulesBuilder';

interface CommonConditionsSectionProps {
  // Common Props
  title?: string;
  icon?: any;
  required?: boolean;
  conditions?: any[];
  onConditionsChange?: (conditions: any[]) => void;
  matchType?: 'all' | 'any';
  onMatchTypeChange?: (value: 'all' | 'any') => void;
  onApplyConditions?: () => void;
  onClearConditions?: () => void;

  // Configuration
  conditionConfigs?: Record<string, {
    label: string;
    conditions: Array<{ value: string; label: string }>;
    inputType: 'text' | 'number' | 'date' | 'select';
    options?: Array<{ value: string; label: string }>;
  }>;

  // Collection Specific (Optional)
  collectionType?: 'manual' | 'automated' | '';
  onCollectionTypeChange?: (value: 'manual' | 'automated' | '') => void;
  CollectionTypeSelector?: React.ComponentType<{
    value: string;
    onChange: (value: any) => void;
  }>;
  ProductSelector?: React.ComponentType;
  PreviewComponent?: React.ComponentType<any>;

  // Product Preview (Optional)
  matchingProducts?: any[];
  sortOrder?: string;
  onSortOrderChange?: (value: string) => void;
  sortOptions?: Array<{ value: string; label: string }>;
  showPreview?: boolean;
}

export const CommonConditionsSection = ({
  title = "Conditions / Filters",
  icon = Filter,
  required = false,
  conditions = [],
  onConditionsChange,
  matchType = 'all',
  onMatchTypeChange,
  onApplyConditions,
  onClearConditions,
  conditionConfigs,

  // Collection Specific
  collectionType,
  onCollectionTypeChange,
  CollectionTypeSelector,
  ProductSelector,
  PreviewComponent,

  // Preview
  matchingProducts = [],
  sortOrder = '',
  onSortOrderChange,
  sortOptions = [],
  showPreview = true
}: CommonConditionsSectionProps) => {
  const [useAdvancedRules, setUseAdvancedRules] = useState(true);

  // Convert Simple Conditions to AdvancedConditionItem[] (supports groups)
  const advancedRules: AdvancedConditionItem[] = useMemo(() => {
    const convertItem = (c: any): AdvancedConditionItem => {
      if (c.type === 'group') {
        return {
          type: 'group',
          id: c.id,
          logicType: c.logicType || 'and',
          conditions: c.conditions?.map(convertItem) || []
        };
      } else {
        // Default to condition
        return {
          type: 'condition',
          id: c.id,
          field: c.field,
          operator: c.condition || c.operator,
          value: c.value,
          logicOperator: (c.logicOperator || 'and') as 'and' | 'or'
        };
      }
    };
    return conditions.map(convertItem);
  }, [conditions]);

  // Prepare props for CommonConditionsBuilder
  const availableFields = conditionConfigs ? Object.keys(conditionConfigs) : [];
  const fieldOperators: Record<string, { value: string; label: string }[]> = {};
  if (conditionConfigs) {
    availableFields.forEach(field => {
      fieldOperators[field] = conditionConfigs[field].conditions;
    });
  }

  const getFieldType = (field: string) => {
    return conditionConfigs?.[field]?.inputType || 'text';
  };

  // Build label and select-options maps from conditionConfigs
  const fieldLabels: Record<string, string> = {};
  const fieldValueOptions: Record<string, Array<{ value: string; label: string }>> = {};
  if (conditionConfigs) {
    availableFields.forEach((field) => {
      if (conditionConfigs[field].label) fieldLabels[field] = conditionConfigs[field].label;
      if (conditionConfigs[field].inputType === 'select' && conditionConfigs[field].options?.length) {
        fieldValueOptions[field] = conditionConfigs[field].options!;
      }
    });
  }

  const handleAdvancedRulesChange = (rules: AdvancedConditionItem[]) => {
    if (!onConditionsChange) return;

    // Recursive function to convert advanced items back to simple format
    const convertItem = (item: AdvancedConditionItem): any => {
      if (item.type === 'condition') {
        return {
          id: item.id,
          field: item.field,
          condition: item.operator,
          operator: item.operator,
          value: item.value,
          logicOperator: item.logicOperator,
          type: 'condition'
        };
      } else if (item.type === 'group') {
        return {
          id: item.id,
          type: 'group',
          logicType: item.logicType,
          conditions: item.conditions.map(convertItem)
        };
      }
      return null;
    };

    // Map all items (conditions and groups)
    const mapped = rules.map(convertItem).filter(Boolean);
    onConditionsChange(mapped as any[]);
  };

  const handleApplyWrapper = () => {
    if (onApplyConditions) onApplyConditions();
  };

  const handleClearWrapper = () => {
    if (onClearConditions) onClearConditions();
    if (onConditionsChange) onConditionsChange([]);
  };

  return (
    <UIRulesSection
      title={title}
      icon={icon}
      required={required}
    >
      {/* Type Selector (if present e.g. for Collections) */}
      {CollectionTypeSelector && onCollectionTypeChange && (
        <CollectionTypeSelector
          value={collectionType || ''}
          onChange={onCollectionTypeChange}
        />
      )}

      {/* Manual Mode - Product Selector (if present) */}
      {collectionType === 'manual' && ProductSelector && (
        <>
          <ProductSelector />
          {showPreview && PreviewComponent && (
            <PreviewComponent
              products={matchingProducts}
              sortOrder={sortOrder}
              onSortOrderChange={onSortOrderChange || (() => { })}
              sortOptions={sortOptions}
              title="Selected Products"
              emptyMessage="Use the search above to add products manually"
            />
          )}
        </>
      )}

      {/* Automated Mode (or standard mode if no type selector) */}
      {(collectionType === 'automated' || !CollectionTypeSelector) && (
        <>
          {/* Condition Rules Builder */}
          {onConditionsChange && onMatchTypeChange && conditionConfigs && (
            <div className={collectionType ? "border-t border-slate-200 pt-6 mt-6" : ""}>
              <CommonConditionsBuilder
                advancedRules={advancedRules}
                onAdvancedRulesChange={handleAdvancedRulesChange}
                availableFields={availableFields}
                fieldOperators={fieldOperators}
                getFieldType={getFieldType}
                onApply={handleApplyWrapper}
                onClear={handleClearWrapper}
                matchType={matchType}
                setMatchType={onMatchTypeChange}
                useAdvancedRules={useAdvancedRules}
                setUseAdvancedRules={setUseAdvancedRules}
                hideToggle={true}
                noCard={true}
                fieldLabels={fieldLabels}
                fieldValueOptions={fieldValueOptions}
              />
            </div>
          )}

          {/* Product Preview (if applicable) */}
          {matchingProducts.length > 0 && PreviewComponent && (
            <PreviewComponent
              products={matchingProducts}
              sortOrder={sortOrder}
              onSortOrderChange={onSortOrderChange || (() => { })}
              sortOptions={sortOptions}
            />
          )}
        </>
      )}
    </UIRulesSection>
  );
};