import React from 'react';
import { Loader2, CalendarClock } from 'lucide-react';
import { ActivityTimeline } from './ActivityTimeline';
import type { ActivityTimelineItem } from './ActivityTimeline';

interface ActivityTimelineListProps {
  activities: ActivityTimelineItem[];
  isLoading?: boolean;
  emptyMessage?: string;
  getIcon?: (type: string) => React.ReactNode;
  getIconColors?: (type: string) => string;
  className?: string;
}

export const ActivityTimelineList: React.FC<ActivityTimelineListProps> = ({
  activities,
  isLoading = false,
  emptyMessage = 'No activity found',
  getIcon,
  getIconColors,
  className,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500/50" />
        <span className="text-xs font-medium">Loading timeline...</span>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        <CalendarClock className="h-10 w-10 opacity-20" />
        <span className="text-sm font-medium">{emptyMessage}</span>
        <span className="text-xs">New activities will appear here</span>
      </div>
    );
  }

  return (
    <ActivityTimeline
      activities={activities}
      getIcon={getIcon}
      getIconColors={getIconColors}
      emptyMessage={emptyMessage}
      className={className}
    />
  );
};
