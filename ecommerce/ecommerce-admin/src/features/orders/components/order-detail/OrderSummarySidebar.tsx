import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/features/orders/utils/orderCalculations';
import type { Order, OrderFormData } from '@/features/orders/types';

interface OrderSummarySidebarProps {
  order: Order | OrderFormData;
  currency: string;
}

// Type guard to check if order has pricing details
const hasDetailedPricing = (order: Order | OrderFormData): order is OrderFormData => {
  return 'pricing' in order && order.pricing !== undefined;
};

export const OrderSummarySidebar = ({ order, currency }: OrderSummarySidebarProps) => {
  // Calculate items count
  const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  // Get grand total - works for both types
  const grandTotal = hasDetailedPricing(order)
    ? order.pricing.grandTotal
    : order.grandTotal;

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h2>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Sales Channel</span>
            <span className="font-medium capitalize">{order.salesChannel}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Items</span>
            <span className="font-medium">{itemsCount}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Currency</span>
            <span className="font-medium">{currency}</span>
          </div>

          <Separator />

          {/* Pricing Breakdown - only show detailed if available */}
          {hasDetailedPricing(order) ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span>{formatCurrency(order.pricing.subtotal, order.currency)}</span>
              </div>

              {order.pricing.productDiscountsTotal > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Product Discounts</span>
                  <span>-{formatCurrency(order.pricing.productDiscountsTotal, order.currency)}</span>
                </div>
              )}

              {order.pricing.orderDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Order Discount</span>
                  <span>-{formatCurrency(order.pricing.orderDiscount, order.currency)}</span>
                </div>
              )}

              {order.pricing.taxType !== 'none' && (
                <>
                  {order.pricing.taxType === 'cgst_sgst' ? (
                    <>
                      <div className="flex justify-between">
                        <span>CGST ({order.pricing.cgstRate}%)</span>
                        <span>{formatCurrency(order.pricing.cgst, order.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SGST ({order.pricing.sgstRate}%)</span>
                        <span>{formatCurrency(order.pricing.sgst, order.currency)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span>IGST ({order.pricing.igstRate}%)</span>
                      <span>{formatCurrency(order.pricing.igst, order.currency)}</span>
                    </div>
                  )}
                </>
              )}

              {order.pricing.shippingCharge > 0 && (
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{formatCurrency(order.pricing.shippingCharge, order.currency)}</span>
                </div>
              )}

              {order.pricing.codCharge > 0 && (
                <div className="flex justify-between">
                  <span>COD Charge</span>
                  <span>{formatCurrency(order.pricing.codCharge, order.currency)}</span>
                </div>
              )}

              {order.pricing.giftCardAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Gift Card</span>
                  <span>-{formatCurrency(order.pricing.giftCardAmount, order.currency)}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discountAmount, order.currency)}</span>
                </div>
              )}
              {order.deliveryPrice > 0 && (
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>{formatCurrency(order.deliveryPrice, order.currency)}</span>
                </div>
              )}
            </div>
          )}

          <Separator />

          <div className="flex justify-between font-bold text-lg text-purple-600">
            <span>Grand Total</span>
            <span>{formatCurrency(grandTotal, currency as 'INR' | 'USD' | 'EUR')}</span>
          </div>

          {hasDetailedPricing(order) && order.pricing.advancePaid > 0 && (
            <>
              <Separator />
              <div className="p-3 bg-blue-50 rounded-lg space-y-1 text-sm">
                <div className="flex justify-between text-blue-600">
                  <span>Advance Paid</span>
                  <span className="font-medium">
                    {formatCurrency(order.pricing.advancePaid, order.currency)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-blue-900">
                  <span>Balance Due</span>
                  <span>{formatCurrency(order.pricing.balanceDue, order.currency)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Order Timeline */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="size-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-900">Timeline</h2>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <p className="text-slate-500">Created</p>
            <p className="font-medium text-slate-900">
              {format(new Date(order.createdOn), 'PPP p')}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Last Updated</p>
            <p className="font-medium text-slate-900">
              {format(new Date(order.lastModified), 'PPP p')}
            </p>
          </div>
        </div>
      </Card>

      {/* Tags - only for OrderFormData */}
      {hasDetailedPricing(order) && order.orderTags && order.orderTags.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {order.orderTags.map((tag: string) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
