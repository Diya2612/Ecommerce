"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import type { CartItem } from "@/types/cart";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ============================================================================
// CartItemControls - Client Component
// ============================================================================
// Interactive controls for cart items (quantity +/-, remove)
// Includes debouncing to prevent race conditions when rapidly clicking

interface CartItemControlsProps {
  item: CartItem;
}

export function CartItemControls({ item }: CartItemControlsProps) {
  const { updateQuantity, removeFromCart, isUpdating, isRemoving } = useCart();
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  // Direct update handler - no debouncing
  const handleQuantityChange = async (change: number) => {
    const newQuantity = item.quantity + change;

    // Validate bounds
    if (newQuantity < 1) return;
    
    // Calculate maximum allowed quantity:
    // maxStock represents ADDITIONAL available stock
    // So max allowed = current quantity + available stock
    const maxAllowedQuantity = item.maxStock !== undefined 
      ? item.quantity + item.maxStock 
      : Infinity;

    // Only prevent increase if exceeding total available
    if (change > 0 && newQuantity > maxAllowedQuantity) return;

    await updateQuantity(item.id, change);
  };

  const handleRemoveClick = () => {
    setIsRemoveDialogOpen(true);
  };

  const handleConfirmRemove = async () => {
    await removeFromCart(item.id, true);
    setIsRemoveDialogOpen(false);
  };

  const isDisabled = isUpdating || isRemoving;

  return (
    <>
      <div className="flex flex-col items-end justify-between gap-4">
        {/* Quantity Controls */}
        <div className="flex items-center gap-3 bg-[#F9FBFD] rounded-input p-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-[8px] hover:bg-white hover:shadow-xs disabled:opacity-50"
            onClick={() => handleQuantityChange(-1)}
            disabled={item.quantity <= 1 || isDisabled}
          >
            <Minus className="w-4 h-4 text-gray-600" />
          </Button>
          <span className="w-8 text-center font-semibold text-[#0B1F51] relative">
            {item.quantity}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-[8px] hover:bg-white hover:shadow-xs disabled:opacity-50"
            onClick={() => handleQuantityChange(1)}
            disabled={
              isDisabled ||
              (item.maxStock !== undefined && item.maxStock === 0)
            }
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </Button>
        </div>

        {/* Remove Button */}
        <button
          onClick={handleRemoveClick}
          disabled={isRemoving}
          className="flex items-center gap-2 text-[14px] text-red-500 hover:text-red-700 font-medium transition-colors disabled:opacity-50"
        >
          {isRemoving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          Remove
        </button>
      </div>

      <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove item from cart?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{item.name}</strong> from your cart?
              This will release the stock reservation for other customers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemove}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
