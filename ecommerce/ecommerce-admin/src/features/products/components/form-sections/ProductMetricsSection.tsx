import { TrendingUp, Clock, User } from 'lucide-react';
import { FormSection } from '@/components/forms';
import type { ProductMetricsSectionProps } from '@/features/products/types';
import { format } from 'date-fns';

export function ProductMetricsSection({ productMetadata }: ProductMetricsSectionProps) {
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      return format(new Date(dateString), 'MMM dd, yyyy • h:mm a');
    } catch (e) {
      return dateString;
    }
  };

  const metrics = [
    {
      icon: Clock,
      label: 'Created',
      value: formatDate(productMetadata.createdAt),
      subtext: productMetadata.createdBy ? `by ${productMetadata.createdBy}` : undefined,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: User,
      label: 'Last Modified',
      value: formatDate(productMetadata.lastModified),
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    /*
    {
      icon: TrendingUp,
      label: 'Total Views',
      value: productMetadata.totalViews.toLocaleString(),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Package,
      label: 'Total Sales',
      value: productMetadata.totalSales,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
    */
  ];

  return (
    <FormSection icon={TrendingUp} title="Product Metrics">
      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2 border-b border-slate-100 last:border-0 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${metric.bgColor} shrink-0`}>
                <metric.icon className={`size-4 ${metric.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">{metric.label}</p>
                {metric.subtext && (
                  <p className="text-xs text-slate-500">{metric.subtext}</p>
                )}
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-900 text-right">{metric.value}</p>
          </div>
        ))}
      </div>
    </FormSection>
  );
}
