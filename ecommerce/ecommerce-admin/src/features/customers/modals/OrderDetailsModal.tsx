import { X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Order } from '../types/customer.types';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onViewOrder?: (orderId: string) => void;
}

export function OrderDetailsModal({ isOpen, onClose, order, onViewOrder }: OrderDetailsModalProps) {
  if (!isOpen || !order) return null;

  const statusColors: Record<string, string> = {
    'Delivered': 'bg-green-100 text-green-700 border-green-200',
    'Cancelled': 'bg-red-100 text-red-700 border-red-200',
    'Processing': 'bg-blue-100 text-blue-700 border-blue-200',
    'Pending': 'bg-amber-100 text-amber-700 border-amber-200'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Order Details - #{order.id}</h2>
            <p className="text-sm text-slate-600 mt-0.5">Complete order information and items</p>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="size-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-600 mb-1">Order Date</p>
              <p className="font-semibold text-slate-900">{order.date}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-600 mb-1">Status</p>
              <Badge className={statusColors[order.status] || 'bg-slate-100 text-slate-700'}>
                {order.status}
              </Badge>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Products</h3>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-xl gap-2 sm:gap-0 items-start">
                <div>
                  <p className="font-medium text-slate-900">PlayStation 5 Console</p>
                  <p className="text-xs text-slate-600">Qty: 1</p>
                </div>
                <p className="font-semibold text-slate-900">₹49,999</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-medium text-slate-900">DualSense Controller</p>
                  <p className="text-xs text-slate-600">Qty: 2</p>
                </div>
                <p className="font-semibold text-slate-900">₹1,500</p>
              </div>
            </div>
          </div>

          {/* Order Total */}
          <div className="p-4 bg-slate-100 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-900">Order Total</p>
              <p className="text-2xl font-bold text-[#0e042f]">{order.total}</p>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Shipping Address</h3>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-700">123, MG Road, Koramangala, Bangalore - 560034</p>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Payment Method</h3>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-700">Credit Card (**** 4532)</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-6 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl"
          >
            Close
          </Button>
          <Button
            className="flex-1 rounded-xl bg-[#0e042f] hover:bg-[#0e042f]/90 text-white"
            onClick={() => {
              onViewOrder?.(order.id);
              onClose();
            }}
          >
            <ExternalLink className="size-4 mr-2" />
            View Full Order
          </Button>
        </div>
      </div>
    </div>
  );
}
