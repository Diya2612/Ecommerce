import { useState, useEffect } from "react";
import { X, Percent, IndianRupee } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface OrderDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubtotal: number;
  currentDiscountType: "" | "percentage" | "fixed";
  currentDiscountValue: number;
  currentDiscountReason?: string;
  onApplyDiscount: (
    discountType: "" | "percentage" | "fixed",
    discountValue: number,
    discountReason?: string,
  ) => void;
  currencySymbol?: string;
}

export function OrderDiscountModal({
  isOpen,
  onClose,
  currentSubtotal,
  currentDiscountType,
  currentDiscountValue,
  currentDiscountReason,
  onApplyDiscount,
  currencySymbol = "₹",
}: OrderDiscountModalProps) {
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    currentDiscountType === "fixed" ? "fixed" : "percentage",
  );
  const [discountValue, setDiscountValue] = useState<number>(
    currentDiscountValue || 0,
  );
  const [discountReason, setDiscountReason] = useState<string>(
    currentDiscountReason || "",
  );

  // Reset state when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setDiscountType(currentDiscountType === "fixed" ? "fixed" : "percentage");
      setDiscountValue(currentDiscountValue || 0);
      setDiscountReason(currentDiscountReason || "");
    }
  }, [isOpen, currentDiscountType, currentDiscountValue, currentDiscountReason]);

  const handleApply = () => {
    onApplyDiscount(discountType, discountValue, discountReason || undefined);
    onClose();
  };

  const handleRemoveDiscount = () => {
    onApplyDiscount("", 0, undefined);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  // Calculate preview
  const calculatedDiscount =
    discountType === "percentage"
      ? (currentSubtotal * discountValue) / 100
      : discountValue;

  const discountedTotal = Math.max(0, currentSubtotal - calculatedDiscount);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-slate-900">
            <Percent className="h-5 w-5 text-[var(--sidebar-bg)]" />
            Order Discount
          </DialogTitle>
          <button
            onClick={handleClose}
            className="absolute right-6 top-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Discount Type Selection */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-3 block">
              Discount Type
            </Label>
            <RadioGroup
              value={discountType}
              onValueChange={(value) =>
                setDiscountType(value as "percentage" | "fixed")
              }
              className="grid grid-cols-2 gap-3"
            >
              <div className="relative">
                <RadioGroupItem
                  value="percentage"
                  id="order-percentage"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="order-percentage"
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 cursor-pointer peer-data-[state=checked]:border-[var(--sidebar-bg)] peer-data-[state=checked]:bg-[var(--sidebar-bg)]/[0.08]"
                >
                  <Percent className="h-5 w-5 text-[var(--sidebar-bg)]" />
                  <span className="font-bold text-[var(--sidebar-bg)]">Percentage (%)</span>
                </Label>
              </div>
              <div className="relative">
                <RadioGroupItem
                  value="fixed"
                  id="order-fixed"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="order-fixed"
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 cursor-pointer peer-data-[state=checked]:border-[var(--sidebar-bg)] peer-data-[state=checked]:bg-[var(--sidebar-bg)]/[0.08]"
                >
                  <IndianRupee className="h-5 w-5 text-[var(--sidebar-bg)]" />
                  <span className="font-bold text-[var(--sidebar-bg)]">
                    Flat Amount ({currencySymbol})
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Discount Value Input */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              {discountType === "percentage"
                ? "Discount Percentage"
                : "Discount Amount"}
            </Label>
            <div className="relative">
              <Input
                type="number"
                min="0"
                max={discountType === "percentage" ? 100 : currentSubtotal}
                step={discountType === "percentage" ? 1 : 0.01}
                value={discountValue || ""}
                onChange={(e) =>
                  setDiscountValue(parseFloat(e.target.value) || 0)
                }
                placeholder={
                  discountType === "percentage" ? "e.g., 10" : "e.g., 500"
                }
                className="pl-8 rounded-xl bg-slate-50 border-slate-200 focus:border-[var(--sidebar-bg)] focus:ring-1 focus:ring-[var(--sidebar-bg)]/20 transition-all"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                {discountType === "percentage" ? "%" : currencySymbol}
              </span>
            </div>
            {discountType === "percentage" && discountValue > 100 && (
              <p className="text-xs text-red-500 mt-1">
                Percentage cannot exceed 100%
              </p>
            )}
            {discountType === "fixed" && discountValue > currentSubtotal && (
              <p className="text-xs text-amber-600 mt-1">
                Discount exceeds subtotal. Order total will be {currencySymbol}
                0.00
              </p>
            )}
          </div>

          {/* Discount Reason Input */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Reason for Discount <span className="text-slate-400 text-xs">(Optional)</span>
            </Label>
            <Input
              type="text"
              value={discountReason}
              onChange={(e) => setDiscountReason(e.target.value)}
              placeholder="e.g., Seasonal sale, Loyalty discount, Promotional offer"
              className="rounded-xl bg-slate-50 border-slate-200 focus:border-[var(--sidebar-bg)] focus:ring-1 focus:ring-[var(--sidebar-bg)]/20 transition-all"
              maxLength={255}
            />
          </div>

          {/* Savings Preview */}
          {discountValue > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Items Subtotal:</span>
                <span className="font-medium text-slate-900">
                  {currencySymbol}
                  {currentSubtotal.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-slate-600">Order Discount:</span>
                <span className="font-medium text-green-600">
                  - {currencySymbol}
                  {calculatedDiscount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-green-200">
                <span className="text-green-700 font-medium">
                  After Discount:
                </span>
                <span className="font-bold text-green-700">
                  {currencySymbol}
                  {discountedTotal.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          {/* Remove Discount Button - only show if discount is currently applied */}
          {currentDiscountValue > 0 && (
            <Button
              variant="outline"
              onClick={handleRemoveDiscount}
              className="text-red-600 border-red-200 hover:bg-red-50 rounded-xl h-10"
            >
              Remove Discount
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleClose}
            className="rounded-xl border-slate-200 text-slate-700 h-10 px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={
              discountValue <= 0 ||
              (discountType === "percentage" && discountValue > 100)
            }
            className="bg-[var(--sidebar-bg)] hover:bg-[var(--sidebar-hover)] text-[var(--text-white)]/90 rounded-xl h-10 px-6"
          >
            Apply Discount
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
