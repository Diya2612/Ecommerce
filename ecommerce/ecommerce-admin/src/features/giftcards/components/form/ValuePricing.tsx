import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ValuePricingProps {
  value: string;
  price: string;
  currency: string;
  taxApplicable: boolean;
  onChange: (field: string, value: any) => void;
}

export const ValuePricing: React.FC<ValuePricingProps> = ({
  value,
  price,
  currency,
  taxApplicable,
  onChange,
}) => {
  return (
    <Card className="border-none shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-[#253154]">
          Value & Pricing Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        <div className="flex flex-col space-y-3">
          <div className="w-full space-y-2">
            <Label
              htmlFor="gc-value"
              className="text-sm font-medium text-[#868686]"
            >
              Gift Card Value (₹)
            </Label>
            <Input
              id="gc-value"
              type="number"
              placeholder="0.00"
              className="h-[48px] sm:h-[52px] w-full"
              value={value}
              onChange={(e) => onChange("value", e.target.value)}
            />
          </div>

          <div className="w-full space-y-2">
            <Label
              htmlFor="selling-price"
              className="text-sm font-medium text-[#868686]"
            >
              Selling Price
            </Label>
            <Input
              id="selling-price"
              type="number"
              placeholder="0.00"
              className="h-[48px] sm:h-[52px] w-full"
              value={price}
              onChange={(e) => onChange("price", e.target.value)}
            />
          </div>

          <div className="w-full space-y-2">
            <Label
              htmlFor="currency"
              className="text-sm font-medium text-[#868686]"
            >
              Currency
            </Label>
            <Select value={currency} onValueChange={(v) => onChange("currency", v)}>
              <SelectTrigger
                id="currency"
                className="h-[48px] sm:h-[52px] w-full"
              >
                <SelectValue placeholder="Select Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">INR (₹)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="font-medium text-[#253154]">Tax Applicability</h4>
              <p className="text-xs text-muted-foreground">
                Apply tax on this gift card
              </p>
            </div>
            <Switch
              checked={taxApplicable}
              onCheckedChange={(v) => onChange("taxApplicable", v)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
