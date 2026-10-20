import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function DraftModeBanner() {
  return (
    <Card className="border-amber-200 bg-amber-50 shadow-sm">
      <CardContent className="py-3 px-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
          <div>
            <div className="text-xs font-semibold text-amber-900 mb-1">
              Draft Mode
            </div>
            <div className="text-xs text-amber-700">
              Fulfillment, invoicing, and accounting are disabled until the order is created.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
