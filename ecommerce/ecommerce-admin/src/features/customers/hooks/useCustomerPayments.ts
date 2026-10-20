import { useState, useEffect, useCallback } from 'react';
import { customerService } from '../services/customerService';
import { notifyError } from '@/utils';

interface UseCustomerPaymentsProps {
  userId: string;
  limit?: number;
  status?: string;
  page?: number;
}

export function useCustomerPayments({ userId, limit = 10, status, page = 1 }: UseCustomerPaymentsProps) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: page,
    limit,
    total: 0,
    total_pages: 0
  });

  const fetchPayments = useCallback(async (page: number = 1) => {
    if (!userId) return;

    setLoading(true);
    try {
      const data = await customerService.getCustomerPaymentHistory(userId, {
        page,
        limit,
        status
      });

      // Map backend data to frontend PaymentTransaction format if needed
      // interface PaymentTransaction {
      //   id: string;
      //   date: string;
      //   amount: string;
      //   method: string;
      //   orderId: string;
      //   status: 'completed' | 'pending' | 'failed' | 'refunded';
      // }
      const mappedPayments = data.transactions.map((tx: any) => {
        let uiStatus: 'completed' | 'pending' | 'failed' | 'refunded' = 'pending';

        switch (tx.status) {
          case 'captured':
            uiStatus = 'completed';
            break;
          case 'failed':
            uiStatus = 'failed';
            break;
          case 'refunded':
          case 'partially_refunded':
            uiStatus = 'refunded';
            break;
          default:
            uiStatus = 'pending';
        }

        const methodMap: Record<string, string> = {
          'card': 'Credit/Debit Card',
          'upi': 'UPI Payment',
          'netbanking': 'Net Banking',
          'wallet': 'Wallet',
        };

        const rawMethod = tx.payment_method?.toLowerCase();
        let displayMethod = methodMap[rawMethod] || (rawMethod ? rawMethod.charAt(0).toUpperCase() + rawMethod.slice(1) : 'Online Payment');

        return {
          id: tx.id,
          date: new Date(tx.created_at).toLocaleDateString(),
          amount: `₹${tx.amount.toLocaleString()}`,
          method: displayMethod,
          orderId: tx.order_number || tx.order_id,
          status: uiStatus,
        };
      });

      setPayments(mappedPayments);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      notifyError('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  }, [userId, limit, status]);

  useEffect(() => {
    fetchPayments(page);
  }, [fetchPayments, page]);

  return {
    payments,
    loading,
    pagination,
    refresh: () => fetchPayments(pagination.page),
    setPage: (page: number) => fetchPayments(page),
  };
}
