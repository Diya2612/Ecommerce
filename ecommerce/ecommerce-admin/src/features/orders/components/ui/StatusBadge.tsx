import { Badge } from "@/components/ui/badge";

export type StatusType = "order" | "payment" | "fulfillment" | "recovery" | "activation";

interface StatusBadgeProps {
  status: string;
  type?: StatusType;
  className?: string;
}

export const StatusBadge = ({
  status,
  type = "order",
  className,
}: StatusBadgeProps) => {
  const getBadgeVariant = (
    statusVal: string,
    statusType: StatusType,
  ): "default" | "secondary" | "destructive" | "outline" => {
    const s = statusVal?.toLowerCase() || "";

    if (statusType === "activation") {
      if (s === "active" || s === "true") return "default"; // emerald usually, but default maps to primary
      if (s === "inactive" || s === "false") return "secondary";
    }

    if (statusType === "recovery") {
      if (s === "recovered") return "default";
      if (s === "email-sent") return "secondary";
      if (s === "not-contacted") return "outline";
      return "secondary";
    }

    // Payment Logic
    if (statusType === "payment") {
      if (s === "paid") return "default";
      if (s === "pending" || s === "authorized") return "secondary";
      if (s === "failed" || s === "refunded" || s === "overdue")
        return "destructive";
      return "outline";
    }

    // Fulfillment Logic
    if (statusType === "fulfillment") {
      if (s === "fulfilled" || s === "delivered" || s === "shipped")
        return "default";
      if (
        s === "processing" ||
        s === "packed" ||
        s === "in_transit" ||
        s === "out_for_delivery"
      )
        return "secondary";
      if (s === "cancelled" || s === "returned" || s === "failed")
        return "destructive";
      return "outline";
    }

    // Default Order Logic
    if (s === "confirmed" || s === "completed" || s === "delivered") return "default";
    if (s === "pending" || s === "draft" || s === "processing" || s === "shipped")
      return "secondary";
    if (s === "cancelled" || s === "returned" || s === "refunded") return "destructive";

    return "outline";
  };

  // Optional: Custom label mapping if needed, otherwise just capitalizing/normalizing
  const getLabel = (s: string) => {
    if (!s) return "—";
    // Replace hyphens/underscores with spaces and capitalize
    return s.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Badge variant={getBadgeVariant(status, type)} className={className}>
      {getLabel(status)}
    </Badge>
  );
};
