import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DollarSign, AlertCircle } from 'lucide-react';
import { calculateOrderPricing, detectTaxType } from '../../utils/orderCalculations';
import type { PricingCalculatorProps } from '../../types';

export function PricingCalculator({
  items,
  shippingAddress,
  billingAddress,
  isInternational,
  currency,
  orderDiscount,
  onOrderDiscountChange,
  shippingCharge,
  onShippingChargeChange,
  codCharge,
  onCodChargeChange,
  paymentMethod,
  giftCard,
  onGiftCardChange,
  advancePaid,
  onAdvancePaidChange,
  taxRates,
  onTaxRatesChange,
  onPricingUpdate,
}: PricingCalculatorProps) {
  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₹';

  // Auto-detect tax type
  const taxType = detectTaxType(shippingAddress, billingAddress, isInternational);

  // Calculate pricing
  const pricing = calculateOrderPricing(
    items,
    orderDiscount.type,
    orderDiscount.value,
    taxType,
    taxRates.cgst,
    taxRates.sgst,
    taxRates.igst,
    shippingCharge,
    paymentMethod === 'cod' ? codCharge : 0,
    giftCard.amount,
    advancePaid
  );

  // Update parent whenever pricing changes
  useEffect(() => {
    onPricingUpdate(pricing);
  }, [
    items,
    orderDiscount,
    shippingCharge,
    codCharge,
    giftCard,
    advancePaid,
    taxRates,
    taxType,
  ]);

  const handleAutoDetectTax = () => {
    if (taxType === 'cgst_sgst' || taxType === 'igst') {
      onTaxRatesChange({ cgst: 9, sgst: 9, igst: 18 });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-6">
      <div className="flex items-center gap-2">
        <DollarSign className="size-5 text-slate-600" />
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Pricing, Shipping & Tax</h2>
          <p className="text-sm text-slate-600 mt-1">Additional charges and tax configuration</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Order-Level Discount */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-3 block">Order-Level Discount</Label>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <Label className="text-xs text-slate-600 mb-1.5 block">Discount Type</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={orderDiscount.type}
                onChange={(e) =>
                  onOrderDiscountChange(
                    e.target.value as '' | 'percentage' | 'fixed',
                    orderDiscount.value
                  )
                }
              >
                <option value="">No Discount</option>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ({currencySymbol})</option>
              </select>
            </div>

            <div>
              <Label className="text-xs text-slate-600 mb-1.5 block">Discount Value</Label>
              <Input
                type="number"
                placeholder="0"
                min={0}
                max={orderDiscount.type === 'percentage' ? 100 : undefined}
                value={orderDiscount.value || ''}
                onChange={(e) =>
                  onOrderDiscountChange(orderDiscount.type, parseFloat(e.target.value) || 0)
                }
              />
              <p className="text-xs text-slate-500 mt-1.5">
                {orderDiscount.type === 'percentage' ? 'Percentage value' : `Amount in ${currencySymbol}`}
              </p>
            </div>
          </div>

          {orderDiscount.type !== '' && orderDiscount.value > 0 && (
            <div className="p-3 bg-green-50 rounded-lg text-sm mt-4">
              <span className="text-green-700 font-medium">
                Order Discount: -{currencySymbol}
                {pricing.orderDiscount.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Shipping & Payment */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-3 block">Shipping & Payment</Label>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <Label className="text-xs text-slate-600 mb-1.5 block">Shipping Charge</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={shippingCharge || ''}
                onChange={(e) => onShippingChargeChange(parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-slate-500 mt-1.5">Delivery charges</p>
            </div>

            <div>
              <Label className="text-xs text-slate-600 mb-1.5 block">COD Charge</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={codCharge || ''}
                onChange={(e) => onCodChargeChange(parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-slate-500 mt-1.5">Cash on delivery fee</p>
            </div>

            <div>
              <Label className="text-xs text-slate-600 mb-1.5 block">Advance Payment</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={advancePaid || ''}
                onChange={(e) => onAdvancePaidChange(parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-slate-500 mt-1.5">Amount paid in advance</p>
            </div>

            <div>
              <Label className="text-xs text-slate-600 mb-1.5 block">Payment Method</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={paymentMethod}
                onChange={() => { }}
              >
                <option value="cod">Cash on Delivery</option>
                <option value="prepaid">Prepaid</option>
                <option value="partial">Partial Payment</option>
                <option value="credit">Credit Terms</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
            <div>
              <Label className="text-xs text-slate-600 mb-1.5 block">Gift Card Code</Label>
              <Input
                placeholder="Enter gift card code"
                value={giftCard.code}
                onChange={(e) => onGiftCardChange(e.target.value, giftCard.amount)}
              />
            </div>

            <div>
              <Label className="text-xs text-slate-600 mb-1.5 block">Gift Card Amount</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={giftCard.amount || ''}
                onChange={(e) => onGiftCardChange(giftCard.code, parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-slate-500 mt-1.5">Applied gift card value</p>
            </div>
          </div>
        </div>

        {/* Tax Details (Conditional) */}
        {!isInternational && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium text-slate-700">GST Tax Configuration</Label>
              {(shippingAddress || billingAddress) && (
                <Button type="button" size="sm" variant="outline" onClick={handleAutoDetectTax}>
                  Auto-Detect
                </Button>
              )}
            </div>

            {taxType === 'none' ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="size-5 text-slate-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-700">
                  <p className="font-medium mb-1">Tax Configuration Required</p>
                  <p>Select shipping and billing address to calculate tax, or use the Auto-Detect button.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                  <strong className="text-blue-900">Tax Type:</strong>{' '}
                  <span className="text-blue-700">
                    {taxType === 'cgst_sgst'
                      ? 'CGST + SGST (Intra-state)'
                      : 'IGST (Inter-state)'}
                  </span>
                </div>

                {taxType === 'cgst_sgst' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div>
                      <Label className="text-xs text-slate-600 mb-1.5 block">CGST Rate (%)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={50}
                        step={0.1}
                        value={taxRates.cgst}
                        onChange={(e) =>
                          onTaxRatesChange({
                            ...taxRates,
                            cgst: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                      <p className="text-xs text-slate-500 mt-1.5">Central GST rate</p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600 mb-1.5 block">SGST Rate (%)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={50}
                        step={0.1}
                        value={taxRates.sgst}
                        onChange={(e) =>
                          onTaxRatesChange({
                            ...taxRates,
                            sgst: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                      <p className="text-xs text-slate-500 mt-1.5">State GST rate</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label className="text-xs text-slate-600 mb-1.5 block">IGST Rate (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={50}
                      step={0.1}
                      value={taxRates.igst}
                      onChange={(e) =>
                        onTaxRatesChange({
                          ...taxRates,
                          igst: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <p className="text-xs text-slate-500 mt-1.5">Integrated GST rate</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
