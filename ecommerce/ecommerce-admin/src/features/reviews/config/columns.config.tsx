import { Star } from 'lucide-react';
import type { ColumnConfig } from '@/components/data-table/GenericTable';
import type { Review, ReviewStatus } from '../types';
import { REVIEW_STATUS_COLORS } from '../constants/statuses';

export const getReviewColumnConfig = (): ColumnConfig<Review>[] => [
    {
        key: 'productName',
        label: 'Product',
        sortable: true,
        render: (value: unknown) => (
            <span className="font-medium text-gray-900">{String(value || 'Unknown Product')}</span>
        ),
    },
    {
        key: 'userName',
        label: 'Customer',
        sortable: true,
        render: (value: unknown, row: Review) => (
            <div className="flex flex-col">
                <span className="font-medium text-sm text-gray-900">{String(value || 'Anonymous')}</span>
                <span className="text-xs text-gray-500">{row.userEmail || 'No email provided'}</span>
            </div>
        ),
    },
    {
        key: 'rating',
        label: 'Rating',
        sortable: true,
        render: (value: unknown) => {
            const rating = Number(value);
            return (
                <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-900 mr-1">{rating.toFixed(1)}</span>
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
            );
        },
    },
    { key: 'title', label: 'Review Title', sortable: true },
    {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (value: unknown) => {
            const status = value as ReviewStatus;
            const colors = REVIEW_STATUS_COLORS[status] || REVIEW_STATUS_COLORS.pending;
            return (
                <span className={`px-2 py-0.5 rounded-full text-[11px] uppercase border font-medium tracking-wide ${colors.bg} ${colors.text} ${colors.border}`}>
                    {status}
                </span>
            );
        },
    },
    { key: 'createdAt', label: 'Date', type: 'date', hiddenOnMobile: true, sortable: true },
];
