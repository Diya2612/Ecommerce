import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/constants';

interface OrderHeaderProps {
  orderNumber: string;
  orderDate: string;
  orderStatus: string;
  fulfillmentStatus: string;
  paymentStatus: string;
  getStatusBadge: (status: string, type: 'order' | 'fulfillment' | 'payment') => { variant: string; label: string };
}

export const OrderHeader = ({
  orderNumber,
  orderDate,
  orderStatus,
  fulfillmentStatus,
  paymentStatus,
  getStatusBadge
}: OrderHeaderProps) => {
  const navigate = useNavigate();

  const renderBadge = (status: string, type: 'order' | 'fulfillment' | 'payment') => {
    const { variant, label } = getStatusBadge(status, type);
    return <Badge variant={variant as any}>{label}</Badge>;
  };

  return (
    <div className="mb-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(ROUTES.ORDERS.LIST)}
        className="mb-4 hover:bg-slate-100"
      >
        <ChevronLeft className="mr-2 size-4" />
        Back to Orders
      </Button>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{orderNumber}</h1>
          <p className="text-slate-500 mt-1">
            {format(new Date(orderDate), 'PPP')} at {format(new Date(orderDate), 'p')}
          </p>
        </div>
        <div className="flex gap-2">
          {renderBadge(orderStatus, 'order')}
          {renderBadge(fulfillmentStatus, 'fulfillment')}
          {renderBadge(paymentStatus, 'payment')}
        </div>
      </div>
    </div>
  );
};
