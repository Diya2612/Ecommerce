import { Plus, X } from 'lucide-react';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
// Interfaces
export interface AdvancedCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  logicOperator: 'and' | 'or'; // Logic connecting this condition to the previous one
}
export interface AdvancedConditionGroup {
  id: string;
  logicType: 'and' | 'or';
  conditions: AdvancedConditionItem[];
}
export type AdvancedConditionItem =
  | ({ type: 'condition' } & AdvancedCondition)
  | ({ type: 'group' } & AdvancedConditionGroup);
interface AdvancedRulesBuilderProps {
  items: AdvancedConditionItem[];
  onChange: (items: AdvancedConditionItem[]) => void;
  availableFields: string[];
  fieldOperators: Record<string, { value: string; label: string }[]>;
  getFieldType: (field: string) => 'text' | 'number' | 'date' | 'select';
  fieldLabels?: Record<string, string>;
  fieldValueOptions?: Record<string, Array<{ value: string; label: string }>>;
}
export function AdvancedRulesBuilder({
  items,
  onChange,
  availableFields,
  fieldOperators,
  getFieldType,
  fieldLabels,
  fieldValueOptions,
}: AdvancedRulesBuilderProps) {
  // Helper to generate unique ID
  const generateId = useCallback(() => `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, []);

  // Helper to get item by path
  const getItemByPath = (items: AdvancedConditionItem[], path: number[]): AdvancedConditionItem | null => {
    let current: any = { type: 'group', conditions: items };
    for (const index of path) {
      if (current.type === 'group' && current.conditions[index]) {
        current = current.conditions[index];
      } else {
        return null;
      }
    }
    return current;
  };

  // Add new condition
  const addCondition = useCallback((parentPath: number[] = []) => {
    const newCondition: AdvancedConditionItem = {
      type: 'condition',
      id: generateId(),
      field: 'title',
      operator: 'starts_with',
      value: '',
      logicOperator: 'and' // Default to AND
    };
    if (parentPath.length === 0) {
      onChange([...items, newCondition]);
    } else {
      const updatedItems = JSON.parse(JSON.stringify(items));
      const parent = getItemByPath(updatedItems, parentPath);
      if (parent && parent.type === 'group') {
        parent.conditions.push(newCondition);
      }
      onChange(updatedItems);
    }
  }, [items, onChange, generateId]);
  // Add new group
  const addGroup = useCallback((parentPath: number[] = []) => {
    const newGroup: AdvancedConditionItem = {
      type: 'group',
      id: generateId(),
      logicType: 'and',
      conditions: [
        {
          type: 'condition',
          id: generateId(),
          field: 'title',
          operator: 'starts_with',
          value: '',
          logicOperator: 'and'
        }
      ]
    };
    if (parentPath.length === 0) {
      onChange([...items, newGroup]);
    } else {
      const updatedItems = JSON.parse(JSON.stringify(items));
      const parent = getItemByPath(updatedItems, parentPath);
      if (parent && parent.type === 'group') {
        parent.conditions.push(newGroup);
      }
      onChange(updatedItems);
    }
  }, [items, onChange, generateId]);
  // Remove item
  const removeItem = (path: number[]) => {
    if (path.length === 1) {
      onChange(items.filter((_, index) => index !== path[0]));
    } else {
      const updatedItems = JSON.parse(JSON.stringify(items));
      const parentPath = path.slice(0, -1);
      const itemIndex = path[path.length - 1];
      const parent = getItemByPath(updatedItems, parentPath);
      if (parent && parent.type === 'group') {
        parent.conditions.splice(itemIndex, 1);
      }
      onChange(updatedItems);
    }
  };
  // Update condition field
  const updateCondition = (path: number[], key: keyof AdvancedCondition, value: string) => {
    const updatedItems = JSON.parse(JSON.stringify(items));
    const item = getItemByPath(updatedItems, path);
    if (item && item.type === 'condition') {
      (item as unknown as Record<string, string>)[key] = value;
      // Reset operator and value when field changes
      if (key === 'field') {
        item.operator = '';
        item.value = '';
      }
    }
    onChange(updatedItems);
  };
  // Update group logic type
  const updateGroupLogic = (path: number[], logicType: 'and' | 'or') => {
    const updatedItems = JSON.parse(JSON.stringify(items));
    const item = getItemByPath(updatedItems, path);
    if (item && item.type === 'group') {
      item.logicType = logicType;
    }
    onChange(updatedItems);
  };
  // Toggle condition logic operator
  const toggleConditionLogic = (path: number[]) => {
    const updatedItems = JSON.parse(JSON.stringify(items));
    const item = getItemByPath(updatedItems, path);
    if (item && item.type === 'condition') {
      item.logicOperator = item.logicOperator === 'and' ? 'or' : 'and';
      onChange(updatedItems);
    }
  };
  // Render single condition row
  const renderCondition = (
    condition: AdvancedCondition,
    path: number[],
    index: number,
    totalInGroup: number
  ) => {
    const fieldType = condition.field ? getFieldType(condition.field) : 'text';
    const availableOperators = condition.field ? (fieldOperators[condition.field] || []) : [];
    const isFirstItem = index === 0;
    return (
      <div key={condition.id} className="flex items-center gap-3">
        {/* Logic Label - Toggleable for non-first items */}
        <div className="w-12 flex-shrink-0">
          {isFirstItem ? (
            <Badge
              variant="default"
              className="text-xs font-semibold bg-indigo-100 text-indigo-700 border-indigo-200 cursor-default"
            >
              IF
            </Badge>
          ) : (
            <Badge
              variant={condition.logicOperator === 'and' ? 'secondary' : 'default'}
              className={`text-xs font-semibold cursor-pointer select-none transition-colors ${condition.logicOperator === 'and'
                ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                : 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200'
                }`}
              onClick={() => toggleConditionLogic(path)}
              title="Click to toggle between AND/OR"
            >
              {condition.logicOperator.toUpperCase()}
            </Badge>
          )}
        </div>
        {/* Field Selector */}
        <div className="flex-[2]">
          <Select
            value={condition.field}
            onValueChange={(value: string) => updateCondition(path, 'field', value)}
          >
            <SelectTrigger className="rounded-lg bg-white h-9 text-sm">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {availableFields.map((attr) => (
                <SelectItem key={attr} value={attr}>
                  {fieldLabels?.[attr] ?? attr.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Operator Selector */}
        <div className="flex-[2]">
          <Select
            value={condition.operator}
            onValueChange={(value: string) => updateCondition(path, 'operator', value)}
            disabled={!condition.field}
          >
            <SelectTrigger
              className={`rounded-lg h-9 text-sm ${!condition.field ? 'bg-slate-100' : 'bg-white'
                }`}
            >
              <SelectValue placeholder="Operator" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {availableOperators.map((op) => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Value Input */}
        <div className="flex-[2]">
          {fieldType === 'select' && fieldValueOptions?.[condition.field]?.length ? (
            <Select
              value={condition.value}
              onValueChange={(v: string) => updateCondition(path, 'value', v)}
              disabled={!condition.operator}
            >
              <SelectTrigger className={`rounded-lg h-9 text-sm ${!condition.operator ? 'bg-slate-100' : 'bg-white'}`}>
                <SelectValue placeholder="Select value" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {fieldValueOptions[condition.field].map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              type={fieldType === 'number' ? 'number' : fieldType === 'date' ? 'date' : 'text'}
              value={condition.value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCondition(path, 'value', e.target.value)}
              className="rounded-lg bg-white h-9 text-sm"
              placeholder="Enter value"
              disabled={!condition.operator}
            />
          )}
        </div>
        {/* Remove Button */}
        <button
          onClick={() => removeItem(path)}
          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors flex-shrink-0"
          title="Remove condition"
          disabled={totalInGroup === 1 && path.length > 1}
        >
          <X className="size-4" />
        </button>
      </div>
    );
  };
  // Render group
  const renderGroup = (group: AdvancedConditionGroup, path: number[], depth: number = 0) => {
    return (
      <div
        key={group.id}
        className={`border-l-2 ${group.logicType === 'and' ? 'border-slate-300' : 'border-purple-300'
          } pl-4 ml-6 space-y-3`}
        style={{ marginLeft: depth > 0 ? '1.5rem' : '0' }}
      >
        {/* Group Header */}
        <div className="flex items-center gap-3 -ml-4">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
            <Label className="text-xs text-slate-600">Group Logic:</Label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => updateGroupLogic(path, 'and')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${group.logicType === 'and'
                  ? 'bg-slate-200 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                AND
              </button>
              <button
                onClick={() => updateGroupLogic(path, 'or')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${group.logicType === 'or'
                  ? 'bg-purple-200 text-purple-900'
                  : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                OR
              </button>
            </div>
          </div>
          {/* Remove Group Button */}
          {path.length > 0 && (
            <button
              onClick={() => removeItem(path)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
              title="Remove group"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        {/* Group Conditions */}
        <div className="space-y-3 bg-slate-50/50 rounded-lg p-3 border border-slate-200">
          {group.conditions.map((item, index) => {
            const itemPath = [...path, index];
            if (item.type === 'condition') {
              return renderCondition(item as AdvancedCondition, itemPath, index, group.conditions.length);
            } else {
              return renderGroup(item, itemPath, depth + 1);
            }
          })}
          {/* Add Buttons for Group */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addCondition(path)}
              className="rounded-xl text-xs h-8 px-4"
            >
              <Plus className="size-3 mr-1" />
              Add Condition
            </Button>
            {depth < 2 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => addGroup(path)}
                className="rounded-xl text-xs h-8 px-4"
              >
                <Plus className="size-3 mr-1" />
                Add Group
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="space-y-4">
      {/* Root level conditions */}
      {items.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <p className="text-sm text-slate-500 mb-3">No conditions added yet</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addCondition()}
            className="rounded-xl px-6"
          >
            <Plus className="size-4 mr-2" />
            Add First Condition
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => {
            if (item.type === 'condition') {
              return renderCondition(item as AdvancedCondition, [index], index, items.length);
            } else {
              return renderGroup(item, [index]);
            }
          })}
        </div>
      )}
      {/* Root level add buttons */}
      {items.length > 0 && (
        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => addCondition()}
            className="rounded-xl px-4"
          >
            <Plus className="size-4 mr-2" />
            Add Condition
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addGroup()}
            className="rounded-xl px-4"
          >
            <Plus className="size-4 mr-2" />
            Add Group
          </Button>
        </div>
      )}
    </div>
  );
}