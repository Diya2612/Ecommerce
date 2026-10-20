import React, { useState } from "react";
import {
  ShoppingCart,
  Plus,
  Warehouse,
  Info,
  X,
  ChevronUp,
  ChevronDown,
  TrendingUp,
  Package,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormSection } from "@/components/forms";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { OrderItem } from "@/features/orders/types";
import { ConfirmationDialog } from "@/components/dialogs/ConfirmationDialog";
import { OrderDiscountModal } from "@/features/orders/components/dialogs/OrderDiscountModal";

interface OrderItemsListProps {
  items: OrderItem[];
  currency?: string;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onUpdateDiscount?: (itemIds: string[], type: "percentage" | "fixed", value: number, reason?: string) => void;
  onAddProduct?: () => void;
  isDraftMode?: boolean;
  isLoading?: boolean;
}

export function OrderItemsList({
  items,
  currency = "INR",
  onUpdateQuantity,
  onRemoveItem,
  onUpdateDiscount,
  onAddProduct,
}: OrderItemsListProps) {
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [discountModalItem, setDiscountModalItem] = useState<OrderItem | null>(null);

  const calculateItemTotal = (item: OrderItem) => {
    const price = Number(item.costPrice) || 0;
    const qty = Number(item.quantity) || 1;
    const discount = Number(item.discountValue) || 0;
    const discountType = item.discountType;
    if (discountType === "percentage") {
      return price * qty * (1 - discount / 100);
    } else if (discountType === "fixed") {
      return price * qty - discount;
    }
    return price * qty;
  };

  const getFormatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <>
      <FormSection
        icon={ShoppingCart}
        title={`Order Items (${items.length})`}
        actions={
          onAddProduct && (
            <Button
              type="button"
              onClick={onAddProduct}
              variant="outline"
              size="sm"
              className="rounded-lg"
            >
              <Plus className="size-3.5 mr-1 text-icon-muted" />
              Add Product
            </Button>
          )
        }
      >
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
              <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium text-slate-800">No items added yet</p>
              <p className="text-xs text-slate-500 mt-1">Click "Add Product" to start building this order</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[300px] text-slate-500 font-medium">Product Details</TableHead>
                    <TableHead className="text-center text-slate-500 font-medium">Price</TableHead>
                    <TableHead className="text-center text-slate-500 font-medium">Discount</TableHead>
                    <TableHead className="text-center text-slate-500 font-medium">Quantity</TableHead>
                    <TableHead className="text-right text-slate-500 font-medium">Total</TableHead>
                    <TableHead className="w-[100px] text-center text-slate-500 font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const itemTotal = calculateItemTotal(item);
                    const hasDiscount = (item.discountValue || 0) > 0 && item.discountType !== "";
                    const isExpanded = expandedItemId === item.id;

                    const estCostPrice = Number(item.costPrice) || 0;
                    const estMargin = estCostPrice > 0 ? 40 : 0; // 40% estimated margin

                    return (
                      <React.Fragment key={item.id}>
                        <TableRow className={cn(
                          "group transition-colors",
                          isExpanded ? "bg-slate-50/30" : "hover:bg-slate-50/50"
                        )}>
                          <TableCell className="align-top py-4">
                            <div className="flex flex-col gap-1.5">
                              <span className="font-medium text-slate-900 text-[14px]">
                                {item.productName}
                              </span>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                                  {item.productSku}
                                </span>
                                {item.availableStock !== undefined && (
                                  <span
                                    className={cn(
                                      "inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full font-medium border",
                                      item.availableStock > 10
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : item.availableStock > 0
                                        ? "bg-amber-50 text-amber-700 border-amber-200"
                                        : "bg-red-50 text-red-700 border-red-200"
                                    )}
                                  >
                                    {item.availableStock > 0
                                      ? `${item.availableStock} in stock`
                                      : "Out of stock"}
                                  </span>
                                )}
                              </div>
                              {item.variantLabel && (
                                <div className="text-[12px] text-slate-500 flex items-center gap-1.5 mt-1">
                                  <Warehouse className="w-3.5 h-3.5 opacity-70" />
                                  <span className="truncate">{item.variantLabel}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="align-top py-4 text-center">
                            <div className="font-medium text-slate-900 text-[14px]">
                              {getFormatCurrency(Number(item.costPrice) || 0)}
                            </div>
                          </TableCell>

                          {/* Discount Column */}
                          <TableCell className="align-top py-4 text-center">
                            {hasDiscount ? (
                              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 inline-block">
                                {item.discountType === "percentage"
                                  ? `${item.discountValue}% Off`
                                  : `-${getFormatCurrency(Number(item.discountValue))} Off`}
                              </span>
                            ) : (
                              <span className="text-slate-300 text-[12px]">—</span>
                            )}
                          </TableCell>

                          <TableCell className="align-top py-4">
                            <div className="flex justify-center">
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  onUpdateQuantity(
                                    item.id,
                                    Math.max(1, parseInt(e.target.value) || 1)
                                  )
                                }
                                className="h-9 text-[14px] w-20 text-center bg-white border-slate-200 focus:border-indigo-500 transition-colors shadow-sm rounded-lg"
                              />
                            </div>
                          </TableCell>

                          <TableCell className="align-top py-4 text-right">
                            <div className="text-[14px] font-semibold text-slate-900">
                              {getFormatCurrency(itemTotal)}
                            </div>
                          </TableCell>

                          <TableCell className="align-top py-4">
                            <div className="flex items-center justify-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDiscountModalItem(item)}
                                className="h-8 w-8 rounded-lg transition-colors border text-slate-400 border-transparent hover:border-slate-200 hover:bg-slate-100 hover:text-slate-600"
                                title={hasDiscount ? "Edit Discount" : "Add Discount"}
                                type="button"
                              >
                                <Tag className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setExpandedItemId(isExpanded ? null : item.id)
                                }
                                className={cn(
                                  "h-8 w-8 rounded-lg transition-colors border",
                                  isExpanded
                                    ? "bg-slate-100 text-slate-900 border-slate-200"
                                    : "text-slate-500 border-transparent hover:border-slate-200 hover:bg-slate-100"
                                )}
                                title="Intelligence Details"
                                type="button"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setItemToRemove(item.id)}
                                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 border border-transparent rounded-lg transition-colors"
                                title="Remove Item"
                                type="button"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Expanded Details Row */}
                        {isExpanded && (
                          <TableRow className="bg-slate-50 border-t-0 hover:bg-slate-50">
                            <TableCell colSpan={5} className="p-0 border-b border-slate-200">
                              <div className="px-6 py-5">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  {/* Financial Box */}
                                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                                    <div className="font-semibold text-slate-800 flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 text-[13px]">
                                      <TrendingUp className="w-4 h-4 text-indigo-500" />
                                      Financial Intelligence
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-center text-[13px]">
                                        <span className="text-slate-500">Unit Cost Price:</span>
                                        <span className="font-medium text-slate-900">
                                          {getFormatCurrency(estCostPrice)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center text-[13px]">
                                        <span className="text-slate-500">Estimated Margin:</span>
                                        <Badge variant="outline" className="font-semibold text-emerald-700 bg-emerald-50 border-emerald-200 px-1.5 py-0">
                                          {estMargin.toFixed(1)}%
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Stock Details Box */}
                                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                                    <div className="font-semibold text-slate-800 flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 text-[13px]">
                                      <Package className="w-4 h-4 text-blue-500" />
                                      Inventory Details
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-center text-[13px]">
                                        <span className="text-slate-500">Available Stock:</span>
                                        <span
                                          className={cn(
                                            "font-semibold",
                                            (item.availableStock || 0) > 10
                                              ? "text-emerald-600"
                                              : (item.availableStock || 0) > 0
                                                ? "text-amber-600"
                                                : "text-red-600"
                                          )}
                                        >
                                          {item.availableStock ?? "—"} <span className="text-slate-500 font-normal ml-0.5">units</span>
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center text-[13px]">
                                        <span className="text-slate-500">Warehouse Loc:</span>
                                        <span className="font-medium text-slate-700">Primary</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Item Meta Box */}
                                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                                    <div className="font-semibold text-slate-800 flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 text-[13px]">
                                      <Info className="w-4 h-4 text-slate-500" />
                                      Additional Info
                                    </div>
                                    <div className="space-y-2">
                                      {item.variantLabel && (
                                        <div className="flex justify-between items-center text-[13px]">
                                          <span className="text-slate-500">Selected Variant:</span>
                                          <span className="font-medium text-slate-900 truncate ml-2 text-right">
                                            {item.variantLabel}
                                          </span>
                                        </div>
                                      )}
                                      {item.isCustom ? (
                                        <div className="mt-2 inline-block">
                                          <Badge variant="outline" className="text-[11px] bg-amber-50 text-amber-700 border-amber-200">
                                            Custom Added Item
                                          </Badge>
                                        </div>
                                      ) : (
                                        <div className="mt-2 inline-block">
                                           <Badge variant="outline" className="text-[11px] bg-slate-50 text-slate-600 border-slate-200">
                                            Standard Product
                                          </Badge>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </FormSection>

      {/* Per-item Discount Modal */}
      <OrderDiscountModal
        isOpen={!!discountModalItem}
        onClose={() => setDiscountModalItem(null)}
        currentSubtotal={discountModalItem ? Number(discountModalItem.costPrice) * discountModalItem.quantity : 0}
        currentDiscountType={discountModalItem?.discountType || ""}
        currentDiscountValue={discountModalItem?.discountValue || 0}
        currentDiscountReason={discountModalItem?.discountReason}
        onApplyDiscount={(type, value, reason) => {
          if (discountModalItem && onUpdateDiscount) {
            onUpdateDiscount([discountModalItem.id], type as "percentage" | "fixed", value, reason);
          }
          setDiscountModalItem(null);
        }}
      />

      {/* Remove Item Confirmation */}
      <ConfirmationDialog
        isOpen={!!itemToRemove}
        onClose={() => setItemToRemove(null)}
        onConfirm={() => {
          if (itemToRemove) {
            onRemoveItem(itemToRemove);
            setItemToRemove(null);
          }
        }}
        title="Remove Item"
        description="Are you sure you want to remove this item from the order?"
        confirmText="Remove"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
}
