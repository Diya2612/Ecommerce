import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SecurityAttributesProps {
  securityPin: string;
  onChange: (field: string, value: any) => void;
}

export const SecurityAttributes: React.FC<SecurityAttributesProps> = ({
  securityPin,
  onChange,
}) => {
  return (
    <Card className="border-none shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-[#253154]">
          Security Attributes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Secure Token</Label>
          <Input
            disabled
            value="8903-2938-4492-1120"
            className="bg-gray-50 font-mono"
          />
        </div>
        <div className="space-y-2">
          <Label>Security PIN (Optional)</Label>
          <Input
            type="password"
            placeholder="****"
            maxLength={4}
            className="h-12"
            value={securityPin}
            onChange={(e) => onChange("securityPin", e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
