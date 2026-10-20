import { useState } from 'react';
import { ClipboardList, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormSection } from '@/components/forms/FormSection';
import { OrderDetailsModal } from '../../modals/OrderDetailsModal';
import { AllOrdersModal } from '../../modals/AllOrdersModal';
import type { Order, PaginationState } from '../../types/customer.types';

interface OrderItem {
  id: string;
  orderNumber: string;
  date: string;
  itemCount: number;
  status: 'Delivered' | 'Cancelled' | 'Pending' | 'Processing';
  amount: number;
}

interface OrderOverviewSectionProps {
  orders?: OrderItem[];
  onNavigateToOrder?: (orderId: string) => void;
  pagination?: PaginationState;
}

// Mock data for demonstration - large dataset
const mockOrders: OrderItem[] = [
  { id: '1', orderNumber: 'SS-2024-156', date: '2024-12-10', itemCount: 3, status: 'Delivered', amount: 52999 },
  { id: '2', orderNumber: 'SS-2024-142', date: '2024-11-28', itemCount: 2, status: 'Delivered', amount: 8499 },
  { id: '3', orderNumber: 'SS-2024-128', date: '2024-11-15', itemCount: 1, status: 'Delivered', amount: 45999 },
  { id: '4', orderNumber: 'SS-2024-097', date: '2024-10-22', itemCount: 4, status: 'Cancelled', amount: 18999 },
  { id: '5', orderNumber: 'SS-2024-089', date: '2024-10-15', itemCount: 2, status: 'Delivered', amount: 24999 },
  { id: '6', orderNumber: 'SS-2024-078', date: '2024-10-01', itemCount: 5, status: 'Processing', amount: 67500 },
  { id: '7', orderNumber: 'SS-2024-065', date: '2024-09-20', itemCount: 1, status: 'Delivered', amount: 12999 },
  { id: '8', orderNumber: 'SS-2024-054', date: '2024-09-10', itemCount: 3, status: 'Delivered', amount: 35499 },
  { id: '9', orderNumber: 'SS-2024-043', date: '2024-08-28', itemCount: 2, status: 'Cancelled', amount: 9999 },
  { id: '10', orderNumber: 'SS-2024-032', date: '2024-08-15', itemCount: 6, status: 'Delivered', amount: 89999 },
  { id: '11', orderNumber: 'SS-2024-025', date: '2024-08-01', itemCount: 1, status: 'Pending', amount: 5499 },
  { id: '12', orderNumber: 'SS-2024-018', date: '2024-07-20', itemCount: 4, status: 'Delivered', amount: 42999 },
  { id: '13', orderNumber: 'SS-2024-011', date: '2024-07-05', itemCount: 2, status: 'Delivered', amount: 18499 },
  { id: '14', orderNumber: 'SS-2024-006', date: '2024-06-25', itemCount: 3, status: 'Cancelled', amount: 27999 },
  { id: '15', orderNumber: 'SS-2024-003', date: '2024-06-10', itemCount: 1, status: 'Delivered', amount: 75999 },
  { id: '16', orderNumber: 'SS-2023-298', date: '2023-12-28', itemCount: 5, status: 'Delivered', amount: 124999 },
  { id: '17', orderNumber: 'SS-2023-287', date: '2023-12-15', itemCount: 2, status: 'Delivered', amount: 15999 },
  { id: '18', orderNumber: 'SS-2023-276', date: '2023-12-01', itemCount: 4, status: 'Delivered', amount: 33499 },
  { id: '19', orderNumber: 'SS-2023-265', date: '2023-11-20', itemCount: 1, status: 'Processing', amount: 8999 },
  { id: '20', orderNumber: 'SS-2023-254', date: '2023-11-05', itemCount: 3, status: 'Delivered', amount: 54999 },
];

// Mock order details for modal
const mockOrderDetails: Record<string, Order> = {
  '1': {
    id: 'SS-2024-156',
    date: '2024-12-10',
    items: 3,
    total: '₹52,999',
    status: 'Delivered',
    statusColor: 'green',
    products: [
      { name: 'PlayStation 5 Console', qty: 1, price: '₹49,999' },
      { name: 'DualSense Controller', qty: 2, price: '₹1,500' },
    ],
    shippingAddress: '123, MG Road, Koramangala, Bangalore - 560034',
    paymentMethod: 'Credit Card (**** 4532)',
  },
  '2': {
    id: 'SS-2024-142',
    date: '2024-11-28',
    items: 2,
    total: '₹8,499',
    status: 'Delivered',
    statusColor: 'green',
    products: [
      { name: 'Gaming Headset Pro', qty: 1, price: '₹5,999' },
      { name: 'Controller', qty: 1, price: '₹2,500' },
    ],
    shippingAddress: '123, MG Road, Koramangala, Bangalore - 560034',
    paymentMethod: 'UPI Payment',
  },
  '3': {
    id: 'SS-2024-128',
    date: '2024-11-15',
    items: 1,
    total: '₹45,999',
    status: 'Delivered',
    statusColor: 'green',
    products: [
      { name: 'Gaming Monitor 27"', qty: 1, price: '₹45,999' },
    ],
    shippingAddress: '123, MG Road, Koramangala, Bangalore - 560034',
    paymentMethod: 'Net Banking',
  },
  '4': {
    id: 'SS-2024-097',
    date: '2024-10-22',
    items: 4,
    total: '₹18,999',
    status: 'Cancelled',
    statusColor: 'red',
    products: [
      { name: 'Gaming Mouse', qty: 2, price: '₹3,999' },
      { name: 'Gaming Keyboard', qty: 1, price: '₹8,999' },
      { name: 'Mouse Pad XL', qty: 1, price: '₹2,002' },
    ],
    shippingAddress: '123, MG Road, Koramangala, Bangalore - 560034',
    paymentMethod: 'Credit Card (**** 4532)',
  },
};

const statusColors: Record<OrderItem['status'], string> = {
  Delivered: 'bg-green-50 text-green-700 border-green-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
  Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Processing: 'bg-blue-50 text-blue-700 border-blue-200',
};

export function OrderOverviewSection({
  orders = mockOrders,
  onNavigateToOrder,
  pagination = { currentPage: 1, totalPages: 1, onPageChange: () => { } }
}: OrderOverviewSectionProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAllOrdersModalOpen, setIsAllOrdersModalOpen] = useState(false);

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
      month: '2-digit',
      day: '2-digit',
    }).replace(/\//g, '-');
  };

  const handleViewOrder = (orderId: string) => {
    if (onNavigateToOrder) {
      onNavigateToOrder(orderId);
      return;
    }
    const orderDetails = mockOrderDetails[orderId];
    if (orderDetails) {
      setSelectedOrder(orderDetails);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <FormSection
        icon={Package}
        title="Order Overview"
        badge={
          <Badge variant="outline" className="text-xs font-medium text-slate-600">
            Last {orders.length} Orders
          </Badge>
        }
      >
        <div className="space-y-3">
          {orders.slice(0, 4).map((order) => (
            <div
              key={order.id}
              onClick={() => handleViewOrder(order.id)}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:shadow-sm hover:border-slate-300 transition-all cursor-pointer gap-4 sm:gap-0"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <ClipboardList className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    Order #{order.orderNumber}
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatDate(order.date)} • {order.itemCount} items
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                <Badge
                  variant="outline"
                  className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[order.status]}`}
                >
                  {order.status}
                </Badge>
                <span className="font-semibold text-slate-900 min-w-[80px] text-right">
                  {formatCurrency(order.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full mt-4 rounded-xl h-8"
          onClick={() => setIsAllOrdersModalOpen(true)}
        >
          View All Orders
        </Button>
      </FormSection>

      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
        onViewOrder={onNavigateToOrder}
      />

      <AllOrdersModal
        isOpen={isAllOrdersModalOpen}
        onClose={() => setIsAllOrdersModalOpen(false)}
        orders={orders}
        onViewOrder={(orderId) => {
          setIsAllOrdersModalOpen(false);
          handleViewOrder(orderId);
        }}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={pagination.onPageChange}
        isLoading={pagination.isLoading}
      />
    </>
  );
}
