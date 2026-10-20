import { AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface BundleConditionalActivationProps {
  conditionalCartValue: string;
  setConditionalCartValue: (value: string) => void;
  conditionalSegment: string;
  setConditionalSegment: (value: string) => void;
  conditionalProduct: string;
  setConditionalProduct: (value: string) => void;
}

export const BundleConditionalActivation = ({
  conditionalCartValue,
  setConditionalCartValue,
  conditionalSegment,
  setConditionalSegment,
  conditionalProduct,
  setConditionalProduct
}: BundleConditionalActivationProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-8 space-y-6">
      <div className="flex items-center gap-2">
        <div className="size-8 bg-amber-100 rounded-lg flex items-center justify-center">
          <AlertCircle className="size-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Conditional Activation</h2>
          <p className="text-sm text-slate-600">Show bundle only when specific conditions are met</p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="text-slate-700">Show this bundle when cart value is more than</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
            <Input
              type="number"
              placeholder="0"
              value={conditionalCartValue}
              onChange={(e) => setConditionalCartValue(e.target.value)}
              className="pl-7"
            />
          </div>
          <p className="text-xs text-slate-500">Bundle appears only when cart value exceeds this amount</p>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700">Customer Segment</Label>
          <Select value={conditionalSegment} onValueChange={setConditionalSegment}>
            <SelectTrigger>
              <SelectValue placeholder="All customers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              <SelectItem value="vip">VIP Only</SelectItem>
              <SelectItem value="b2b">B2B Only</SelectItem>
              <SelectItem value="retail">Retail Only</SelectItem>
              <SelectItem value="new">New Customers</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700">Required Product in Cart</Label>
          <Input
            placeholder="Search for product..."
            value={conditionalProduct}
            onChange={(e) => setConditionalProduct(e.target.value)}
          />
          <p className="text-xs text-slate-500">Bundle shows only if this product is already in cart</p>
        </div>
      </div>
    </div>
  );
};
