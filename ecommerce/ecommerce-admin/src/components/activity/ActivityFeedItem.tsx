import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { getActivityIcon, getActivityIconColors } from './activityHelpers';
import type { ActivityItem } from './types';
import { ChevronUp } from 'lucide-react';

interface ActivityFeedItemProps {
    activity: ActivityItem;
    isLast?: boolean;
}

export const ActivityFeedItem: React.FC<ActivityFeedItemProps> = ({ activity, isLast }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Check if description has multiple lines or is long
    const hasMoreContent = activity.description.includes('\n') || activity.description.length > 150;

    // Get display content
    const displayContent = isExpanded
        ? activity.description
        : activity.description.split('\n')[0]; // Show first line only directly

    return (
        <div className="relative group">
            <div className="flex gap-4">
                {/* Timeline Node */}
                <div className="relative flex-shrink-0 flex flex-col items-center">
                    <div className={`
                        relative z-10 flex items-center justify-center w-12 h-12 rounded-xl
                        border shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md
                        ${getActivityIconColors(activity.type)} bg-opacity-100
                    `}>
                        {getActivityIcon(activity.type)}
                    </div>
                    {/* Connector Line */}
                    {!isLast && (
                        <div className="absolute top-12 h-10 w-[2px] bg-slate-100 -mb-2" style={{ left: 'calc(50% - 1px)' }} />
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
                            <Badge variant="secondary" className={`
                                text-[10px] px-2 py-0 h-5 font-medium rounded-md uppercase tracking-wider
                                bg-slate-100 text-slate-500 border border-slate-200
                            `}>
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
};
