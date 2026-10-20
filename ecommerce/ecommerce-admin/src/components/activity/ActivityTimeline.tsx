import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getActivityIcon, getActivityIconColors } from './activityHelpers';

/**
 * Shared ActivityTimelineItem interface.
 * All new fields are optional for backward compatibility.
 */
export interface ActivityTimelineItem {
  id: string | number;
  type: string;
  title: string;
  description: string;
  amount?: string | null;
  timestamp: string;

  // Extended optional fields
  category?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  raw_timestamp?: string;
  metadata?: {
    changes?: Array<{ field: string; label: string; oldVal: string | null; newVal: string | null }>;
    performer?: string;
    [key: string]: any;
  };
}

// ── Single Timeline Item ──────────────────────────────────────────

interface ActivityTimelineItemComponentProps {
  activity: ActivityTimelineItem;
  isLast?: boolean;
  getIcon?: (type: string) => React.ReactNode;
  getIconColors?: (type: string) => string;
}

function ActivityTimelineItemComponent({
  activity,
  isLast = false,
  getIcon: customGetIcon,
  getIconColors: customGetIconColors,
}: ActivityTimelineItemComponentProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const iconFn = customGetIcon ?? getActivityIcon;
  const colorFn = customGetIconColors ?? getActivityIconColors;

  // Check if description has multiple lines or is long
  const hasMoreContent = activity.description.includes('\n') || activity.description.length > 150;

  // Get display content
  const displayContent = isExpanded
    ? activity.description
    : activity.description.split('\n')[0];

  return (
    <div className="relative group">
      <div className="flex gap-4">
        {/* Timeline Node */}
        <div className="relative shrink-0 flex flex-col items-center">
          <div className={cn(
            'relative z-10 flex items-center justify-center w-12 h-12 rounded-xl',
            'border shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md',
            colorFn(activity.type), 'bg-opacity-100'
          )}>
            {iconFn(activity.type)}
          </div>
          {/* Connector Line */}
          {!isLast && (
            <div
              className="absolute top-12 h-10 w-[2px] bg-slate-100 -mb-2"
              style={{ left: 'calc(50% - 1px)' }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0 pt-1.5">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-4">
              <h4 className="text-sm font-semibold text-slate-900 leading-tight">
                {activity.title}
              </h4>
              {activity.amount && (
                <span className="text-sm font-bold text-slate-900 whitespace-nowrap">
                  {activity.amount}
                </span>
              )}
            </div>

            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {displayContent}
              {hasMoreContent && !isExpanded && (
                <span
                  onClick={() => setIsExpanded(true)}
                  className="ml-2 text-indigo-600 font-medium cursor-pointer hover:underline text-xs"
                >
                  + View Details
                </span>
              )}
            </div>

            {hasMoreContent && isExpanded && (
              <button
                onClick={() => setIsExpanded(false)}
                className="flex items-center gap-1 text-xs text-indigo-600 font-medium mt-1 hover:underline w-fit"
              >
                <ChevronUp size={12} /> Show Less
              </button>
            )}

            <div className="flex items-center gap-2 mt-1.5">
              <Badge
                variant="secondary"
                className={cn(
                  'text-[10px] px-2 py-0 h-5 font-medium rounded-md uppercase tracking-wider',
                  'bg-slate-100 text-slate-500 border border-slate-200'
                )}
              >
                {activity.type}
              </Badge>
              <span className="text-[11px] text-slate-400">
                {activity.timestamp}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ActivityTimeline Component ───────────────────────────────

interface ActivityTimelineProps {
  activities: ActivityTimelineItem[];
  getIcon?: (type: string) => React.ReactNode;
  getIconColors?: (type: string) => string;
  emptyMessage?: string;
  className?: string;
}

export function ActivityTimeline({
  activities,
  getIcon,
  getIconColors,
  emptyMessage = 'No activities found',
  className,
}: ActivityTimelineProps) {
  return (
    <div className={cn('relative pl-6 space-y-8', className)}>
      {activities.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm">
          {emptyMessage}
        </div>
      ) : (
        activities.map((activity, index) => (
          <ActivityTimelineItemComponent
            key={activity.id}
            activity={activity}
            isLast={index === activities.length - 1}
            getIcon={getIcon}
            getIconColors={getIconColors}
          />
        ))
      )}
    </div>
  );
}
