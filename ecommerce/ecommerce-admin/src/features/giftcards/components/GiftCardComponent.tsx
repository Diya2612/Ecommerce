import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Mail, User, Calendar } from "lucide-react";
import type { GiftCard } from "../types/giftcard.types";

interface GiftCardComponentProps {
  giftCard: GiftCard;
  onEdit?: (giftCard: GiftCard) => void;
  onDelete?: (id: string) => void;
  onToggle?: (id: string) => void;
}

export const GiftCardComponent: React.FC<GiftCardComponentProps> = ({
  giftCard,
}) => {
  const getStatusColor = (status: GiftCard["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "redeemed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: giftCard.currency || "INR",
    }).format(amount);
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg font-mono">{giftCard.code}</CardTitle>
          </div>
          <Badge className={getStatusColor(giftCard.status)}>
            {giftCard.status}
          </Badge>
        </div>
        <CardDescription>{giftCard.title}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Original Value</p>
              <p className="font-medium">{formatCurrency(giftCard.value)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="font-medium">{formatCurrency(giftCard.balance)}</p>
            </div>
          </div>

          {giftCard.recipient_name && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">To: {giftCard.recipient_name}</span>
            </div>
          )}

          {giftCard.recipient_email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{giftCard.recipient_email}</span>
            </div>
          )}

          {giftCard.expires_at && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Expires: {new Date(giftCard.expires_at).toLocaleDateString()}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm text-muted-foreground">Redemptions</span>
            <span className="text-sm font-medium">{giftCard.redemption_count}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};