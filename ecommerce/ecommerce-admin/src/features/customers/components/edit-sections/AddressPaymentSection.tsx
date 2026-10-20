import { MapPin, CreditCard, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FormSection } from '@/components/forms';
import type { EditAddress, PaymentMethod } from '../../types/customer.types';

interface AddressPaymentSectionProps {
  addresses: EditAddress[];
  paymentMethods: PaymentMethod[];
  onAddAddress: () => void;
  onAddPayment: () => void;
  onViewAllAddresses: () => void;
  onViewAllPayments: () => void;
}

export function AddressPaymentSection({ addresses, paymentMethods, onAddAddress, onAddPayment, onViewAllAddresses, onViewAllPayments }: AddressPaymentSectionProps) {
  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
  const defaultPayment = paymentMethods.find(p => p.isDefault) || paymentMethods[0];

  return (
    <FormSection icon={MapPin} title="Address & Payment">

      <div className="space-y-5">
        {/* Default Address */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium text-slate-700">Default Address</Label>
            <Button variant="ghost" size="sm" onClick={onAddAddress} className="h-7 text-xs">
              <Plus className="size-3 mr-1" />
              Add
            </Button>
          </div>
          {defaultAddress ? (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="font-medium text-slate-900 text-sm">{defaultAddress.name}</p>
                <Badge variant="outline" className="text-xs capitalize">{defaultAddress.type}</Badge>
              </div>
              <p className="text-sm text-slate-600">
                {defaultAddress.address}, {defaultAddress.city}
              </p>
              <p className="text-sm text-slate-600">
                {defaultAddress.state} - {defaultAddress.pincode}
              </p>
              <p className="text-xs text-slate-500 mt-1">{defaultAddress.phone}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No address added</p>
          )}

          {/* View Other Addresses Button */}
          {addresses.length > 1 && (
            <button
              onClick={onViewAllAddresses}
              className="w-full mt-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              View Other Addresses ({addresses.length - 1})
            </button>
          )}
        </div>

        {/* Default Payment */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium text-slate-700">Default Payment</Label>
            <Button variant="ghost" size="sm" onClick={onAddPayment} className="h-7 text-xs">
              <Plus className="size-3 mr-1" />
              Add
            </Button>
          </div>
          {defaultPayment ? (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="size-4 text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{defaultPayment.name}</p>
                    <p className="text-sm text-slate-600">{defaultPayment.details}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs capitalize">{defaultPayment.type}</Badge>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No payment method added</p>
          )}

          {/* View Other Credit Cards Button */}
          {paymentMethods.length > 1 && (
            <button
              onClick={onViewAllPayments}
              className="w-full mt-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              View Other Credit Cards ({paymentMethods.length - 1})
            </button>
          )}
        </div>
      </div>
    </FormSection>
  );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <label className={className}>{children}</label>;
}
