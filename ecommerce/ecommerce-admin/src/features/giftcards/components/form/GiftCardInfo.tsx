import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GiftCardInfoProps {
  title: string;
  code: string;
  category: string;
  onChange: (field: string, value: any) => void;
}

export const GiftCardInfo: React.FC<GiftCardInfoProps> = ({
  title,
  code,
  category,
  onChange,
}) => {
  return (
    <Card className="border-none shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-[#253154]">
          Gift Card Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="gc-name">Gift Card Name / Title</Label>
          <Input
            id="gc-name"
            placeholder="e.g. Summer Sale Gift Card"
            className="h-12"
            value={title}
            onChange={(e) => onChange("title", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gc-code">Gift Card Code</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                id="gc-code"
                placeholder="XXXX-XXXX-XXXX"
                className="h-12 font-mono uppercase"
                value={code}
                onChange={(e) => onChange("code", e.target.value)}
              />
              <Button variant="outline" className="h-12 px-4">
                Generate
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gc-category">Category</Label>
            <Select value={category} onValueChange={(v) => onChange("category", v)}>
              <SelectTrigger id="gc-category" className="h-12">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Use</SelectItem>
                <SelectItem value="birthday">Birthday</SelectItem>
                <SelectItem value="festive">Festive</SelectItem>
                <SelectItem value="anniversary">Anniversary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Gift Card Type</Label>
          <div className="flex flex-col sm:flex-row gap-4 pt-1">
            <div className="flex items-center space-x-2 border rounded-lg p-3 flex-1 cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="w-4 h-4 rounded-full border border-primary flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
              <span>Fixed Value</span>
            </div>
            <div className="flex items-center space-x-2 border rounded-lg p-3 flex-1 cursor-pointer hover:bg-slate-50 transition-colors opacity-50">
              <div className="w-4 h-4 rounded-full border flex items-center justify-center" />
              <span>Variable Value</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
