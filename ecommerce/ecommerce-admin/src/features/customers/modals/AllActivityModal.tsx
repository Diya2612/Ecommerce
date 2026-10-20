import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DialogPortal } from '@radix-ui/react-dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import type { ActivityItem } from '@/components/activity/types';
import {
    ACTIVITY_CATEGORY_OPTIONS
} from '@/components/activity/activityHelpers';
import { ExternalLink, CalendarClock } from 'lucide-react';
import { ActivityFeed } from '@/components/activity';

interface AllActivityModalProps {
    activities: ActivityItem[];
    isLoading?: boolean;
    currentFilter?: string;
    onFilterChange?: (filter: string) => void;
    trigger?: React.ReactNode;
}

export const AllActivityModal: React.FC<AllActivityModalProps> = ({
    activities,
    isLoading = false,
    currentFilter = 'all',
    onFilterChange,
    trigger
}) => {
    const [open, setOpen] = useState(false);
    // Local filter state if not controlled
    const [localFilter, setLocalFilter] = useState('all');

    const activeFilter = onFilterChange ? currentFilter : localFilter;
    const handleFilterChange = onFilterChange || setLocalFilter;

    // We filter client-side ONLY if the component is in local state mode (onFilterChange is undefined).
    // If onFilterChange is defined, we assume the parent component (and backend) handles the filtering.
    // This allows "Orders & Shipping" (value='order') to match backend items like 'Order Placed', 'Shipping Update' etc.
    const filteredActivities = (!onFilterChange && activeFilter !== 'all')
        ? activities.filter(a => a.type.toLowerCase().includes(activeFilter.toLowerCase()))
        : activities;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="sm" className="h-9 px-3 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all rounded-lg">
                        <span>View All</span>
                        <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogPortal>
                <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] gap-0 border bg-background shadow-xl duration-200 sm:rounded-xl overflow-hidden p-0">
                    <DialogHeader className="px-6 py-4 border-b bg-slate-50/50 flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100/50 text-blue-600 rounded-lg">
                                <CalendarClock size={20} />
                            </div>
                            <div className="space-y-1">
                                <DialogTitle className="text-lg font-semibold text-slate-900">Activity Timeline</DialogTitle>
                                <DialogDescription className="text-xs text-slate-500">
                                    Comprehensive history of all interactions
                                </DialogDescription>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pr-8">
                            <Select
                                value={activeFilter}
                                onValueChange={handleFilterChange}
                            >
                                <SelectTrigger className="w-[180px] rounded-xl border-slate-200 bg-white">
                                    <SelectValue placeholder="Filter by type" />
                                </SelectTrigger>
                                <SelectContent align="end" className="rounded-xl">
                                    {ACTIVITY_CATEGORY_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </DialogHeader>

                    <ScrollArea className="h-[600px] bg-slate-50/30">
                        <div className="px-8 py-6">
                            <ActivityFeed
                                activities={filteredActivities}
                                isLoading={isLoading}
                                emptyMessage="No activities found matching your filter"
                            />
                        </div>
                    </ScrollArea>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
};
