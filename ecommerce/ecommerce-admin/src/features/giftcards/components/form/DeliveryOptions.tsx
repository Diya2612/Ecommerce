import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Activity, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeliveryOptionsProps {
  deliveryMethod: string;
  receiverEmail: string;
  scheduleDelivery: boolean;
  onChange: (field: string, value: any) => void;
}

export const DeliveryOptions: React.FC<DeliveryOptionsProps> = ({
  deliveryMethod,
  receiverEmail,
  scheduleDelivery,
  onChange,
}) => {
  const setDeliveryMethod = (method: string) => onChange("deliveryMethod", method);

  return (
    <Card className="border-none shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-[#253154]">
          Delivery Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Delivery Method</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              variant={deliveryMethod === "email" ? "default" : "outline"}
              className={cn(
                "h-12 justify-start gap-2 transition-all",
                deliveryMethod === "email" && "bg-[#0e032f] hover:bg-[#0e032f]/90"
              )}
              onClick={() => setDeliveryMethod("email")}
            >
              <Mail className="w-4 h-4" /> Email
            </Button>
            <Button
              variant={deliveryMethod === "pdf" ? "default" : "outline"}
              className={cn(
                "h-12 justify-start gap-2 transition-all",
                deliveryMethod === "pdf" && "bg-[#0e032f] hover:bg-[#0e032f]/90"
              )}
              onClick={() => setDeliveryMethod("pdf")}
            >
              <Activity className="w-4 h-4" /> PDF Download
            </Button>
            <Button
              variant={deliveryMethod === "both" ? "default" : "outline"}
              className={cn(
                "h-12 justify-start gap-2 transition-all",
                deliveryMethod === "both" && "bg-[#0e032f] hover:bg-[#0e032f]/90"
              )}
              onClick={() => setDeliveryMethod("both")}
            >
              <Check className="w-4 h-4" /> Both
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="receiver-email">Receiver Email</Label>
          <Input
            id="receiver-email"
            type="email"
            placeholder="receiver@example.com"
            className="h-12"
            value={receiverEmail}
            onChange={(e) => onChange("receiverEmail", e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label className="text-base">Schedule Delivery</Label>
            <p className="text-sm text-muted-foreground">
              Send at a later date and time
            </p>
          </div>
          <Switch
            checked={scheduleDelivery}
            onCheckedChange={(v) => onChange("scheduleDelivery", v)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
