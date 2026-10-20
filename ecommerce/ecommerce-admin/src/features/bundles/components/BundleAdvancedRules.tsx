import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface BundleAdvancedRulesProps {
    maxItemsSelect: string;
    setMaxItemsSelect: (v: string) => void;
    minTotalQuantity: string;
    setMinTotalQuantity: (v: string) => void;
    allowDuplicates: boolean;
    setAllowDuplicates: (v: boolean) => void;
    autoAdjustPrice: boolean;
    setAutoAdjustPrice: (v: boolean) => void;
    disableOnOutOfStock: boolean;
    setDisableOnOutOfStock: (v: boolean) => void;
}

export const BundleAdvancedRules = ({
    maxItemsSelect, setMaxItemsSelect,
    minTotalQuantity, setMinTotalQuantity,
    allowDuplicates, setAllowDuplicates,
    autoAdjustPrice, setAutoAdjustPrice,
    disableOnOutOfStock, setDisableOnOutOfStock
}: BundleAdvancedRulesProps) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-8 space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-slate-900">Advanced Bundle Rules</h2>
                <p className="text-sm text-slate-600 mt-1">Fine-tune bundle behavior and constraints</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Max Items Customer Can Select</label>
                    <Input
                        type="number"
                        placeholder="Unlimited"
                        value={maxItemsSelect}
                        onChange={(e) => setMaxItemsSelect(e.target.value)}
                        className="mt-2"
                    />
                    <p className="text-[0.8rem] text-slate-500">Leave empty for no limit</p>
                </div>

                <div>
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Min Total Quantity Required</label>
                    <Input
                        type="number"
                        placeholder="0"
                        value={minTotalQuantity}
                        onChange={(e) => setMinTotalQuantity(e.target.value)}
                        className="mt-2"
                    />
                    <p className="text-[0.8rem] text-slate-500">Minimum quantity across all products</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div>
                        <p className="font-medium text-slate-900">Allow Duplicate Selections</p>
                        <p className="text-sm text-slate-600">Customer can select the same product multiple times</p>
                    </div>
                    <Switch
                        checked={allowDuplicates}
                        onCheckedChange={setAllowDuplicates}
                    />
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div>
                        <p className="font-medium text-slate-900">Auto-adjust Price</p>
                        <p className="text-sm text-slate-600">Recalculate when optional items are selected</p>
                    </div>
                    <Switch
                        checked={autoAdjustPrice}
                        onCheckedChange={setAutoAdjustPrice}
                    />
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div>
                        <p className="font-medium text-slate-900">Disable if Out of Stock</p>
                        <p className="text-sm text-slate-600">Hide bundle when any mandatory product is unavailable</p>
                    </div>
                    <Switch
                        checked={disableOnOutOfStock}
                        onCheckedChange={setDisableOnOutOfStock}
                    />
                </div>
            </div>
        </div>
    );
};
