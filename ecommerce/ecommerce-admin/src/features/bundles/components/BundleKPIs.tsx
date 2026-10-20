import { TrendingUp } from 'lucide-react';
import type { KPICardProps } from '../types/bundle.types';

export const BundleKPIs = ({ kpis }: { kpis: KPICardProps[] }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {kpis.map((kpi, index) => {
                const Icon = kpi.icon;
                return (
                    <div key={index} className="bg-white rounded-[20px] border border-slate-200/80 shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-sm text-slate-600 mb-2">{kpi.title}</p>
                                <p className="text-2xl font-bold text-slate-900 mb-1">{kpi.value}</p>
                                {kpi.trend && (
                                    <div className="flex items-center gap-1 text-xs text-green-600">
                                        <TrendingUp className="size-3" />
                                        <span>{kpi.trend}</span>
                                    </div>
                                )}
                            </div>
                            <div className={`size-12 rounded-2xl ${kpi.iconColor} flex items-center justify-center flex-shrink-0`}>
                                <Icon className="size-6" />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
