import React from 'react';
import { FormSection } from '@/components/forms/FormSection';
import {
    ACTIVITY_CATEGORY_OPTIONS
} from '@/components/activity/activityHelpers';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ActivityFeed } from '@/components/activity';
import type { ActivityItem } from '@/components/activity/types';
import { AllActivityModal } from '@/features/customers/modals/AllActivityModal';

interface ActivityTimelineSectionProps {
    activities: ActivityItem[];
    isLoading?: boolean;
    currentFilter: string;
    onFilterChange?: (filter: string) => void;
}

export const ActivityTimelineSection: React.FC<ActivityTimelineSectionProps> = ({
    activities,
    isLoading = false,
    currentFilter,
    onFilterChange
}) => {
    // Take the 5 most recent activities for the timeline preview
    const recentActivities = activities.slice(0, 5);

    const controls = (
        <Select
            value={currentFilter}
            onValueChange={onFilterChange}
        >
            <SelectTrigger className="w-[180px] rounded-xl border-slate-200">
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
    );

    return (
        <>
            <FormSection
                icon={Activity}
                title="Recent Activity"
                actions={controls}
            >
                <ActivityFeed activities={recentActivities} isLoading={isLoading} />

                <div className="mt-4 pt-2 border-t border-slate-50">
                    <AllActivityModal
                        activities={activities}
                        isLoading={isLoading}
                        currentFilter={currentFilter}
                        onFilterChange={onFilterChange}
                        trigger={
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full rounded-xl h-9 text-xs font-medium text-slate-600 hover:text-slate-900"
                            >
                                View All Activity
                            </Button>
                        }
                    />
                </div>
            </FormSection>
        </>
    );
};
