import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Info } from 'lucide-react';

interface BundlePricingProps {
    priceType: 'Fixed Price' | 'Percentage Discount';
    setPriceType: (v: 'Fixed Price' | 'Percentage Discount') => void;
    fixedPrice: string;
    setFixedPrice: (v: string) => void;
    discountPercentage: string;
    setDiscountPercentage: (v: string) => void;
}

export const BundlePricing = ({
    priceType, setPriceType,
    fixedPrice, setFixedPrice,
    discountPercentage, setDiscountPercentage
}: BundlePricingProps) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-8 space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-slate-900">Pricing Configuration</h2>
                <p className="text-sm text-slate-600 mt-1">Define how bundle pricing works</p>
            </div>

            <div className="space-y-5">
                <div className="space-y-2">
                    <Label className="text-slate-700">Price Type</Label>
                    <Select value={priceType} onValueChange={(v: any) => setPriceType(v)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Fixed Price">Fixed Price</SelectItem>
                            <SelectItem value="Percentage Discount">Percentage Discount</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {priceType === 'Fixed Price' ? (
                    <div className="space-y-2">
                        <Label>Fixed Bundle Price</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                            <Input
                                type="number"
                                placeholder="0"
                                value={fixedPrice}
                                onChange={(e) => setFixedPrice(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <p className="text-xs text-slate-500">Set a fixed price for the entire bundle</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Label>Discount Percentage</Label>
                        <div className="relative">
                            <Input
                                type="number"
                                placeholder="0"
                                value={discountPercentage}
                                onChange={(e) => setDiscountPercentage(e.target.value)}
                                className="pr-8"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
                        </div>
                        <p className="text-xs text-slate-500">Percentage off the sum of individual product prices</p>
                    </div>
                )}

                {/* Helper Text */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <Info className="size-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-semibold text-slate-900 mb-1">Pricing Logic</p>
                            <p className="text-blue-700">
                                {priceType === 'Fixed Price'
                                    ? 'Customers will pay the fixed price regardless of individual product prices.'
                                    : 'The discount will be calculated based on the sum of all mandatory product prices.'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
