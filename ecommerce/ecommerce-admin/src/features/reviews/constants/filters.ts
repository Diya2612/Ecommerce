import type { FilterGroup } from '@/components/data-table/FiltersBar';
import { REVIEW_STATUS_OPTIONS, RATING_OPTIONS } from './options';

export const REVIEW_FILTER_CONFIG = (
    status: string[],
    setStatus: (s: string[]) => void,
    ratings: string[],
    setRatings: (r: string[]) => void,
    toggleFilter: (curr: string[], val: string) => string[],
    setPage: (p: number) => void
): FilterGroup[] => [
    {
        id: 'status',
        label: 'Status',
        options: [
            {
                label: 'All Status',
                value: '',
                onSelect: () => { setStatus([]); setPage(1); },
                isActive: status.length === 0
            },
            ...REVIEW_STATUS_OPTIONS.map(opt => ({
                label: opt.label,
                value: opt.value,
                onSelect: () => { setStatus(toggleFilter(status, opt.value)); setPage(1); },
                isActive: status.includes(opt.value)
            }))
        ]
    },
    {
        id: 'rating',
        label: 'Rating',
        options: [
            {
                label: 'All Ratings',
                value: '',
                onSelect: () => { setRatings([]); setPage(1); },
                isActive: ratings.length === 0
            },
            ...RATING_OPTIONS.map(opt => ({
                label: opt.label,
                value: opt.value,
                onSelect: () => { setRatings(toggleFilter(ratings, opt.value)); setPage(1); },
                isActive: ratings.includes(opt.value)
            }))
        ]
    }
];
