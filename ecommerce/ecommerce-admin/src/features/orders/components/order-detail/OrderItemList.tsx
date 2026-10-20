import { Truck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { OrderItem } from "@/features/orders/types";
import { formatCurrency } from "@/features/orders/utils/orderCalculations";

interface OrderItemListProps {
  items: OrderItem[];
  currencySymbol: string;
  fulfillmentStatus: string;
  deliveryPartner?: string;
  trackingNumber?: string;
}

export const OrderItemList = ({
  items,
  currencySymbol,
  fulfillmentStatus,
  deliveryPartner,
  trackingNumber,
}: OrderItemListProps) => {
  return (
    <Card className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="size-5 text-icon-muted" />
            <div>
              <h2 className="font-semibold text-slate-900">
                Order Details
              </h2>
              <p className="text-sm font-medium text-slate-500 capitalize">
                {fulfillmentStatus}
              </p>
            </div>
          </div>
        </div>

        {(deliveryPartner || trackingNumber) && (
          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            {deliveryPartner && (
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-slate-700">Delivery:</span>
                {deliveryPartner}
              </div>
            )}
            {trackingNumber && (
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-slate-700">Tracking:</span>
                <span className="font-mono">{trackingNumber}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-md border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead className="text-slate-700 font-medium">
                Product
              </TableHead>
              <TableHead className="text-slate-700 font-medium">SKU</TableHead>
              <TableHead className="text-slate-700 font-medium text-center">
                Qty
              </TableHead>
              <TableHead className="text-slate-700 font-medium text-right">
                Price
              </TableHead>
              <TableHead className="text-slate-700 font-medium text-right">
                Discount
              </TableHead>
              <TableHead className="text-slate-700 font-medium text-right">
                Total
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const itemTotal =
                item.costPrice * item.quantity -
                (item.discountType === "percentage"
                  ? (item.costPrice * item.quantity * item.discountValue) / 100
                  : item.discountValue);

              return (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.productImage ? (
                      <div className="size-10 rounded-md overflow-hidden bg-slate-100">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="size-10 bg-slate-100 rounded-md flex items-center justify-center text-slate-400 text-xs">
                        Img
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {item.productName}
                  </TableCell>
                  <TableCell className="text-slate-500 font-mono text-xs">
                    {item.productSku}
                  </TableCell>
                  <TableCell className="text-center text-slate-900">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-right text-slate-900">
                    {formatCurrency(item.costPrice, "INR").replace(
                      "₹",
                      currencySymbol,
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.discountValue > 0 ? (
                      <Badge
                        variant="secondary"
                        className="text-green-600 bg-green-50"
                      >
                        {item.discountType === "percentage"
                          ? `${item.discountValue}%`
                          : formatCurrency(item.discountValue, "INR").replace(
                              "₹",
                              currencySymbol,
                            )}
                      </Badge>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-slate-900">
                    {formatCurrency(itemTotal, "INR").replace(
                      "₹",
                      currencySymbol,
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
