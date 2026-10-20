import { useState, useEffect } from "react";
import { X, Truck, IndianRupee } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ShippingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentShipping: number;
  onApplyShipping: (shippingCharge: number) => void;
  currencySymbol?: string;
}

export function ShippingModal({
  isOpen,
  onClose,
  currentShipping,
  onApplyShipping,
  currencySymbol = "₹",
}: ShippingModalProps) {
  const [shippingCharge, setShippingCharge] = useState<number>(
    currentShipping || 0,
  );

  // Reset state when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setShippingCharge(currentShipping || 0);
    }
  }, [isOpen, currentShipping]);

  const handleApply = () => {
    onApplyShipping(shippingCharge);
    onClose();
  };

  const handleRemoveShipping = () => {
    onApplyShipping(0);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-slate-900">
            <Truck className="h-5 w-5 text-[var(--sidebar-bg)]" />
            Shipping Charge
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
          {/* Shipping Charge Input */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Shipping Charge Amount
            </Label>
            <div className="relative">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={shippingCharge || ""}
                onChange={(e) =>
                  setShippingCharge(parseFloat(e.target.value) || 0)
                }
                placeholder="e.g., 50.00"
                className="pl-8 rounded-xl bg-slate-50 border-slate-200 focus:border-[var(--sidebar-bg)] focus:ring-1 focus:ring-[var(--sidebar-bg)]/20 transition-all"
              />
              <IndianRupee className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Enter the shipping charge amount in {currencySymbol}
            </p>
          </div>

          {/* Preview */}
          {shippingCharge > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Shipping Charge:</span>
                <span className="font-medium text-blue-600">
                  + {currencySymbol}
                  {shippingCharge.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between gap-3 pt-4 border-t">
          {/* Remove Shipping Button - only show if shipping is currently applied */}
          {currentShipping > 0 && (
            <Button
              variant="outline"
              onClick={handleRemoveShipping}
              className="text-red-600 border-red-200 hover:bg-red-50 rounded-xl h-10"
            >
              Remove Shipping
            </Button>
          )}
          <div className="flex gap-3 ml-auto">
            <Button
              variant="outline"
              onClick={handleClose}
              className="rounded-xl border-slate-200 text-slate-700 h-10 px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={shippingCharge < 0}
              className="bg-[var(--sidebar-bg)] hover:bg-[var(--sidebar-hover)] text-[var(--text-white)]/90 rounded-xl h-10 px-6"
            >
              Apply Shipping
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
