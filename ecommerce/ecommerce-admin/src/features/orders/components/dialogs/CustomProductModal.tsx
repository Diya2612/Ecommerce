import { useState } from "react";
import { Plus, Package, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface CustomProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: { name: string; price: number; quantity: number; sku?: string }) => void;
}

export function CustomProductModal({
  isOpen,
  onClose,
  onAdd,
}: CustomProductModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [quantity, setQuantity] = useState(1);
  const [sku, setSku] = useState("");
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  const validate = () => {
    const newErrors: { name?: string; price?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = "Product name is required";
    }
    
    if (price === "" || price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    if (!validate()) return;
    
    onAdd({
      name: name.trim(),
      price: Number(price),
      quantity,
      sku: sku.trim() || undefined,
    });
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setName("");
    setPrice("");
    setQuantity(1);
    setSku("");
    setErrors({});
    onClose();
  };

  const lineTotal = price !== "" ? Number(price) * quantity : 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-slate-900">
            <Plus className="h-5 w-5 text-[var(--sidebar-bg)]" />
            Add Custom Product
          </DialogTitle>
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Product Name */}
          <div>
            <Label htmlFor="productName" className="text-sm font-medium text-slate-700 mb-2 block">
              Product Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="productName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Installation Service, Custom Part"
              className={`rounded-xl bg-slate-50 border-slate-200 focus:border-[var(--sidebar-bg)] focus:ring-1 focus:ring-[var(--sidebar-bg)]/20 transition-all ${
                errors.name ? "border-red-500" : ""
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <Label htmlFor="price" className="text-sm font-medium text-slate-700 mb-2 block">
              Price (₹) <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value === "" ? "" : parseFloat(e.target.value))}
                placeholder="e.g., 500"
                className={`pl-8 rounded-xl bg-slate-50 border-slate-200 focus:border-[var(--sidebar-bg)] focus:ring-1 focus:ring-[var(--sidebar-bg)]/20 transition-all ${
                  errors.price ? "border-red-500" : ""
                }`}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
            </div>
            {errors.price && (
              <p className="text-xs text-red-500 mt-1">{errors.price}</p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <Label htmlFor="quantity" className="text-sm font-medium text-slate-700 mb-2 block">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="rounded-xl bg-slate-50 border-slate-200 focus:border-[var(--sidebar-bg)] focus:ring-1 focus:ring-[var(--sidebar-bg)]/20 transition-all"
            />
          </div>

          {/* SKU (Optional) */}
          <div>
            <Label htmlFor="sku" className="text-sm font-medium text-slate-700 mb-2 block">
              SKU <span className="text-slate-400 text-xs">(Optional)</span>
            </Label>
            <Input
              id="sku"
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g., CUSTOM-001"
              className="rounded-xl bg-slate-50 border-slate-200 focus:border-[var(--sidebar-bg)] focus:ring-1 focus:ring-[var(--sidebar-bg)]/20 transition-all"
            />
          </div>

          {/* Line Total Preview */}
          {price !== "" && price > 0 && (
            <div className="bg-[var(--sidebar-bg)]/5 border border-[var(--sidebar-bg)]/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-[var(--sidebar-bg)]" />
                  <span className="text-sm text-slate-700">Line Total:</span>
                </div>
                <span className="text-lg font-bold text-[var(--sidebar-bg)]">
                  ₹{lineTotal.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {quantity} × ₹{Number(price).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            className="rounded-xl border-slate-200 text-slate-700 h-10 px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            className="bg-[var(--sidebar-bg)] hover:bg-[var(--sidebar-hover)] text-[var(--text-white)]/90 rounded-xl h-10 px-6"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Product
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
