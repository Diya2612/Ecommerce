import { useState, useEffect } from "react";
import { X, Percent, DollarSign, Package } from "lucide-react";
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
import type { OrderItem } from "@/features/orders/types";

interface ProductDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: OrderItem[];
  onApplyDiscount: (
    itemIds: string[],
    discountType: "percentage" | "fixed",
    discountValue: number,
    discountReason?: string,
  ) => void;
}

export function ProductDiscountModal({
  isOpen,
  onClose,
  selectedItems,
  onApplyDiscount,
}: ProductDiscountModalProps) {
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    "percentage",
  );
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState<string>("");

  // Track if we've initialized for this modal session
  const [initialized, setInitialized] = useState(false);

  // Initialize state ONLY when modal first opens
  useEffect(() => {
    if (isOpen && !initialized) {
      // If single item, prepopulate with existing discount
      if (selectedItems.length === 1 && selectedItems[0].discountValue > 0) {
        setDiscountType(
          selectedItems[0].discountType === "fixed" ? "fixed" : "percentage"
        );
        setDiscountValue(selectedItems[0].discountValue);
        setDiscountReason(selectedItems[0].discountReason || "");
      } else {
        // Bulk or new, reset to default
        setDiscountType("percentage");
        setDiscountValue(0);
        setDiscountReason("");
      }
      setInitialized(true);
    } else if (!isOpen) {
      // Reset initialization flag when modal closes
      setInitialized(false);
    }
  }, [isOpen, initialized, selectedItems]);

  const handleApply = () => {
    const itemIds = selectedItems.map((item) => item.id);
    onApplyDiscount(itemIds, discountType, discountValue, discountReason || undefined);
    onClose();
  };

  const handleRemoveDiscount = () => {
    const itemIds = selectedItems.map((item) => item.id);
    onApplyDiscount(itemIds, "percentage", 0, undefined); // Clear discount
    onClose();
  };

  const handleClose = () => {
    setDiscountType("percentage");
    setDiscountValue(0);
    setDiscountReason("");
    onClose();
  };

  // Calculate preview of discounted prices
  const calculateDiscountedPrice = (item: OrderItem) => {
    const originalPrice = item.costPrice;
    if (discountType === "percentage") {
      return originalPrice - (originalPrice * discountValue) / 100;
    } else {
      return Math.max(0, originalPrice - discountValue);
    }
  };

  // Find minimum price among selected items to validate fixed discount
  const minItemPrice = selectedItems.length > 0 
    ? Math.min(...selectedItems.map(i => i.costPrice)) 
    : 0;

  const totalOriginal = selectedItems.reduce(
    (sum, item) => sum + item.costPrice * item.quantity,
    0,
  );
  const totalDiscounted = selectedItems.reduce(
    (sum, item) => sum + calculateDiscountedPrice(item) * item.quantity,
    0,
  );
  const totalSavings = totalOriginal - totalDiscounted;

  // Check if current selection has any existing discount
  const hasExistingDiscount = selectedItems.some(i => i.discountValue > 0 && i.discountType !== "");

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-slate-900">
            <Percent className="h-5 w-5 text-[var(--sidebar-bg)]" />
            Apply Discount
          </DialogTitle>
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Selected Products Summary */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-3 block">
              Selected Products ({selectedItems.length})
            </Label>
            <div className="max-h-40 overflow-auto border border-[var(--sidebar-bg)]/20 rounded-xl divide-y bg-slate-50/50">
              {selectedItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3">
                  {item.productImage ? (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-10 h-10 rounded object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center">
                      <Package className="h-5 w-5 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {item.productName}
                    </p>
                    <p className="text-xs text-slate-500">
                      Qty: {item.quantity} × ₹{item.costPrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">
                      ₹{(item.costPrice * item.quantity).toLocaleString()}
                    </p>
                    {discountValue > 0 && (
                      <p className="text-xs text-green-600">
                        → ₹
                        {(
                          calculateDiscountedPrice(item) * item.quantity
                        ).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

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
                  id="percentage"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="percentage"
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 cursor-pointer peer-data-[state=checked]:border-[var(--sidebar-bg)] peer-data-[state=checked]:bg-[var(--sidebar-bg)]/[0.08]"
                >
                  <Percent className="h-5 w-5 text-[var(--sidebar-bg)]" />
                  <span className="font-bold text-[var(--sidebar-bg)]">Percentage (%)</span>
                </Label>
              </div>
              <div className="relative">
                <RadioGroupItem
                  value="fixed"
                  id="fixed"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="fixed"
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 cursor-pointer peer-data-[state=checked]:border-[var(--sidebar-bg)] peer-data-[state=checked]:bg-[var(--sidebar-bg)]/[0.08]"
                >
                  <DollarSign className="h-5 w-5 text-[var(--sidebar-bg)]" />
                  <span className="font-bold text-[var(--sidebar-bg)]">Flat Amount (₹)</span>
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
                max={discountType === "percentage" ? 100 : undefined}
                step={discountType === "percentage" ? 1 : 0.01}
                value={discountValue || ""}
                onChange={(e) =>
                  setDiscountValue(parseFloat(e.target.value) || 0)
                }
                placeholder={
                  discountType === "percentage" ? "e.g., 10" : "e.g., 100"
                }
                className="pl-8 rounded-xl bg-slate-50 border-slate-200 focus:border-[var(--sidebar-bg)] focus:ring-1 focus:ring-[var(--sidebar-bg)]/20 transition-all"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                {discountType === "percentage" ? "%" : "₹"}
              </span>
            </div>
            {discountType === "percentage" && discountValue > 100 && (
              <p className="text-xs text-red-500 mt-1">
                Percentage cannot exceed 100%
              </p>
            )}
            {discountType === "fixed" && discountValue > minItemPrice && (
              <p className="text-xs text-amber-600 mt-1">
                Discount amount exceeds product price (₹{minItemPrice})
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
              placeholder="e.g., Damaged packaging, Customer loyalty, Price match"
              className="rounded-xl bg-slate-50 border-slate-200 focus:border-[var(--sidebar-bg)] focus:ring-1 focus:ring-[var(--sidebar-bg)]/20 transition-all"
              maxLength={255}
            />
          </div>

          {/* Savings Preview */}
          {discountValue > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Original Total:</span>
                <span className="font-medium text-slate-900">
                  ₹{totalOriginal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-slate-600">Discounted Total:</span>
                <span className="font-medium text-slate-900">
                  ₹{totalDiscounted.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-green-200">
                <span className="text-green-700 font-medium">
                  Total Savings:
                </span>
                <span className="font-bold text-green-700">
                  - ₹{totalSavings.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          {hasExistingDiscount && (
             <Button
                variant="ghost"
                onClick={handleRemoveDiscount}
                className="mr-auto text-red-600 hover:text-red-700 hover:bg-red-50"
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
              (discountType === "percentage" && discountValue > 100) ||
              (discountType === "fixed" && discountValue > minItemPrice)
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
