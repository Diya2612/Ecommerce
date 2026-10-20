import React from 'react';
import { Loader2, CalendarClock } from 'lucide-react';
import type { ActivityItem } from './types';
import { ActivityFeedItem } from './ActivityFeedItem';

interface ActivityFeedProps {
    activities: ActivityItem[];
    isLoading?: boolean;
    emptyMessage?: string;
    verticalLineLeftOffset?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
    activities,
    isLoading = false,
    emptyMessage = "No activity found",
}) => {
    return (
        <div className="relative pl-6 space-y-8">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500/50" />
                    <span className="text-xs font-medium">Loading timeline...</span>
                </div>
            ) : activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    <CalendarClock className="h-10 w-10 opacity-20" />
                    <span className="text-sm font-medium">{emptyMessage}</span>
                    <span className="text-xs">New activities will appear here</span>
                </div>
            ) : (
                activities.map((activity, index) => (
                    <ActivityFeedItem
                        key={activity.id}
                        activity={activity}
                        isLast={index === activities.length - 1}
                    />
                ))
            )}
        </div>
    );
};
