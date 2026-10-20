import { ShoppingBag, DollarSign, TrendingUp, Clock } from 'lucide-react';
import type { CustomerFormData } from '../../types/customer.types';

interface MetricsCardsProps {
  formData: CustomerFormData;
}

export function MetricsCards({ formData }: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-[20px] border border-indigo-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#0e042f] flex items-center justify-center">
            <ShoppingBag className="size-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{formData.totalOrders}</p>
            <p className="text-xs text-slate-600 mt-0.5">Total Orders</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-[20px] border border-green-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-green-600 flex items-center justify-center">
            <DollarSign className="size-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">₹{formData.totalSpent?.toLocaleString()}</p>
            <p className="text-xs text-slate-600 mt-0.5">Total Spent</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-[20px] border border-purple-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-600 flex items-center justify-center">
            <TrendingUp className="size-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">₹{formData.averageOrderValue?.toLocaleString()}</p>
            <p className="text-xs text-slate-600 mt-0.5">Avg Order Value</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-[20px] border border-amber-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-600 flex items-center justify-center">
            <Clock className="size-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{formData.lastOrderDate}</p>
            <p className="text-xs text-slate-600 mt-0.5">Last Order Date</p>
          </div>
        </div>
      </div>
    </div>
  );
}
