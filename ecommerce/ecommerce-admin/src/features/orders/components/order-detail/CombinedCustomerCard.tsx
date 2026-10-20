import { User, Truck, ReceiptText } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Customer, Address } from "@/features/orders/types";

interface CombinedCustomerCardProps {
  customer: Customer;
  shippingAddress: Address | null;
  billingAddress: Address | null;
}

export function CombinedCustomerCard({
  customer,
  shippingAddress,
  billingAddress,
}: CombinedCustomerCardProps) {
  return (
    <Card className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
      {/* Customer Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <User className="size-5 text-icon-muted" />
            <h3 className="font-semibold text-slate-900">Customer</h3>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-semibold text-lg shrink-0 border border-slate-200">
            {customer.name?.charAt(0).toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {customer.name}
            </p>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {customer.email}
            </p>
            <p className="text-xs text-slate-500 truncate">{customer.phone}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100" />

      {/* Shipping Address Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Truck className="size-5 text-icon-muted" />
          <h3 className="text-sm font-medium text-slate-700">
            Shipping Address
          </h3>
        </div>

        {shippingAddress ? (
          <div className="text-sm text-slate-600 space-y-0.5">
            {shippingAddress.label && (
              <p className="font-semibold text-slate-900">
                {shippingAddress.label}
              </p>
            )}
            <p className="text-slate-700">{shippingAddress.address}</p>
            <p className="text-slate-700">
              {shippingAddress.city}, {shippingAddress.state}{" "}
              {shippingAddress.pincode}
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">No address selected</p>
        )}
      </div>

      <div className="border-t border-slate-100" />

      {/* Billing Address Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ReceiptText className="size-5 text-icon-muted" />
          <h3 className="text-sm font-medium text-slate-700">
            Billing Address
          </h3>
        </div>

        {billingAddress ? (
          <div className="text-sm text-slate-600 space-y-0.5">
            {billingAddress.label && (
              <p className="font-semibold text-slate-900">
                {billingAddress.label}
              </p>
            )}
            <p className="text-slate-700">{billingAddress.address}</p>
            <p className="text-slate-700">
              {billingAddress.city}, {billingAddress.state}{" "}
              {billingAddress.pincode}
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">No address selected</p>
        )}
      </div>
    </Card>
  );
}
