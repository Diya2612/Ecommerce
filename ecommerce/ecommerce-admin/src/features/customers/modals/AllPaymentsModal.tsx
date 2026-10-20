import { X, CreditCard, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PaymentTransaction {
  id: string;
  date: string;
  amount: string;
  method: string;
  orderId: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
}

interface AllPaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: PaymentTransaction[];
  customerName?: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const statusConfig = {
  completed: { icon: CheckCircle, color: 'bg-green-100 text-green-600', badgeClass: 'bg-green-50 text-green-700 border-green-200', label: 'Paid' },
  pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-600', badgeClass: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Pending' },
  failed: { icon: XCircle, color: 'bg-red-100 text-red-600', badgeClass: 'bg-red-50 text-red-700 border-red-200', label: 'Failed' },
  refunded: { icon: RefreshCw, color: 'bg-orange-100 text-orange-600', badgeClass: 'bg-orange-50 text-orange-700 border-orange-200', label: 'Refunded' },
};

export function AllPaymentsModal({
  isOpen,
  onClose,
  transactions,
  customerName,
  currentPage,
  totalPages,
  onPageChange,
  isLoading
}: AllPaymentsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-green-50 flex items-center justify-center">
              <CreditCard className="size-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Payment History</h2>
              <p className="text-sm text-slate-600">{customerName ? `Payments for ${customerName}` : `${transactions.length} total payments`}</p>
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
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <CreditCard className="size-12 mx-auto text-slate-300 mb-3" />
              <p>No payments found</p>
            </div>
          ) : (
            <div className="min-w-full inline-block align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50 sticky top-0 z-10">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {transactions.map((txn) => {
                      const config = statusConfig[txn.status];
                      const Icon = config.icon;
                      return (
                        <tr key={txn.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            {txn.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className={`size-6 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                                <Icon className="size-3" />
                              </div>
                              <span className="text-sm font-medium text-slate-900">{txn.method}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">
                            #{txn.orderId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              variant="outline"
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${config.badgeClass}`}
                            >
                              {config.label}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 text-right">
                            {txn.amount}
                          </td>
                        </tr>
                      );
                    })}
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
