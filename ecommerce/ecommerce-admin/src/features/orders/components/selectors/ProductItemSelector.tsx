import { useState, useEffect } from 'react';
import { Search, Plus, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useProductSearch } from '../../hooks/useOrdersApi';
import type { Product } from '@/features/products/types';
import type { OrderItem } from '../../types';
import type { ProductItemSelectorProps } from '../../types';

// Extended product type for search results
interface ProductSearchResult extends Partial<Product> {
  stock_quantity?: number;
  name?: string;
  image_url?: string;
  price?: string;
}

export function ProductItemSelector({ onAddItem, selectedProductIds }: ProductItemSelectorProps) {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductSearchResult | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [discountType, setDiscountType] = useState<'' | 'percentage' | 'fixed'>('');
  const [discountValue, setDiscountValue] = useState(0);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch products using the optimized search hook
  const { data: searchResponse, isLoading } = useProductSearch({
    query: debouncedSearch,
    check_stock: true
  });

  const products = (searchResponse?.products || []) as ProductSearchResult[];

  const filteredProducts = products.filter(
    (product) => !selectedProductIds.includes(product.sku || '')
  );

  const handleSelectProduct = (product: ProductSearchResult) => {
    setSelectedProduct(product);
    setQuantity(1);
    setDiscountType('');
    setDiscountValue(0);
  };

  const handleAddToOrder = () => {
    if (!selectedProduct) return;

    // Use stock quantity from search result or simplified product
    const stock = selectedProduct.stock_quantity || 0;

    const item: OrderItem = {
      id: `ITEM-${Date.now()}`,
      // Handle both full product object and search result shape
      productId: selectedProduct.id || '',
      productName: selectedProduct.name || selectedProduct.product_title || 'Unknown Product',
      productSku: selectedProduct.sku || '',
      productImage: selectedProduct.image_url || selectedProduct.primary_image_url || '',
      quantity,
      costPrice: parseFloat(selectedProduct.price || selectedProduct.selling_price || '0'),
      discountType,
      discountValue,
      availableStock: stock,
    };

    onAddItem(item);
    setSelectedProduct(null);
    setShowModal(false);
    setSearchQuery('');
  };

  const calculateFinalPrice = () => {
    if (!selectedProduct) return 0;
    const basePrice = parseFloat(selectedProduct.selling_price || selectedProduct.price || '0') * quantity;
    if (discountType === 'percentage') {
      return basePrice - (basePrice * discountValue) / 100;
    } else if (discountType === 'fixed') {
      return basePrice - discountValue;
    }
    return basePrice;
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0)
      return <Badge variant="destructive">Out of Stock</Badge>;
    if (stock < 10)
      return <Badge variant="outline" className="text-amber-600 border-amber-300">Low Stock</Badge>;
    return <Badge variant="secondary">In Stock</Badge>;
  };

  return (
    <>
      <Button type="button" onClick={() => setShowModal(true)} className="w-full sm:w-auto">
        <Plus className="mr-2 size-4" />
        Add Product
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Product to Order</DialogTitle>
            <DialogDescription>Search and select products to add to this order</DialogDescription>
          </DialogHeader>

          {!selectedProduct ? (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, SKU, or category..."
                  className="pl-10"
                />
              </div>

              {/* Product List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="size-8 animate-spin text-slate-400" />
                  </div>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-4 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => handleSelectProduct(product)}
                    >
                      <div className="flex items-start gap-4">
                        {/* Product Image */}
                        {(product.primary_image_url || product.image_url) ? (
                          <img
                            src={product.primary_image_url || product.image_url || ''}
                            alt={product.product_title || product.name || 'Product'}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-slate-100 rounded-md flex items-center justify-center">
                            <Package className="size-8 text-slate-400" />
                          </div>
                        )}

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-semibold text-slate-900">{product.product_title || product.name}</h4>
                              <p className="text-sm text-slate-500 mt-0.5">SKU: {product.sku}</p>
                              <p className="text-sm text-slate-600 mt-1">{product.category_tier_1 || ''}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-slate-900">
                                ₹{parseFloat(product.selling_price || product.price || '0').toFixed(2)}
                              </div>
                              <div className="mt-2">{getStockBadge(product.stock_quantity || 0)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <Package className="size-12 mx-auto mb-3 opacity-30" />
                    <p>No products found</p>
                    <p className="text-sm mt-1">Try adjusting your search</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Product Configuration */
            <div className="space-y-6">
              {/* Selected Product Display */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-start gap-4">
                  {(selectedProduct.primary_image_url || selectedProduct.image_url) ? (
                    <img
                      src={selectedProduct.primary_image_url || selectedProduct.image_url || ''}
                      alt={selectedProduct.product_title || selectedProduct.name || 'Product'}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-slate-200 rounded-md flex items-center justify-center">
                      <Package className="size-10 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{selectedProduct.product_title || selectedProduct.name}</h4>
                    <p className="text-sm text-slate-500 mt-0.5">SKU: {selectedProduct.sku}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-lg font-bold">₹{parseFloat(selectedProduct.selling_price || selectedProduct.price || '0').toFixed(2)}</span>
                      {getStockBadge(selectedProduct.stock_quantity || 0)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  max={selectedProduct.stock_quantity || 0}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(selectedProduct.stock_quantity || 0, parseInt(e.target.value) || 1)))}
                />
                <p className="text-sm text-slate-500 mt-1">
                  Available: {selectedProduct.stock_quantity || 0} units
                </p>
              </div>

              {/* Discount Type */}
              <div>
                <Label htmlFor="discount-type">Discount Type</Label>
                <select
                  id="discount-type"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={discountType}
                  onChange={(e) => {
                    setDiscountType(e.target.value as '' | 'percentage' | 'fixed');
                    setDiscountValue(0);
                  }}
                >
                  <option value="">No Discount</option>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              {/* Discount Value */}
              {discountType !== '' && (
                <div>
                  <Label htmlFor="discount-value">
                    Discount Value {discountType === 'percentage' ? '(%)' : '(₹)'}
                  </Label>
                  <Input
                    id="discount-value"
                    type="number"
                    min={0}
                    max={discountType === 'percentage' ? 100 : parseFloat(selectedProduct.selling_price || selectedProduct.price || '0') * quantity}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  />
                </div>
              )}

              {/* Price Summary */}
              <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-medium">
                    ₹{(parseFloat(selectedProduct.selling_price || selectedProduct.price || '0') * quantity).toFixed(2)}
                  </span>
                </div>
                {discountType !== '' && discountValue > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span>
                      -₹
                      {discountType === 'percentage'
                        ? ((parseFloat(selectedProduct.selling_price || selectedProduct.price || '0') * quantity * discountValue) / 100).toFixed(2)
                        : discountValue.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Final Price:</span>
                  <span className="text-purple-600">₹{calculateFinalPrice().toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleAddToOrder}
                  // Phase 2A: Remove stock validation until inventory queries implemented
                  disabled={quantity < 1}
                >
                  Add to Order
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedProduct(null)}
                >
                  Back
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
