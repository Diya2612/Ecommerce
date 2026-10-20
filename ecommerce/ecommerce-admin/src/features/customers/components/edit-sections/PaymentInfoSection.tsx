import { useState } from 'react';
import { CreditCard, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormSection } from '@/components/forms';
import { AllPaymentsModal } from '../../modals/AllPaymentsModal';
import type { PaginationState } from '../../types/customer.types';

interface PaymentTransaction {
  id: string;
  date: string;
  amount: string;
  method: string;
  orderId: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
}

interface PaymentInfoSectionProps {
  transactions?: PaymentTransaction[];
  pagination?: PaginationState;
}

const statusConfig = {
  completed: { icon: CheckCircle, color: 'bg-green-100 text-green-600', label: 'Paid' },
  pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-600', label: 'Pending' },
  failed: { icon: XCircle, color: 'bg-red-100 text-red-600', label: 'Failed' },
  refunded: { icon: RefreshCw, color: 'bg-orange-100 text-orange-600', label: 'Refunded' },
};

export function PaymentInfoSection({
  transactions = [],
  pagination = { currentPage: 1, totalPages: 1, onPageChange: () => { } }
}: PaymentInfoSectionProps) {
  const [isAllPaymentsModalOpen, setIsAllPaymentsModalOpen] = useState(false);

  const totalBadge = (
    <Badge className="bg-green-100 text-green-700 border-green-200 rounded-full px-3">
      {transactions.length} Payments
    </Badge>
  );

  return (
    <>
      <FormSection icon={CreditCard} title="Payment History" actions={totalBadge}>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No payment history
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 3).map((txn) => {
              const config = statusConfig[txn.status];
              const Icon = config.icon;
              return (
                <div
                  key={txn.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:shadow-sm transition-shadow gap-4 sm:gap-0"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className={`size-10 rounded-xl flex items-center justify-center ${config.color}`}>
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{txn.method}</p>
                      <p className="text-sm text-slate-500">
                        Order #{txn.orderId} • {txn.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                    <Badge
                      variant="outline"
                      className={`rounded-full px-3 py-1 text-xs font-medium ${txn.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                        txn.status === 'refunded' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          txn.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-red-50 text-red-700 border-red-200'
                        }`}
                    >
                      {config.label}
                    </Badge>
                    <span className="font-semibold text-slate-900 min-w-[80px] text-right">
                      {txn.amount}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full mt-4 rounded-xl h-8"
          onClick={() => setIsAllPaymentsModalOpen(true)}
        >
          View All Payments
        </Button>
      </FormSection>

      <AllPaymentsModal
        isOpen={isAllPaymentsModalOpen}
        onClose={() => setIsAllPaymentsModalOpen(false)}
        transactions={transactions}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={pagination.onPageChange}
        isLoading={pagination.isLoading}
      />
    </>
  );
}
