import { useState } from "react";
import { Search, X, Tag, Check, Percent, IndianRupee } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface DiscountCode {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  description: string;
}

// Simulated available discount codes — replace with real API when ready
const AVAILABLE_CODES: DiscountCode[] = [
  { code: "WELCOME10", type: "percentage", value: 10, description: "10% off for new customers" },
  { code: "FLAT500", type: "fixed", value: 500, description: "₹500 off on orders above ₹5000" },
  { code: "SUMMER25", type: "percentage", value: 25, description: "25% Summer Sale" },
  { code: "B2B15", type: "percentage", value: 15, description: "15% B2B discount" },
  { code: "BULK100", type: "fixed", value: 100, description: "Bulk order flat ₹100 off" },
];

interface AddDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Currently applied per-item discount (if any) for the selected item */
  currentDiscountType?: "" | "percentage" | "fixed";
  currentDiscountValue?: number;
  /** Called when a discount is chosen/applied, or "" to remove */
  onApply: (type: "percentage" | "fixed", value: number, reason?: string) => void;
  onRemove?: () => void;
  /** Currency symbol */
  currencySymbol?: string;
  /** Context title — e.g. "Classic Carrom Board" for item, or "Order" for order-level */
  contextTitle?: string;
}

export function AddDiscountModal({
  isOpen,
  onClose,
  currentDiscountType,
  currentDiscountValue,
  onApply,
  onRemove,
  currencySymbol = "₹",
  contextTitle,
}: AddDiscountModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [autoDiscounts, setAutoDiscounts] = useState(true);
  const [showCustom, setShowCustom] = useState(false);
  const [customType, setCustomType] = useState<"percentage" | "fixed">("percentage");
  const [customValue, setCustomValue] = useState(0);
  const [customReason, setCustomReason] = useState("");
  const [selectedCode, setSelectedCode] = useState<DiscountCode | null>(null);

  const filteredCodes = AVAILABLE_CODES.filter(
    (c) =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCodeSelect = (code: DiscountCode) => {
    setSelectedCode(code.code === selectedCode?.code ? null : code);
    setShowCustom(false);
  };

  const handleApply = () => {
    if (selectedCode) {
      onApply(selectedCode.type, selectedCode.value, selectedCode.code);
    } else if (showCustom && customValue > 0) {
      onApply(customType, customValue, customReason || undefined);
    }
    onClose();
  };

  const canApply = !!selectedCode || (showCustom && customValue > 0);

  const reset = () => {
    setSearchQuery("");
    setSelectedCode(null);
    setShowCustom(false);
    setCustomValue(0);
    setCustomReason("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
            <Tag className="h-4 w-4 text-indigo-600" />
            Add Discount
            {contextTitle && (
              <span className="text-xs text-slate-500 font-normal ml-1">
                {contextTitle}
              </span>
            )}
          </DialogTitle>
          <button
            onClick={handleClose}
            className="absolute right-5 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="space-y-4">
          {/* Currently Applied */}
          {currentDiscountType && currentDiscountValue && currentDiscountValue > 0 && (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 text-sm">
                <Tag className="w-3.5 h-3.5 text-green-600" />
                <span className="text-green-800 font-medium">
                  Current: {currentDiscountType === "percentage"
                    ? `${currentDiscountValue}% off`
                    : `${currencySymbol}${currentDiscountValue} off`}
                </span>
              </div>
              {onRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { onRemove(); handleClose(); }}
                  className="h-6 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2"
                  type="button"
                >
                  Remove
                </Button>
              )}
            </div>
          )}

          {/* Discount Code Search */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Discount Code
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type an order or product discount code"
                className="pl-9 bg-slate-50 border-slate-200 text-sm"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="auto-discounts"
                checked={autoDiscounts}
                onCheckedChange={(v) => setAutoDiscounts(!!v)}
              />
              <label htmlFor="auto-discounts" className="text-sm text-slate-700 cursor-pointer select-none">
                Apply all eligible automatic discounts
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="custom-discount"
                checked={showCustom}
                onCheckedChange={(v) => {
                  setShowCustom(!!v);
                  if (v) setSelectedCode(null);
                }}
              />
              <label htmlFor="custom-discount" className="text-sm text-slate-700 cursor-pointer select-none">
                Add custom order discount
              </label>
            </div>
          </div>

          {/* Custom Discount Entry */}
          {showCustom && (
            <div className="border border-slate-200 rounded-lg p-3 space-y-3 bg-slate-50">
              <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Custom Discount
              </div>
              <RadioGroup
                value={customType}
                onValueChange={(v) => setCustomType(v as "percentage" | "fixed")}
                className="grid grid-cols-2 gap-2"
              >
                <div className="relative">
                  <RadioGroupItem value="percentage" id="cd-pct" className="peer sr-only" />
                  <Label
                    htmlFor="cd-pct"
                    className="flex items-center gap-1 justify-center text-xs border-2 border-slate-200 rounded-lg py-2 cursor-pointer peer-data-[state=checked]:border-indigo-500 peer-data-[state=checked]:bg-indigo-50 peer-data-[state=checked]:text-indigo-700"
                  >
                    <Percent className="w-3 h-3" /> Percentage
                  </Label>
                </div>
                <div className="relative">
                  <RadioGroupItem value="fixed" id="cd-fixed" className="peer sr-only" />
                  <Label
                    htmlFor="cd-fixed"
                    className="flex items-center gap-1 justify-center text-xs border-2 border-slate-200 rounded-lg py-2 cursor-pointer peer-data-[state=checked]:border-indigo-500 peer-data-[state=checked]:bg-indigo-50 peer-data-[state=checked]:text-indigo-700"
                  >
                    <IndianRupee className="w-3 h-3" /> Flat Amount
                  </Label>
                </div>
              </RadioGroup>
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  max={customType === "percentage" ? 100 : undefined}
                  value={customValue || ""}
                  onChange={(e) => setCustomValue(parseFloat(e.target.value) || 0)}
                  placeholder={customType === "percentage" ? "e.g. 10" : "e.g. 500"}
                  className="pl-8 h-8 text-sm bg-white"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  {customType === "percentage" ? "%" : currencySymbol}
                </span>
              </div>
              <Input
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Reason (optional)"
                className="h-8 text-sm bg-white"
              />
            </div>
          )}

          <Separator />

          {/* Available Codes */}
          {!showCustom && (
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                Available Discount Codes
              </Label>
              <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
                {filteredCodes.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">
                    No discount codes match your search
                  </p>
                ) : (
                  filteredCodes.map((code) => {
                    const isSelected = selectedCode?.code === code.code;
                    return (
                      <button
                        key={code.code}
                        onClick={() => handleCodeSelect(code)}
                        className={cn(
                          "w-full text-left border rounded-lg px-3 py-2.5 transition-all",
                          isSelected
                            ? "border-indigo-400 bg-indigo-50"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        )}
                        type="button"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            <Badge
                              variant="outline"
                              className="font-mono text-xs px-1.5 py-0 bg-white border-slate-300"
                            >
                              {code.code}
                            </Badge>
                            <span className="text-sm font-semibold text-slate-900">
                              {code.type === "percentage"
                                ? `${code.value}% off`
                                : `${currencySymbol}${code.value} off`}
                            </span>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 ml-0.5">
                          {code.description}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} className="h-9 px-4">
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={!canApply}
            className="h-9 px-5 bg-[#0E042F] hover:bg-[#0E042F]/90 text-white"
          >
            Apply Discount
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
