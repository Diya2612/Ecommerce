import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IndianRupee, Tag, X } from "lucide-react";
import type { OrderSummaryCardProps } from "../../types";

export function OrderSummaryCard({
  currency,
  subtotal,
  productDiscountsTotal,
  orderDiscountAmount,
  orderDiscountType,
  orderDiscountValue,
  tax,
  shipping,
  rounding,
  grandTotal,
  isLocked = false,
  onOpenDiscountModal,
  onRemoveDiscount,
  onShippingChange,
  onRoundingChange,
}: OrderSummaryCardProps) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 py-2.5 px-4">
        <CardTitle className="font-semibold text-slate-900 flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-slate-400" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-1.5">
        <div className="space-y-1 text-sm">
          {/* Subtotal */}
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-medium">
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: currency,
                minimumFractionDigits: 2,
              }).format(subtotal)}
            </span>
          </div>

          {/* Product Discounts */}
          {productDiscountsTotal > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Product Discounts</span>
              <span className="font-medium text-green-700">
                -
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: currency,
                  minimumFractionDigits: 2,
                }).format(productDiscountsTotal)}
              </span>
            </div>
          )}

          {/* Order Discount */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Order Discount</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenDiscountModal}
                disabled={isLocked}
                className="h-6 w-6 p-0 hover:bg-slate-100 rounded"
                title="Add Order Discount"
                type="button"
              >
                <Tag className="w-3.5 h-3.5 text-slate-600" />
              </Button>
              {orderDiscountValue > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-green-700 font-medium bg-green-50 px-1.5 py-0.5 rounded">
                    -{orderDiscountType === "percentage" ? `${orderDiscountValue}%` : new Intl.NumberFormat("en-IN", { style: "currency", currency: currency }).format(orderDiscountValue)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRemoveDiscount}
                    disabled={isLocked}
                    className="h-4 w-4 p-0 hover:bg-red-100 rounded"
                    title="Remove Order Discount"
                    type="button"
                  >
                    <X className="w-3 h-3 text-slate-400 hover:text-red-600" />
                  </Button>
                </div>
              )}
            </div>
            {orderDiscountAmount > 0 ? (
              <span className="font-medium text-green-700">
                -
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: currency,
                  minimumFractionDigits: 2,
                }).format(orderDiscountAmount)}
              </span>
            ) : null}
          </div>

          {/* Tax */}
          <div className="flex items-center justify-between mt-1">
            <span className="text-slate-600">Tax (GST)</span>
            <span className="font-medium">
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: currency,
                minimumFractionDigits: 2,
              }).format(tax)}
            </span>
          </div>

          {/* Shipping */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Shipping</span>
              <Input
                type="number"
                min="0"
                value={shipping || ""}
                onChange={(e) => onShippingChange(parseFloat(e.target.value) || 0)}
                className="h-6 text-xs w-16 px-2 py-0 border-slate-200"
                placeholder="0"
                disabled={isLocked}
              />
            </div>
            <span className="font-medium">
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: currency,
                minimumFractionDigits: 2,
              }).format(shipping)}
            </span>
          </div>

          {/* Rounding Adjustment */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Rounding</span>
              <Input
                type="number"
                step="any"
                value={rounding || ""}
                onChange={(e) => onRoundingChange(parseFloat(e.target.value) || 0)}
                className="h-6 text-xs w-16 px-2 py-0 border-slate-200"
                placeholder="0"
                disabled={isLocked}
              />
            </div>
            <span className="font-medium">
              {rounding >= 0 ? "+" : ""}
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: currency,
                minimumFractionDigits: 2,
              }).format(rounding)}
            </span>
          </div>

          {/* Grand Total */}
          <div className="flex items-center justify-between pt-1">
            <span className="font-semibold text-slate-900">Grand Total</span>
            <span className="text-xl font-bold text-indigo-600">
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: currency,
                minimumFractionDigits: 2,
              }).format(grandTotal)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
