import { Clock } from "lucide-react";
import { FormSection } from "@/components/forms/FormSection";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import type { ActivityItem } from "@/components/activity/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TimelineEvent {
  id: string;
  action: string;
  details?: string;
  user: string;
  timestamp: string; // ISO string
  type?: "system" | "user";
}

interface OrderTimelineCardProps {
  events?: TimelineEvent[];
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimelineTime(iso: string): string {
  const d = new Date(iso);
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;
  
  const month = d.toLocaleString('en-US', { month: 'short' });
  const day = d.getDate();
  const year = d.getFullYear() !== new Date().getFullYear() ? `, ${d.getFullYear()}` : '';

  return `${month} ${day}${year} at ${hours}:${minutes} ${ampm}`;
}

// Map old TimelineEvents to new ActivityItems structure
function mapToActivityItems(events: TimelineEvent[]): ActivityItem[] {
  return events.map((event) => {
    // Determine activity type for icons based on keywords
    let type = "system";
    const actionLower = event.action.toLowerCase();
    
    if (actionLower.includes("created") || actionLower.includes("initialized")) type = "create";
    if (actionLower.includes("shipped") || actionLower.includes("shipment")) type = "ship";
    if (actionLower.includes("delivered")) type = "deliver";
    if (actionLower.includes("payment")) type = "payment";
    if (actionLower.includes("refund")) type = "refund";
    if (actionLower.includes("cancel")) type = "cancel";

    return {
      id: event.id,
      type: type,
      title: event.action,
      description: event.details || `Performed by ${event.user}`,
      amount: null,
      timestamp: formatTimelineTime(event.timestamp),
      category: "order",
      raw_timestamp: event.timestamp,
      metadata: { performer: event.user }
    };
  });
}

// ─── Default events (shown while no real data exists) ─────────────────────────

const DEFAULT_EVENTS: TimelineEvent[] = [
  {
    id: "1",
    action: "Order draft initialized",
    details: "New draft order initialized and customer details loaded",
    user: "System",
    timestamp: new Date().toISOString(),
    type: "system",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function OrderTimelineCard({
  events = DEFAULT_EVENTS,
  className,
}: OrderTimelineCardProps) {
  const mappedActivities = mapToActivityItems(events);

  return (
    <FormSection
      icon={Clock}
      title="Order Timeline"
      className={className}
    >
      <div className="pt-2">
        <ActivityFeed 
          activities={mappedActivities} 
          emptyMessage="No timeline events yet" 
        />
      </div>
    </FormSection>
  );
}
