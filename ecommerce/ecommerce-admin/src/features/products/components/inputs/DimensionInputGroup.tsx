/**
 * DimensionInputGroup Component
 * 
 * A group of 4 dimension inputs (weight, length, breadth, height) with:
 * - Consistent layout and styling
 * - Automatic validation for positive numbers
 * - Prevention of invalid input
 * - Responsive grid layout
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { preventInvalidNumberInput } from '@/utils';

export interface DimensionInputGroupProps {
    /** Weight value in kg */
    weight: string | number | undefined;
    /** Length value in cm */
    length: string | number | undefined;
    /** Breadth value in cm */
    breadth: string | number | undefined;
    /** Height value in cm */
    height: string | number | undefined;
    /** Change handler for weight */
    onWeightChange: (value: string) => void;
    /** Change handler for length */
    onLengthChange: (value: string) => void;
    /** Change handler for breadth */
    onBreadthChange: (value: string) => void;
    /** Change handler for height */
    onHeightChange: (value: string) => void;
    /** Whether inputs are disabled */
    disabled?: boolean;
    /** Whether inputs are read-only */
    readOnly?: boolean;
}

export function DimensionInputGroup({
    weight,
    length,
    breadth,
    height,
    onWeightChange,
    onLengthChange,
    onBreadthChange,
    onHeightChange,
    disabled = false,
    readOnly = false,
}: DimensionInputGroupProps) {
    const inputClassName = `rounded-xl ${readOnly ? 'bg-slate-50 cursor-not-allowed' : ''
        }`;

    return (
        <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Dimensions</h3>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label htmlFor="weight" className="text-sm font-medium text-slate-700 mb-2 block">
                        Weight (kg)
                    </Label>
                    <Input
                        id="weight"
                        type="number"
                        value={weight}
                        onChange={(e) => onWeightChange(e.target.value)}
                        className={inputClassName}
                        placeholder="0.0"
                        min={0}
                        disabled={disabled}
                        readOnly={readOnly}
                        onKeyDown={preventInvalidNumberInput}
                    />
                </div>

                <div>
                    <Label htmlFor="length" className="text-sm font-medium text-slate-700 mb-2 block">
                        Length (cm)
                    </Label>
                    <Input
                        id="length"
                        type="number"
                        value={length}
                        onChange={(e) => onLengthChange(e.target.value)}
                        className={inputClassName}
                        placeholder="0"
                        min={0}
                        disabled={disabled}
                        readOnly={readOnly}
                        onKeyDown={preventInvalidNumberInput}
                    />
                </div>

                <div>
                    <Label htmlFor="breadth" className="text-sm font-medium text-slate-700 mb-2 block">
                        Breadth (cm)
                    </Label>
                    <Input
                        id="breadth"
                        type="number"
                        value={breadth}
                        onChange={(e) => onBreadthChange(e.target.value)}
                        className={inputClassName}
                        placeholder="0"
                        min={0}
                        disabled={disabled}
                        readOnly={readOnly}
                        onKeyDown={preventInvalidNumberInput}
                    />
                </div>

                <div>
                    <Label htmlFor="height" className="text-sm font-medium text-slate-700 mb-2 block">
                        Height (cm)
                    </Label>
                    <Input
                        id="height"
                        type="number"
                        value={height}
                        onChange={(e) => onHeightChange(e.target.value)}
                        className={inputClassName}
                        placeholder="0"
                        min={0}
                        disabled={disabled}
                        readOnly={readOnly}
                        onKeyDown={preventInvalidNumberInput}
                    />
                </div>
            </div>
        </div>
    );
}
