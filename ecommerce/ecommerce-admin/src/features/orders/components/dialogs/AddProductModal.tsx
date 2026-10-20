import { useState, useEffect } from "react";
import { Search, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GenericTable } from "@/components/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { usePagination } from "@/hooks/usePagination";
import { cn } from "@/lib/utils";
import { useProductsWithVariants, type ProductVariantRow } from "@/features/orders/hooks/useProductsWithVariants";

type Tab = "browse" | "custom";

/* ---- Shared types -------------------------------------------------- */
export interface ProductSelectionItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  price: number;
  stock: number;
  image?: string;
  quantity: number;
  discountType: "none" | "percentage" | "fixed";
  discountValue: number;
  variant_id?: string;
  variant_label?: string;
  productId: string;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called when products are added from Browse tab */
  onAddProducts: (products: ProductSelectionItem[]) => void;
  /** Called when a custom product is added from Custom tab */
  onAddCustomProduct: (item: { name: string; price: number; quantity: number; sku?: string }) => void;
  /** Default tab to open on */
  defaultTab?: Tab;
}

/* ---- Stock badge helper -------------------------------------------- */
function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <Badge className="bg-red-100 text-red-800 text-xs hover:bg-red-100">Out of stock</Badge>;
  if (stock <= 15) return <Badge className="bg-orange-100 text-orange-800 text-xs hover:bg-orange-100">Stock: {stock}</Badge>;
  return <Badge className="bg-green-100 text-green-800 text-xs hover:bg-green-100">Stock: {stock}</Badge>;
}

/* ---- Main component ------------------------------------------------- */
export function AddProductModal({
  isOpen,
  onClose,
  onAddProducts,
  onAddCustomProduct,
  defaultTab = "browse",
}: AddProductModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

  /* Browse tab state */
  const { page, setPage } = usePagination({ initialRowsPerPage: 50, initialPage: 1 });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<ProductVariantRow[]>([]);
  const [stockFilter, setStockFilter] = useState("all");

  /* Custom tab state */
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [quantity, setQuantity] = useState(1);
  const [isTaxable, setIsTaxable] = useState(true);
  const [isPhysical, setIsPhysical] = useState(true);
  const [weight, setWeight] = useState<number | "">("");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [customErrors, setCustomErrors] = useState<{ name?: string; price?: string }>({});

  /* Debounce search */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery, setPage]);

  const { data, isLoading } = useProductsWithVariants({
    page,
    limit: 50,
    search: debouncedQuery,
    sortBy: "created_at",
    sortOrder: "desc",
  });
  const products = data?.products || [];
  const totalPages = data?.totalPages || 1;

  /* Filter by stock */
  const filteredProducts = products.filter((p) => {
    if (stockFilter === "in_stock") return p.inventory_quantity > 0;
    if (stockFilter === "out_of_stock") return p.inventory_quantity === 0;
    return true;
  });

  /* --- Handlers --- */
  const handleBrowseDone = () => {
    const items: ProductSelectionItem[] = selectedProducts.map((p) => ({
      id: p.id,
      name: p.product_title,
      category: p.category_tier_1 || "Uncategorized",
      sku: p.sku || "N/A",
      price: parseFloat(p.selling_price),
      stock: p.inventory_quantity,
      image: p.primary_image_url || undefined,
      quantity: 1,
      discountType: "none",
      discountValue: 0,
      variant_id: p.variant_id,
      variant_label: p.variant_label,
      productId: p.product_id,
    }));
    onAddProducts(items);
    handleClose();
  };

  const validateCustom = () => {
    const errs: { name?: string; price?: string } = {};
    if (!name.trim()) errs.name = "Product name is required";
    if (price === "" || Number(price) <= 0) errs.price = "Price must be greater than 0";
    setCustomErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCustomAdd = () => {
    if (!validateCustom()) return;
    onAddCustomProduct({
      name: name.trim(),
      price: Number(price),
      quantity,
    });
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedProducts([]);
    setStockFilter("all");
    setName("");
    setPrice("");
    setQuantity(1);
    setIsTaxable(true);
    setIsPhysical(true);
    setWeight("");
    setCustomErrors({});
    setActiveTab(defaultTab);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-3xl max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold text-slate-900">
              Add Product
            </DialogTitle>
            <button
              onClick={handleClose}
              className="rounded-sm opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex mt-3 border-b -mb-4">
            {(["browse", "custom"] as Tab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 pb-3 text-sm font-medium transition-colors border-b-2 -mb-px",
                  activeTab === tab
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                )}
              >
                {tab === "browse" ? "Browse Products" : "Add Custom Product"}
              </button>
            ))}
          </div>
        </DialogHeader>

        {/* ============ BROWSE TAB ============ */}
        {activeTab === "browse" && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="px-5 pt-4 pb-3 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by product name, SKU, or category..."
                  className="pl-9 bg-slate-50 border-slate-200 text-sm"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2 mb-2">
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="h-8 text-xs w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stock</SelectItem>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Product List Table */}
            <div className="flex-1 overflow-hidden px-5 pb-2">
              <div className="h-full border border-slate-200 rounded-lg overflow-auto">
                 <GenericTable<ProductVariantRow>
                  data={filteredProducts}
                  loading={isLoading}
                  page={page}
                  totalPages={totalPages}
                  rowsPerPage={50} // Fixed as per existing default
                  totalItems={data?.total || 0}
                  onPageChange={setPage}
                  onRowsPerPageChange={() => {}} // Disabled for modal
                  getRowId={(row) => row.id}
                  selectable={true}
                  selectionMode="multiple"
                  externalSelectionIds={selectedProducts.map(p => p.id)}
                  onSelectionChange={setSelectedProducts}
                  columns={[
                     {
                       key: 'primary_image_url',
                       label: 'Image',
                       type: 'image',
                       className: 'w-16 px-2 py-2',
                       sortable: false,
                       render: (value: unknown, row: ProductVariantRow) => (
                         value ? (
                            <img src={value as string} alt={row.product_title} className="w-10 h-10 object-cover rounded-md" />
                         ) : (
                            <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                              <span className="text-slate-400 text-[10px]">No img</span>
                            </div>
                         )
                       )
                     },
                     {
                       key: 'product_title',
                       label: 'Product',
                       type: 'text',
                       sortable: false,
                       className: 'min-w-[250px]',
                       render: (_: unknown, row: ProductVariantRow) => (
                         <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-slate-900 text-sm leading-tight">{row.product_title}</span>
                            {row.is_variant && (
                               <Badge variant="outline" className="w-fit text-[10px] px-1.5 py-0 h-4 bg-slate-50 text-slate-600 border-slate-200 mt-0.5">
                                 {row.variant_label}
                               </Badge>
                            )}
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-xs text-indigo-500 font-mono">{row.sku}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-xs text-slate-400">{row.category_tier_1 || "Uncategorized"}</span>
                            </div>
                         </div>
                       )
                     },
                     {
                       key: 'selling_price',
                       label: 'Price',
                       type: 'currency',
                       sortable: false,
                       className: 'w-[100px] text-right',
                        render: (value: unknown) => (
                          <div className="flex justify-end">
                            <span className="text-sm font-medium text-slate-700">₹{parseFloat(value as string).toLocaleString("en-IN")}</span>
                          </div>
                       )
                     },
                     {
                       key: 'inventory_quantity',
                       label: 'Stock',
                       type: 'text',
                       sortable: false,
                       className: 'w-[100px] text-right',
                       render: (value: unknown) => (
                          <div className="flex justify-end pr-2">
                             <StockBadge stock={Number(value)} />
                          </div>
                       )
                     }
                  ]}
                />
              </div>
            </div>

            <Separator />
            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3">
              <span className="text-xs text-slate-500">
                {selectedProducts.length} selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} className="h-8 text-sm">
                  Cancel
                </Button>
                <Button
                  onClick={handleBrowseDone}
                  disabled={selectedProducts.length === 0}
                  className="h-8 text-sm bg-[#0E042F] hover:bg-[#0E042F]/90 text-white"
                >
                  Add {selectedProducts.length > 0 ? `(${selectedProducts.length})` : "Products"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ============ CUSTOM TAB ============ */}
        {activeTab === "custom" && (
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Product Name */}
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter product name"
                className={cn(
                  "bg-slate-50 border-slate-200",
                  customErrors.name && "border-red-500"
                )}
              />
              {customErrors.name && <p className="text-xs text-red-500 mt-1">{customErrors.name}</p>}
            </div>

            {/* Price + Quantity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Price (₹) <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={price}
                  onChange={(e) => setPrice(e.target.value === "" ? "" : parseFloat(e.target.value))}
                  placeholder="0.00"
                  className={cn("bg-slate-50 border-slate-200", customErrors.price && "border-red-500")}
                />
                {customErrors.price && <p className="text-xs text-red-500 mt-1">{customErrors.price}</p>}
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Quantity <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="bg-slate-50 border-slate-200"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is-taxable"
                  checked={isTaxable}
                  onCheckedChange={(v) => setIsTaxable(!!v)}
                  className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                />
                <label htmlFor="is-taxable" className="text-sm text-slate-700 cursor-pointer select-none">
                  Item is taxable (GST 18%)
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is-physical"
                  checked={isPhysical}
                  onCheckedChange={(v) => setIsPhysical(!!v)}
                  className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                />
                <label htmlFor="is-physical" className="text-sm text-slate-700 cursor-pointer select-none">
                  Item is a physical product (requires shipping)
                </label>
              </div>
            </div>

            {/* Weight (shown only if physical) */}
            {isPhysical && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Item Weight</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value === "" ? "" : parseFloat(e.target.value))}
                    placeholder="0"
                    className="bg-slate-50 border-slate-200"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Weight Unit</Label>
                  <Select value={weightUnit} onValueChange={setWeightUnit}>
                    <SelectTrigger className="bg-slate-50 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      <SelectItem value="g">Grams (g)</SelectItem>
                      <SelectItem value="lb">Pounds (lb)</SelectItem>
                      <SelectItem value="oz">Ounces (oz)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <Separator />

            {/* Footer */}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={handleClose} className="h-9">
                Cancel
              </Button>
              <Button
                onClick={handleCustomAdd}
                className="h-9 bg-[#0E042F] hover:bg-[#0E042F]/90 text-white gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add to Order
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
