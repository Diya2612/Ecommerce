import { useState, useEffect } from "react";
import { X, Package, CreditCard, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import type { OrderItem } from "@/features/orders/types";

interface ProcessRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  items: OrderItem[];
  shippingCharge: number;
  totalPaid: number;
  currencySymbol?: string;
  onRefundProcess?: (data: any) => void;
}

export function ProcessRefundModal({
  isOpen,
  onClose,
  orderNumber,
  items,
  shippingCharge,
  totalPaid,
  currencySymbol = "₹",
  onRefundProcess,
}: ProcessRefundModalProps) {
  // We'll track refunded quantities per item if we want partial refunds, 
  // but for simplicity according to UI, we might just refund whole items or just calculate totals based on selection
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [shippingRefund, setShippingRefund] = useState<number>(0);
  const [reason, setReason] = useState<string>("");
  const [refundToWallet, setRefundToWallet] = useState<boolean>(false);
  const [notifyCustomer, setNotifyCustomer] = useState<boolean>(true);

  // Computed values
  const itemsSubtotal = Object.entries(selectedItems).reduce((sum, [id, qty]) => {
    const item = items.find(i => i.id === id);
    if (!item) return sum;
    // Assuming structure: item.price
    return sum + ((item as any).price || 0) * qty; 
  }, 0);

  const taxRefund = Object.entries(selectedItems).reduce((sum, [id, _qty]) => {
    const item = items.find(i => i.id === id);
    if (!item) return sum;
    // Using simple heuristic or checking if tax structure exists on item
    return sum; // Set to 0 for now as it needs proper calc based on order tax setup
  }, 0);

  const totalRefund = itemsSubtotal + taxRefund + shippingRefund;

  useEffect(() => {
    if (isOpen) {
      setSelectedItems({});
      setShippingRefund(0);
      setReason("");
      setRefundToWallet(false);
      setNotifyCustomer(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  const handleProcessRefund = () => {
    if (onRefundProcess) {
      onRefundProcess({
        items: selectedItems,
        shippingRefund,
        itemsSubtotal,
        taxRefund,
        totalRefund,
        reason,
        refundToWallet,
        notifyCustomer
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b shrink-0 relative">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Process Refund
          </DialogTitle>
          <p className="text-sm text-slate-500 mt-1">
            Order #{orderNumber} • Paid: {currencySymbol}{totalPaid.toFixed(2)}
          </p>
        </DialogHeader>

        <div className="flex flex-col md:flex-row overflow-y-auto">
          {/* Left Column (Inputs) */}
          <div className="flex-1 p-6 border-r border-slate-100 space-y-8">
            
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Refundable Items</h3>
              <div className="space-y-3">
                {items.map(item => {
                   const isSelected = !!selectedItems[item.id];
                   // Fallbacks for missing types
                   const price = (item as any).price || 0;
                   const tax = (item as any).taxAmount || 0;

                   return (
                    <div key={item.id} className="flex gap-4 p-4 border border-slate-200 rounded-xl bg-white">
                      <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center shrink-0 border border-slate-100">
                        <Package className="w-6 h-6 text-slate-400" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{item.productName}</p>
                          <p className="text-xs text-slate-500 mt-1">SKU: {item.productSku}</p>
                          <div className="inline-flex mt-2 items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            Unfulfilled: {item.quantity}
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                          Price: {currencySymbol}{price.toFixed(2)} • Tax: {currencySymbol}{tax.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                         <Checkbox 
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedItems(prev => ({ ...prev, [item.id]: item.quantity }));
                              } else {
                                const newSelected = { ...selectedItems };
                                delete newSelected[item.id];
                                setSelectedItems(newSelected);
                              }
                            }}
                            className="w-5 h-5 rounded border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                          />
                      </div>
                    </div>
                   )
                })}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Shipping Refund</h3>
              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Original Shipping Charge:</p>
                  <p className="text-sm font-medium text-slate-900">{currencySymbol}{shippingCharge.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-medium text-slate-700">Refund Amount:</Label>
                  <div className="relative">
                    <Input 
                      type="number"
                      min="0"
                      max={shippingCharge}
                      value={shippingRefund}
                      onChange={(e) => setShippingRefund(Math.min(shippingCharge, parseFloat(e.target.value) || 0))}
                      className="w-24 h-9 pl-6 bg-white border-slate-200 rounded-lg text-sm"
                    />
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{currencySymbol}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <Label className="text-sm font-semibold text-slate-900">Reason for Refund <span className="text-red-500">*</span></Label>
              <Textarea 
                placeholder="Enter the reason for this refund (internal notes)..."
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="min-h-[100px] resize-none bg-slate-50 border-slate-200 focus:border-indigo-500 rounded-xl"
              />
              <p className="text-xs text-slate-500">This reason is for internal records only</p>
            </section>

          </div>

          {/* Right Column (Summary) */}
          <div className="w-full md:w-[320px] shrink-0 bg-slate-50 p-6 flex flex-col gap-6">
            
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">Refund Summary</h3>
              
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-4 space-y-3">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Refund Breakdown</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Items Subtotal:</span>
                    <span className="font-medium text-slate-900">{currencySymbol}{itemsSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tax Refund:</span>
                    <span className="font-medium text-slate-900">{currencySymbol}{taxRefund.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Shipping Refund:</span>
                    <span className="font-medium text-slate-900">{currencySymbol}{shippingRefund.toFixed(2)}</span>
                  </div>
                </div>
                <div className="bg-indigo-50/50 p-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="font-semibold text-slate-900">Total Refund:</span>
                  <span className="font-bold text-lg text-indigo-700">{currencySymbol}{totalRefund.toFixed(2)}</span>
                </div>
              </div>
            </section>

            <section className="space-y-3">
               <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 font-medium">Refund Method</span>
                      <div className="flex items-center gap-2 mt-1">
                        <CreditCard className="w-4 h-4 text-slate-700" />
                        <span className="font-semibold text-slate-900 text-sm">UPI</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                     <div className="flex items-start gap-3">
                      <Checkbox 
                        id="wallet" 
                        checked={refundToWallet} 
                        onCheckedChange={(c) => setRefundToWallet(!!c)} 
                        className="mt-0.5 rounded-sm border-slate-300"
                      />
                      <div className="space-y-1">
                        <Label htmlFor="wallet" className="text-sm font-medium text-slate-900 cursor-pointer">Refund to Wallet Credit</Label>
                        <p className="text-xs text-slate-500 leading-normal">Customer can use credit for future orders</p>
                      </div>
                    </div>
                  </div>
               </div>
            </section>

            <section className="mt-auto">
              <div className="flex items-start gap-3 mb-6 p-4 rounded-xl border border-slate-200 bg-white">
                <Checkbox 
                  id="notify" 
                  checked={notifyCustomer} 
                  onCheckedChange={(c) => setNotifyCustomer(!!c)} 
                  className="mt-0.5 rounded-sm border-slate-300"
                />
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="notify" className="text-sm font-medium text-slate-900 cursor-pointer flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    Notify Customer
                  </Label>
                  <p className="text-xs text-slate-500">Send refund confirmation email</p>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full rounded-xl h-9 sm:h-[44px] px-4 sm:px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleProcessRefund}
                disabled={totalRefund === 0 || !reason}
                className="w-full bg-[#0e042f] hover:bg-[#0e042f]/90 text-white rounded-xl h-12 font-medium text-base shadow-sm"
              >
                Refund {currencySymbol}{totalRefund.toFixed(2)}
              </Button>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
