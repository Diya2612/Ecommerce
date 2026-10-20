import { useState } from "react";
import { Minus, Plus, Trash2, Package, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmationDialog } from "@/components/dialogs/ConfirmationDialog";
import { calculateItemTotal } from "../../utils/orderCalculations";
import type { OrderItemsTableProps } from "../../types";
import { ProductDiscountModal } from "../..";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface ExtendedOrderItemsTableProps extends OrderItemsTableProps {
  onApplyDiscount?: (
    itemIds: string[],
    discountType: "percentage" | "fixed",
    discountValue: number,
    discountReason?: string,
  ) => void;
}

export function OrderItemsTable({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onApplyDiscount,
  currency = "INR",
  stockMap,
}: ExtendedOrderItemsTableProps) {
  const currencySymbol =
    currency === "USD" ? "$" : currency === "EUR" ? "€" : "₹";
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Get the item name for the confirmation dialog
  const itemToDeleteName = itemToDelete
    ? items.find((item) => item.id === itemToDelete)?.productName ||
    "this product"
    : "";

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      onRemoveItem(itemToDelete);
      setItemToDelete(null);
    }
  };

  const handleToggleItem = (itemId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(items.map((item) => item.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleApplyDiscountWrapper = (
    itemIds: string[],
    discountType: "percentage" | "fixed",
    discountValue: number,
    discountReason?: string,
  ) => {
    if (onApplyDiscount) {
      onApplyDiscount(itemIds, discountType, discountValue, discountReason);
    }
    setSelectedIds(new Set());
  };

  const selectedItems = items.filter((item) => selectedIds.has(item.id));
  const allSelected = items.length > 0 && selectedIds.size === items.length;

  if (items.length === 0) {
    return (
      <Empty className="border-2 border-dashed border-slate-200 rounded-xl py-12">
        <EmptyMedia>
          <Package className="size-12 text-slate-300" />
        </EmptyMedia>
        <EmptyTitle className="text-slate-600 font-semibold">
          No items added
        </EmptyTitle>
        <EmptyDescription className="text-slate-500">
          Add products to start building the order.
        </EmptyDescription>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      {onApplyDiscount && (
        <div
          className={`flex items-center justify-between px-3 py-2 rounded-xl border ${selectedIds.size > 0
            ? "bg-(--sidebar-bg)/3 border-(--sidebar-bg)/20"
            : "bg-slate-50 border-slate-200"
            }`}
        >
          {selectedIds.size > 0 ? (
            <>
              <span className="text-sm text-indigo-700 font-medium">
                {selectedIds.size} item{selectedIds.size !== 1 ? "s" : ""}{" "}
                selected
              </span>
              <Button
                size="sm"
                onClick={() => setShowDiscountModal(true)}
                className="bg-(--sidebar-bg) hover:bg-(--sidebar-hover) text-(--text-white)/90"
              >
                <Percent className="h-4 w-4 mr-2" />
                Apply Discount
              </Button>
            </>
          ) : (
            <>
              <span className="text-sm text-slate-500">
                💡 Select items using checkboxes to apply discounts
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled
                className="opacity-50"
              >
                <Percent className="h-4 w-4 mr-2" />
                Apply Discount
              </Button>
            </>
          )}
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              {onApplyDiscount && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all items"
                  />
                </TableHead>
              )}
              <TableHead className="text-slate-700 min-w-[200px] max-w-[250px]">Product</TableHead>
              <TableHead className="text-slate-700 w-[140px]">SKU</TableHead>
              <TableHead className="text-center text-slate-700">Qty</TableHead>
              <TableHead className="text-right text-slate-700">Price</TableHead>
              <TableHead className="text-center text-slate-700">
                Discount
              </TableHead>
              <TableHead className="text-right text-slate-700">Total</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const { total } = calculateItemTotal(item);
              const isSelected = selectedIds.has(item.id);

              return (
                <TableRow
                  key={item.id}
                  className={
                    isSelected
                      ? "bg-(--sidebar-bg)/2 hover:bg-(--sidebar-bg)/4"
                      : ""
                  }
                >
                  {onApplyDiscount && (
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleItem(item.id)}
                        aria-label={`Select ${item.productName}`}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
                          <Package className="size-5 text-slate-400" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div
                          className="font-medium text-slate-900 truncate"
                          title={item.productName}
                        >
                          {item.productName}
                        </div>
                        {item.availableStock <= 10 &&
                          item.availableStock > 0 && (
                            <Badge
                              variant="outline"
                              className="text-xs px-1.5 h-5 text-amber-600 border-amber-300"
                            >
                              Low: {item.availableStock}
                            </Badge>
                          )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 text-xs">
                    <div className="truncate" title={item.productSku}>
                      {item.productSku}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 rounded-lg border-slate-200"
                        onClick={() =>
                          onUpdateQuantity(
                            item.id,
                            Math.max(1, item.quantity - 1),
                          )
                        }
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-8 text-center font-semibold text-slate-700">
                        {item.quantity ?? 0}
                      </span>
                      {(() => {
                        // Use live stock from stockMap if available, otherwise fall back to item.availableStock
                        // For custom items (no productId), use availableStock directly
                        const effectiveStock = item.productId 
                          ? (stockMap?.get(item.productId) ?? item.availableStock ?? 100)
                          : (item.availableStock ?? 9999);
                        const currentQty = item.quantity ?? 0;
                        const isAtMax = currentQty >= effectiveStock;
                        
                        return (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-lg border-slate-200"
                            onClick={() =>
                              onUpdateQuantity(
                                item.id,
                                Math.min(effectiveStock, currentQty + 1),
                              )
                            }
                            disabled={isAtMax}
                          >
                            <Plus className="size-3" />
                          </Button>
                        );
                      })()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {currencySymbol}
                    {(item.costPrice ?? 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.discountType !== "" && item.discountValue > 0 ? (
                      <Badge
                        variant="secondary"
                        className="text-green-600 bg-green-50"
                      >
                        {item.discountType === "percentage"
                          ? `${item.discountValue}%`
                          : `${currencySymbol}${item.discountValue}`}
                      </Badge>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {currencySymbol}
                    {total.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setItemToDelete(item.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards (Keep logic but update style if desired, keeping standard div for now as Table doesn't support card view natively) */}
      <div className="md:hidden space-y-3">
        {items.map((item) => {
          const {
            subtotal: itemSubtotal,
            discount,
            total,
          } = calculateItemTotal(item);
          const isSelected = selectedIds.has(item.id);

          return (
            <div
              key={item.id}
              className={`border rounded-xl p-4 space-y-3 transition-colors ${isSelected ? "border-(--sidebar-bg)/30 bg-(--sidebar-bg)/2" : "border-slate-200"}`}
            >
              <div className="flex items-start gap-3">
                {onApplyDiscount && (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggleItem(item.id)}
                    aria-label={`Select ${item.productName}`}
                    className="mt-1"
                  />
                )}
                {item.productImage ? (
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded flex items-center justify-center shrink-0">
                    <Package className="size-6 sm:size-8 text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-900">
                    {item.productName}
                  </h4>
                  <p className="text-sm text-slate-500 mt-0.5">
                    SKU: {item.productSku}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-medium">
                      {currencySymbol}
                      {(item.costPrice ?? 0).toFixed(2)}
                    </span>
                    {item.discountType !== "" && item.discountValue > 0 && (
                      <Badge variant="secondary" className="text-green-600">
                        {item.discountType === "percentage"
                          ? `${item.discountValue}%`
                          : `${currencySymbol}${item.discountValue}`}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setItemToDelete(item.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
                    }
                  >
                    <Minus className="size-3" />
                  </Button>
                  <span className="w-12 text-center font-medium">
                    {item.quantity}
                  </span>
                  {(() => {
                    // Use live stock from stockMap if available
                    // For custom items (no productId), use availableStock directly
                    const effectiveStock = item.productId
                      ? (stockMap?.get(item.productId) ?? item.availableStock)
                      : (item.availableStock ?? 9999);
                    const isAtMax = item.quantity >= effectiveStock;
                    
                    return (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          onUpdateQuantity(
                            item.id,
                            Math.min(effectiveStock, item.quantity + 1),
                          )
                        }
                        disabled={isAtMax}
                      >
                        <Plus className="size-3" />
                      </Button>
                    );
                  })()}
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-900">
                    {currencySymbol}
                    {total.toFixed(2)}
                  </div>
                  {discount > 0 && (
                    <div className="text-xs text-slate-400 line-through">
                      {currencySymbol}
                      {itemSubtotal.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ProductDiscountModal
        isOpen={showDiscountModal}
        onClose={() => setShowDiscountModal(false)}
        selectedItems={selectedItems}
        onApplyDiscount={handleApplyDiscountWrapper}
      />

      <ConfirmationDialog
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Product"
        description={`Are you sure you want to remove "${itemToDeleteName}"? This action cannot be undone.`}
        confirmText="Remove"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
