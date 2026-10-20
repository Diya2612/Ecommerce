import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatusTrackingProps {
  status: string;
  onChange: (field: string, value: any) => void;
}

export const StatusTracking: React.FC<StatusTrackingProps> = ({
  status,
  onChange,
}) => {
  return (
    <Card className="border-none shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-[#253154]">
          Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="space-y-2">
          <Label>Current Status</Label>
          <Select value={status} onValueChange={(v) => onChange("status", v)}>
            <SelectTrigger className="h-12 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />{" "}
                  Active
                </span>
              </SelectItem>
              <SelectItem value="inactive">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-500 shrink-0" />{" "}
                  Inactive
                </span>
              </SelectItem>
              <SelectItem value="expired">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />{" "}
                  Expired
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
