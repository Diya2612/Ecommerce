import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag, Percent, DollarSign, Truck, ShoppingCart } from "lucide-react";
import type { Discount } from "../types/discount.types";

interface DiscountCardProps {
  discount: Discount;
  onEdit?: (discount: Discount) => void;
  onDelete?: (id: string) => void;
  onToggle?: (id: string) => void;
}

export const DiscountCard: React.FC<DiscountCardProps> = ({
  discount,
}) => {
  const getTypeIcon = (type: Discount["type"]) => {
    switch (type) {
      case "percentage":
        return <Percent className="h-4 w-4" />;
      case "fixed":
        return <DollarSign className="h-4 w-4" />;
      case "free_shipping":
        return <Truck className="h-4 w-4" />;
      case "buy_x_get_y":
        return <ShoppingCart className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Discount["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getTypeIcon(discount.type)}
            <CardTitle className="text-lg">{discount.code}</CardTitle>
          </div>
          <Badge className={getStatusColor(discount.status)}>
            {discount.status}
          </Badge>
        </div>
        <CardDescription>{discount.title}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Value:</span>
            <span className="font-medium">{discount.value}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Usage:</span>
            <span className="text-sm">
              {discount.usage_count}
              {discount.usage_limit && ` / ${discount.usage_limit}`}
            </span>
          </div>
          {discount.ends_at && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Expires:</span>
              <span className="text-sm">
                {new Date(discount.ends_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};