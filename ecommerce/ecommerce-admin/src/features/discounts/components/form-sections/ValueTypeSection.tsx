import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Percent } from 'lucide-react';

import type { DiscountFormData } from '../../types/discount.types';
import {
  PRODUCTS,
  COLLECTIONS,
  SHIPPING_METHODS,
  SHIPPING_ZONES,
  PAYMENT_METHODS,
  DISCOUNT_TYPES
} from '../../data/discount.constants';
import { DiscountMultiSelect as MultiSelect } from '../ui/DiscountMultiSelect';

interface ValueTypeSectionProps {
  formData: DiscountFormData;
  updateField: <K extends keyof DiscountFormData>(field: K, value: DiscountFormData[K]) => void;
}

export const ValueTypeSection = ({ formData, updateField }: ValueTypeSectionProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
      const type = DISCOUNT_TYPES[api.selectedScrollSnap()];
      if (type) {
        updateField('discountType', type.id as any);
      }
    };
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api) return;
    const idx = DISCOUNT_TYPES.findIndex(t => t.id === formData.discountType);
    if (idx !== -1 && idx !== current) {
      api.scrollTo(idx);
      // Remove setCurrent call to avoid cascading renders
    }
  }, [formData.discountType, api, current]);

  return (
    <Card className="border-none shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-[#253154]">Value & Type</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Desktop Grid */}
        <div className="hidden lg:grid grid-cols-4 gap-4">
          {DISCOUNT_TYPES.map((option) => (
            <div
              key={option.id}
              onClick={() => updateField('discountType', option.id as any)}
              className={cn(
                "flex flex-col items-center justify-center gap-2 border rounded-xl p-4 cursor-pointer transition-all hover:bg-slate-50",
                formData.discountType === option.id
                  ? "border-[#0e032f] bg-slate-50 ring-1 ring-[#0e032f]/10"
                  : "border-gray-200"
              )}
            >
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", option.colorClass)}>
                <option.icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{option.label}</span>
            </div>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="lg:hidden pb-8">
          <Carousel setApi={setApi} className="w-full" opts={{ align: "center" }}>
            <CarouselContent className="-ml-4">
              {DISCOUNT_TYPES.map((option) => (
                <CarouselItem key={option.id} className="pl-4 basis-[85%]">
                  <div
                    onClick={() => updateField('discountType', option.id as any)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 border rounded-xl p-4 cursor-pointer transition-all bg-white h-32 w-full",
                      formData.discountType === option.id
                        ? "border-[#0e032f] bg-slate-50 ring-1 ring-[#0e032f]/10"
                        : "border-gray-200"
                    )}
                  >
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", option.colorClass)}>
                      <option.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-2 mt-4">
              {DISCOUNT_TYPES.map((_, i) => (
                <button
                  key={i}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    current === i ? "bg-[#0e032f] w-6" : "bg-gray-200 w-2"
                  )}
                  onClick={() => api?.scrollTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </Carousel>
        </div>

        {/* Configurations based on Type */}
        {formData.discountType !== "buy-x" && formData.discountType !== "shipping" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount Value</Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder={formData.discountType === "percentage" ? "20" : "500"}
                    className="h-12 pl-10"
                    value={formData.value}
                    onChange={(e) => updateField('value', e.target.value)}
                  />
                  <div className="absolute left-3 top-3.5 text-gray-400">
                    {formData.discountType === "percentage" ? (
                      <Percent className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-bold">₹</span>
                    )}
                  </div>
                </div>
              </div>
              {formData.discountType === "percentage" && (
                <div className="space-y-2">
                  <Label>Maximum Cap (Optional)</Label>
                  <Input type="number" placeholder="e.g. 1000" className="h-12" />
                </div>
              )}
            </div>

            {/* Applies To */}
            <div className="space-y-2">
              <Label>Applies To</Label>
              <Select value={formData.appliesTo} onValueChange={(v: any) => updateField('appliesTo', v)}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entire-order">Entire Order</SelectItem>
                  <SelectItem value="specific-products">Specific Products</SelectItem>
                  <SelectItem value="specific-collections">Specific Collections</SelectItem>
                </SelectContent>
              </Select>
              {formData.appliesTo === "specific-products" && (
                <div className="pt-2">
                  <MultiSelect
                    options={PRODUCTS}
                    selected={formData.selectedProducts}
                    onChange={(val) => updateField('selectedProducts', val)}
                    placeholder="Search products..."
                  />
                </div>
              )}
              {formData.appliesTo === "specific-collections" && (
                <div className="pt-2">
                  <MultiSelect
                    options={COLLECTIONS}
                    selected={formData.selectedCollections}
                    onChange={(val) => updateField('selectedCollections', val)}
                    placeholder="Search collections..."
                  />
                </div>
              )}
            </div>

            {/* Minimum Purchase Requirement */}
            <div className="space-y-2">
              <Label>Minimum Purchase Requirement</Label>
              <Select value={formData.minPurchaseType} onValueChange={(v: any) => updateField('minPurchaseType', v)}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="amount">Minimum Purchase Amount (₹)</SelectItem>
                  <SelectItem value="quantity">Minimum Quantity of Items</SelectItem>
                </SelectContent>
              </Select>
              {formData.minPurchaseType === "amount" && (
                <div className="pt-2 space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input placeholder="0.00" className="h-12" />
                </div>
              )}
              {formData.minPurchaseType === "quantity" && (
                <div className="pt-2 space-y-2">
                  <Label>Quantity</Label>
                  <Input placeholder="1" className="h-12" />
                </div>
              )}
            </div>
          </>
        )}

        {formData.discountType === "buy-x" && (
          <div className="space-y-6 pt-2">
            {/* Customer Buys X */}
            <div className="space-y-4 border rounded-xl p-4 bg-slate-50/50">
              <h3 className="font-medium text-[#0e032f]">Customer Buys X</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trigger Type</Label>
                  <Select value={formData.buyXTriggerType} onValueChange={(v: any) => updateField('buyXTriggerType', v)}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quantity">Buy X units</SelectItem>
                      <SelectItem value="amount">Spend at least ₹X</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{formData.buyXTriggerType === "quantity" ? "Quantity" : "Amount (₹)"}</Label>
                  <Input
                    type="number"
                    value={formData.buyXValue}
                    onChange={(e) => updateField('buyXValue', e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Applies To</Label>
                <Select value={formData.buyXAppliesTo} onValueChange={(v: any) => updateField('buyXAppliesTo', v)}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any product</SelectItem>
                    <SelectItem value="specific-products">Specific products</SelectItem>
                    <SelectItem value="specific-collections">Specific collections</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.buyXAppliesTo === "specific-products" && (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  <MultiSelect
                    options={PRODUCTS}
                    selected={formData.buyXSelectedProducts}
                    onChange={(val) => updateField('buyXSelectedProducts', val)}
                    placeholder="Search products..."
                  />
                </div>
              )}
              {formData.buyXAppliesTo === "specific-collections" && (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  <MultiSelect
                    options={COLLECTIONS}
                    selected={formData.buyXSelectedCollections}
                    onChange={(val) => updateField('buyXSelectedCollections', val)}
                    placeholder="Search collections..."
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <div className="font-medium text-sm">Same Product Required?</div>
                  <div className="text-xs text-muted-foreground">
                    Require the same product (same SKU) to trigger this discount
                  </div>
                </div>
                <Switch checked={formData.buyXSameProduct} onCheckedChange={(v) => updateField('buyXSameProduct', v)} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium text-sm">Repeat Rule</div>
                  <div className="text-xs text-muted-foreground">
                    Apply this rule multiple times in one order (e.g. Buy 4 Get 2)
                  </div>
                </div>
                <Switch checked={formData.buyXRepeat} onCheckedChange={(v) => updateField('buyXRepeat', v)} />
              </div>
            </div>

            {/* Customer Gets Y */}
            <div className="space-y-4 border rounded-xl p-4 bg-slate-50/50">
              <h3 className="font-medium text-[#0e032f]">Customer Gets Y</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Reward Type</Label>
                  <Select value={formData.getYType} onValueChange={(v: any) => updateField('getYType', v)}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free product</SelectItem>
                      <SelectItem value="percentage">Percentage off</SelectItem>
                      <SelectItem value="amount">Amount off</SelectItem>
                      <SelectItem value="fixed">Set fixed price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Y Quantity</Label>
                  <Input
                    type="number"
                    value={formData.getYQuantity}
                    onChange={(e) => updateField('getYQuantity', e.target.value)}
                    className="h-12"
                    placeholder="1"
                  />
                </div>
              </div>

              {formData.getYType !== "free" && (
                <div className="space-y-2">
                  <Label>
                    {formData.getYType === "percentage"
                      ? "Percentage Off (%)"
                      : formData.getYType === "amount"
                        ? "Amount Off (₹)"
                        : "Fixed Price (₹)"}
                  </Label>
                  <Input
                    type="number"
                    value={formData.getYValue}
                    onChange={(e) => updateField('getYValue', e.target.value)}
                    className="h-12"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Reward Applies To</Label>
                <Select value={formData.getYAppliesTo} onValueChange={(v: any) => updateField('getYAppliesTo', v)}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="same">Same items they bought</SelectItem>
                    <SelectItem value="specific-products">Specific products</SelectItem>
                    <SelectItem value="specific-collections">Specific collections</SelectItem>
                    <SelectItem value="cheapest">Cheapest eligible product</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.getYAppliesTo === "specific-products" && (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  <MultiSelect
                    options={PRODUCTS}
                    selected={formData.getYSelectedProducts}
                    onChange={(val) => updateField('getYSelectedProducts', val)}
                    placeholder="Search products..."
                  />
                </div>
              )}
              {formData.getYAppliesTo === "specific-collections" && (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  <MultiSelect
                    options={COLLECTIONS}
                    selected={formData.getYSelectedCollections}
                    onChange={(val) => updateField('getYSelectedCollections', val)}
                    placeholder="Search collections..."
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Maximum Rewards Per Order (Optional)</Label>
                <Input
                  type="number"
                  placeholder="Leave empty for no limit"
                  value={formData.getYMaxRewards}
                  onChange={(e) => updateField('getYMaxRewards', e.target.value)}
                  className="h-12"
                />
              </div>
            </div>
          </div>
        )}

        {formData.discountType === "shipping" && (
          <div className="space-y-6 pt-2">
            <div className="space-y-4 border rounded-xl p-4 bg-slate-50/50">
              <h3 className="font-medium text-[#0e032f]">Free Shipping Settings</h3>

              <div className="space-y-2">
                <Label>Shipping Scope</Label>
                <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4">
                  <div
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                      formData.shippingScope === "all" ? "bg-slate-100" : "hover:bg-slate-50"
                    )}
                    onClick={() => updateField('shippingScope', "all")}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                      formData.shippingScope === "all" ? "border-[#0e032f]" : "border-gray-300"
                    )}>
                      {formData.shippingScope === "all" && <div className="w-2 h-2 rounded-full bg-[#0e032f]" />}
                    </div>
                    <Label className="font-normal cursor-pointer">All shipping methods</Label>
                  </div>
                  <div
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                      formData.shippingScope === "specific-methods" ? "bg-slate-100" : "hover:bg-slate-50"
                    )}
                    onClick={() => updateField('shippingScope', "specific-methods")}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                      formData.shippingScope === "specific-methods" ? "border-[#0e032f]" : "border-gray-300"
                    )}>
                      {formData.shippingScope === "specific-methods" && <div className="w-2 h-2 rounded-full bg-[#0e032f]" />}
                    </div>
                    <Label className="font-normal cursor-pointer">Specific methods</Label>
                  </div>
                  <div
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                      formData.shippingScope === "specific-zones" ? "bg-slate-100" : "hover:bg-slate-50"
                    )}
                    onClick={() => updateField('shippingScope', "specific-zones")}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                      formData.shippingScope === "specific-zones" ? "border-[#0e032f]" : "border-gray-300"
                    )}>
                      {formData.shippingScope === "specific-zones" && <div className="w-2 h-2 rounded-full bg-[#0e032f]" />}
                    </div>
                    <Label className="font-normal cursor-pointer">Specific zones</Label>
                  </div>
                </div>
              </div>

              {formData.shippingScope === "specific-methods" && (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  <MultiSelect
                    options={SHIPPING_METHODS}
                    selected={formData.shippingSelectedMethods}
                    onChange={(val) => updateField('shippingSelectedMethods', val)}
                    placeholder="Search shipping methods..."
                  />
                </div>
              )}
              {formData.shippingScope === "specific-zones" && (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  <MultiSelect
                    options={SHIPPING_ZONES}
                    selected={formData.shippingSelectedZones}
                    onChange={(val) => updateField('shippingSelectedZones', val)}
                    placeholder="Search zones..."
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label>Minimum Order Amount (Optional)</Label>
                  <Input
                    type="number"
                    placeholder="₹999"
                    value={formData.shippingMinAmount}
                    onChange={(e) => updateField('shippingMinAmount', e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Minimum Items in Cart (Optional)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 2"
                    value={formData.shippingMinItems}
                    onChange={(e) => updateField('shippingMinItems', e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 border rounded-xl p-4 bg-slate-50/50">
              <h3 className="font-medium text-[#0e032f]">Advanced Controls</h3>

              <div className="space-y-2">
                <Label>Exclude Certain Products</Label>
                <MultiSelect
                  options={PRODUCTS}
                  selected={formData.shippingExcludeProducts}
                  onChange={(val) => updateField('shippingExcludeProducts', val)}
                  placeholder="Search products..."
                />
              </div>
              <div className="space-y-2">
                <Label>Exclude Certain Collections</Label>
                <MultiSelect
                  options={COLLECTIONS}
                  selected={formData.shippingExcludeCollections}
                  onChange={(val) => updateField('shippingExcludeCollections', val)}
                  placeholder="Search collections..."
                />
              </div>
              <div className="space-y-2">
                <Label>Exclude Payment Methods</Label>
                <MultiSelect
                  options={PAYMENT_METHODS}
                  selected={formData.shippingExcludePaymentMethods}
                  onChange={(val) => updateField('shippingExcludePaymentMethods', val)}
                  placeholder="Search payment methods..."
                />
              </div>
              <div className="space-y-2 pt-2">
                <Label>Cap Shipping Discount (Optional)</Label>
                <Input
                  type="number"
                  placeholder="Cover up to ₹200 of shipping cost"
                  value={formData.shippingCap}
                  onChange={(e) => updateField('shippingCap', e.target.value)}
                  className="h-12"
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
