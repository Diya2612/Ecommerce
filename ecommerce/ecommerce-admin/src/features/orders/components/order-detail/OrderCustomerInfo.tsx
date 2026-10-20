import { User } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Customer } from "@/features/orders/types";

interface OrderCustomerInfoProps {
  customer: Customer;
}

export const OrderCustomerInfo = ({ customer }: OrderCustomerInfoProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <User className="size-5 text-icon-muted" />
        <h2 className="font-semibold text-slate-900">
          Customer Information
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs text-slate-600">Name</p>
          <p className="font-medium text-slate-900 mt-1">{customer.name}</p>
        </div>
        <div>
          <p className="text-xs text-slate-600">Email</p>
          <p className="font-medium text-slate-900 mt-1">{customer.email}</p>
        </div>
        <div>
          <p className="text-xs text-slate-600">Phone</p>
          <p className="font-medium text-slate-900 mt-1">{customer.phone}</p>
        </div>
        {customer.gstin && (
          <div>
            <p className="text-xs text-slate-600">GSTIN</p>
            <p className="font-medium text-slate-900 mt-1">{customer.gstin}</p>
          </div>
        )}
      </div>
    </Card>
  );
};
