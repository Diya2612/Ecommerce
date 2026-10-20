import { useState } from 'react';
import { ShoppingCart, Send, Trash2, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FormSection } from '@/components/forms';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';

interface AbandonedProduct {
  id: string;
  name: string;
  quantity: number;
  price: string;
  image?: string;
}

interface AbandonedCartSectionProps {
  cartId?: string;
  abandonedOn?: string;
  totalValue?: string;
  products: AbandonedProduct[];
  onClearCart: () => void;
  onSendReminder: () => void;
  onDeleteProduct?: (productId: string) => void;
}

export function AbandonedCartsSection({
  cartId = 'CART-2024-001',
  abandonedOn = '2024-12-15 08:30 PM',
  totalValue = '₹47,498',
  products,
  onClearCart,
  onSendReminder,
  onDeleteProduct
}: AbandonedCartSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [showClearCartDialog, setShowClearCartDialog] = useState(false);

  const abandonmentBadge = products.length > 0 ? (
    <Badge className="bg-orange-100 text-orange-700 border-orange-200 rounded-full px-3">
      {products.length} Products
    </Badge>
  ) : null;

  return (
    <>
      <FormSection icon={ShoppingCart} title="Abandoned Cart" actions={abandonmentBadge}>

        {products.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No abandoned products
          </div>
        ) : (
          <div className="space-y-4">
            {/* Cart Info Header - Clickable to expand */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between p-3 bg-orange-50/50 border border-orange-100 rounded-xl hover:bg-orange-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-900">{cartId}</p>
                  <p className="text-xs text-slate-500">Abandoned on {abandonedOn}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-semibold text-orange-600 text-lg">{totalValue}</p>
                {isExpanded ? (
                  <ChevronUp className="size-5 text-slate-400" />
                ) : (
                  <ChevronDown className="size-5 text-slate-400" />
                )}
              </div>
            </button>

            {/* Products List - Expandable */}
            {isExpanded && (
              <>
                <div className="space-y-2">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Package className="size-5 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{product.name}</p>
                          <p className="text-xs text-slate-500">Qty: {product.quantity}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-slate-900">{product.price}</p>
                        <button
                          type="button"
                          onClick={() => setProductToDelete(product.id)}
                          className="size-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors opacity-0 group-hover:opacity-100"
                          aria-label={`Remove ${product.name}`}
                        >
                          <Trash2 className="size-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onSendReminder}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Send className="size-4" />
                    Send Reminder
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearCartDialog(true)}
                    className="size-9 rounded-lg bg-white border border-red-200 flex items-center justify-center hover:bg-red-50 transition-colors"
                    aria-label="Clear cart"
                  >
                    <Trash2 className="size-4 text-red-600" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </FormSection>

      {/* Delete Product Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={() => {
          if (productToDelete) {
            onDeleteProduct?.(productToDelete);
            setProductToDelete(null);
          }
        }}
        title="Remove Product"
        description="Are you sure you want to remove this product from the cart? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
        variant="destructive"
      />

      {/* Clear Cart Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showClearCartDialog}
        onClose={() => setShowClearCartDialog(false)}
        onConfirm={() => {
          onClearCart();
          setShowClearCartDialog(false);
        }}
        title="Clear Abandoned Cart"
        description="Are you sure you want to clear this abandoned cart? This will remove all products and cannot be undone."
        confirmText="Clear Cart"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
}
