import { useState, useEffect } from "react";
import { Search, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GenericTable } from "@/components/data-table";
import { useProductsWithVariants, type ProductVariantRow } from "@/features/orders/hooks/useProductsWithVariants";
import { cn } from "@/lib/utils";

// Inner interface for the modal's display
// ProductSelectionItem extends the shared Product type but adds order-specific fields
interface ProductSelectionItem {
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



interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  // products prop removed as we fetch internally
  onAddProducts: (products: ProductSelectionItem[]) => void;
}

export function ProductSelectionModal({
  isOpen,
  onClose,
  onAddProducts,
}: ProductSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<ProductVariantRow[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch products with variants expanded
  const { data, isLoading } = useProductsWithVariants({
    page,
    limit: rowsPerPage,
    search: debouncedQuery,
    sortBy: sortKey,
    sortOrder: sortDirection,
  });

  // Calculate pagination
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;
  const products = data?.products || [];

  const selectedIds = selectedProducts.map(p => p.id);

  const handleSelectionIdsChange = (ids: string[]) => {
    // Find the products that match the ids, but since we may not have all products loaded, we need to keep the existing selectedProducts and update based on current page
    const currentPageProducts = products.filter(p => ids.includes(p.id));
    const otherSelected = selectedProducts.filter(p => !products.some(cp => cp.id === p.id));
    setSelectedProducts([...otherSelected, ...currentPageProducts]);
  };

  const handleSortChange = (key: string, direction: "asc" | "desc") => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const handleDone = () => {
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

  const handleClose = () => {
    setSelectedProducts([]);
    setSearchQuery("");
    setPage(1);
    onClose();
  };

  // Define columns for GenericTable
  const columns = [
    {
      key: "primary_image_url",
      label: "Image",
      type: "image" as const,
      sortable: false,
    },
    {
      key: "product_title",
      label: "Product",
      sortable: true,
      render: (_value: unknown, row: ProductVariantRow) => (
        <div>
          <div className="font-medium text-sm text-slate-900">{row.product_title}</div>
          {row.variant_label && (
            <div className="flex items-center gap-1 mt-0.5">
              <Package className="size-3 text-slate-400" />
              <span className="text-xs text-slate-600">{row.variant_label}</span>
            </div>
          )}
          <div className="text-xs text-slate-500">{row.category_tier_1 || "Uncategorized"}</div>
        </div>
      )
    },
    {
      key: "sku",
      label: "SKU",
      sortable: true,
    },
    {
      key: "selling_price",
      label: "Price",
      type: "currency" as const,
      sortable: true,
    },
    {
      key: "inventory_quantity",
      label: "Stock",
      sortable: true,
      render: (_val: any, row: ProductVariantRow) => {
        const stock = row.inventory_quantity || 0;
        return (
          <Badge 
            variant={stock > 0 ? "default" : "destructive"} 
            className={cn(
              "text-xs font-medium",
              stock > 0 && "bg-green-100 text-green-800 hover:bg-green-100",
              stock === 0 && "bg-red-100 text-red-800 hover:bg-red-100"
            )}
          >
            {stock} in stock
          </Badge>
        );
      }
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-6">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle>Select Products</DialogTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by product name, SKU, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 py-4 flex flex-col">
          {/* Reuse GenericTable */}
          <GenericTable
            data={products}
            loading={isLoading}
            page={page}
            totalPages={totalPages}
            totalItems={total}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
            getRowId={(row) => row.id}
            columns={columns}
            selectable={true}
            selectionMode="multiple"
            externalSelectionIds={selectedIds}
            onSelectionIdsChange={handleSelectionIdsChange}
            selectOnRowClick={true}
            forceTableOnMobile={true}
            fullHeight={true}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
            emptyState={
              <div className="text-center py-8 text-slate-500">
                No products found.
              </div>
            }
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-slate-600">
            {selectedProducts.length} product{selectedProducts.length !== 1 ? "s" : ""} selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleDone}
              disabled={selectedProducts.length === 0}
              className="bg-[#0e042f] hover:bg-[#0e042f]/90"
            >
              Add {selectedProducts.length > 0 ? `(${selectedProducts.length})` : ""} Products
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
