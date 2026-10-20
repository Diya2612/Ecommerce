import { Package, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FormSection } from '@/components/forms';
import type { Order } from '../../types/customer.types';

interface OrdersOverviewSectionProps {
  orders: Order[];
  onViewOrder: (order: Order) => void;
}

export function OrdersOverviewSection({ orders, onViewOrder }: OrdersOverviewSectionProps) {
  const statusColors: Record<string, string> = {
    'Delivered': 'bg-green-100 text-green-700 border-green-200',
    'Cancelled': 'bg-red-100 text-red-700 border-red-200',
    'Processing': 'bg-blue-100 text-blue-700 border-blue-200',
    'Pending': 'bg-amber-100 text-amber-700 border-amber-200'
  };

  const ordersBadge = (
    <Badge variant="outline" className="text-slate-600 rounded-full px-3">
      Last {orders.length} Orders
    </Badge>
  );

  return (
    <FormSection icon={Package} title="Order Overview" actions={ordersBadge}>

      <div className="space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between p-4 bg-indigo-50/30 border border-indigo-100 rounded-xl hover:bg-indigo-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Package className="size-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Order #{order.id}</p>
                <p className="text-xs text-slate-600">{order.date} • {order.items} items</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge className={statusColors[order.status] || 'bg-slate-100 text-slate-700'}>
                {order.status}
              </Badge>
              <p className="font-semibold text-slate-900 min-w-[80px] text-right">{order.total}</p>
              <button
                onClick={() => onViewOrder(order)}
                className="size-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                aria-label="View order"
              >
                <Eye className="size-4 text-slate-600" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">
        View All Orders
      </button>
    </FormSection>
  );
}
