import { X, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface OrderItem {
  id: string;
  orderNumber: string;
  date: string;
  itemCount: number;
  status: 'Delivered' | 'Cancelled' | 'Pending' | 'Processing';
  amount: number;
}

interface AllOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderItem[];
  onViewOrder?: (orderId: string) => void;
  customerName?: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const statusColors: Record<OrderItem['status'], string> = {
  Delivered: 'bg-green-50 text-green-700 border-green-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
  Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Processing: 'bg-blue-50 text-blue-700 border-blue-200',
};

export function AllOrdersModal({
  isOpen,
  onClose,
  orders,
  onViewOrder,
  customerName,
  currentPage,
  totalPages,
  onPageChange,
  isLoading
}: AllOrdersModalProps) {
  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Package className="size-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">All Orders</h2>
              <p className="text-sm text-slate-600">{customerName ? `Orders for ${customerName}` : `${orders.length} total orders`}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="size-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Package className="size-12 mx-auto text-slate-300 mb-3" />
              <p>No orders found</p>
            </div>
          ) : (
            <div className="min-w-full inline-block align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50 sticky top-0 z-10">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Order Number
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider text-right">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-50 transition-colors group cursor-pointer"
                        onClick={() => onViewOrder?.(order.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                          #{order.orderNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {formatDate(order.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusColors[order.status]}`}
                          >
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-600 text-right">
                          {formatCurrency(order.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (order.id) onViewOrder?.(order.id);
                            }}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
            <p className="text-sm text-slate-600">
              Page <span className="font-medium text-slate-900">{currentPage}</span> of{' '}
              <span className="font-medium text-slate-900">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
                className="h-8 px-3 rounded-lg text-xs"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoading}
                className="h-8 px-3 rounded-lg text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
