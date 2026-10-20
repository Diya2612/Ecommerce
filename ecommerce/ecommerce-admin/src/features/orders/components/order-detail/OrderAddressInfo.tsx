import { MapPin, CreditCard } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Address } from "@/features/orders/types";

interface OrderAddressInfoProps {
  shippingAddress: Address | null;
  billingAddress: Address | null;
}

export const OrderAddressInfo = ({
  shippingAddress,
  billingAddress,
}: OrderAddressInfoProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Shipping Address */}
      {shippingAddress && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="size-5 text-icon-muted" />
            <h2 className="font-semibold text-slate-900">
              Shipping Address
            </h2>
          </div>
          <div className="space-y-1 text-sm">
            <p className="font-medium text-slate-900">
              {shippingAddress.label}
            </p>
            <p className="text-slate-600">{shippingAddress.address}</p>
            <p className="text-slate-600">
              {shippingAddress.city}, {shippingAddress.state}{" "}
              {shippingAddress.pincode}
            </p>
          </div>
        </Card>
      )}

      {/* Billing Address */}
      {billingAddress && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="size-5 text-icon-muted" />
            <h2 className="font-semibold text-slate-900">
              Billing Address
            </h2>
          </div>
          <div className="space-y-1 text-sm">
            <p className="font-medium text-slate-900">{billingAddress.label}</p>
            <p className="text-slate-600">{billingAddress.address}</p>
            <p className="text-slate-600">
              {billingAddress.city}, {billingAddress.state}{" "}
              {billingAddress.pincode}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
