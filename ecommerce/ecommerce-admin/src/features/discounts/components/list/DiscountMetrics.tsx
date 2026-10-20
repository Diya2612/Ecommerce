import React from 'react';
import { MetricsGrid, type MetricItem } from "@/components/metrics";

interface DiscountMetricsProps {
  metrics: MetricItem[];
}

export const DiscountMetrics: React.FC<DiscountMetricsProps> = ({ metrics }) => {
  return <MetricsGrid metrics={metrics} />;
};
