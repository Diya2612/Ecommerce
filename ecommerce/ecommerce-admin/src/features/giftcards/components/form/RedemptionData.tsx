import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RedemptionDataProps {
  balance: number;
  redemptionCount: number;
}

export const RedemptionData: React.FC<RedemptionDataProps> = ({
  balance,
  redemptionCount,
}) => {
  return (
    <Card className="border-none shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-[#253154]">
          Redemption Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Balance</Label>
            <Input
              disabled
              value={`₹${balance}`}
              className="bg-gray-50 font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label>Used</Label>
            <Input disabled value="₹0.00" className="bg-gray-50 font-mono" />
          </div>
        </div>
        <div className="space-y-2 pt-2">
          <Label>Redemption Count</Label>
          <Input
            disabled
            value={redemptionCount}
            className="bg-gray-50 font-mono"
          />
        </div>
      </CardContent>
    </Card>
  );
};
