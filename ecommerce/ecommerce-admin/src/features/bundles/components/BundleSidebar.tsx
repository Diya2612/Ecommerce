import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { Bundle } from '../types/bundle.types';

interface BundleSidebarProps {
    status: Bundle['status'];
    setStatus: (v: Bundle['status']) => void;
    startDate: string;
    setStartDate: (v: string) => void;
    endDate: string;
    setEndDate: (v: string) => void;
    stopOnStockOut: boolean;
    setStopOnStockOut: (v: boolean) => void;
    allowBackorder: boolean;
    setAllowBackorder: (v: boolean) => void;
    purchaseLimit: string;
    setPurchaseLimit: (v: string) => void;
}

export const BundleSidebar = ({
    status, setStatus,
    startDate, setStartDate,
    endDate, setEndDate,
    stopOnStockOut, setStopOnStockOut,
    allowBackorder, setAllowBackorder,
    purchaseLimit, setPurchaseLimit
}: BundleSidebarProps) => {
    return (
        <div className="space-y-6">
            {/* Status & Scheduling */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6 space-y-5">
                <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Status & Scheduling</h3>
                    <p className="text-xs text-slate-600">Control bundle availability</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-slate-700">Status</Label>
                        <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Draft">Draft</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Inventory & Availability */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6 space-y-5">
                <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Inventory Controls</h3>
                    <p className="text-xs text-slate-600">Manage stock and ordering</p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">Stop When Stock Runs Out</p>
                            <p className="text-xs text-slate-600">Disable bundle automatically</p>
                        </div>
                        <Switch
                            checked={stopOnStockOut}
                            onCheckedChange={setStopOnStockOut}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">Allow Backorder</p>
                            <p className="text-xs text-slate-600">Accept orders without stock</p>
                        </div>
                        <Switch
                            checked={allowBackorder}
                            onCheckedChange={setAllowBackorder}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Per-Customer Limit</Label>
                        <Input
                            type="number"
                            placeholder="Unlimited"
                            value={purchaseLimit}
                            onChange={(e) => setPurchaseLimit(e.target.value)}
                        />
                        <p className="text-xs text-slate-500">Max purchases per customer</p>
                    </div>
                </div>
            </div>

        </div>
    );
};
