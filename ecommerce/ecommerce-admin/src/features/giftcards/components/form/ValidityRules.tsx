import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ValidityRulesProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  minOrderValue: string;
  multipleCards: boolean;
  usageType: string;
  onDateChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  onChange: (field: string, value: any) => void;
}

export const ValidityRules: React.FC<ValidityRulesProps> = ({
  startDate,
  endDate,
  minOrderValue,
  multipleCards,
  usageType,
  onDateChange,
  onChange,
}) => {
  const setStartDate = (date: Date | undefined) => onDateChange({ from: date, to: endDate });
  const setExpiryDate = (date: Date | undefined) => onDateChange({ from: startDate, to: date });

  return (
    <Card className="border-none shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-[#253154]">
          Validity & Usage Rules
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        <div className="flex flex-col space-y-3 sm:space-y-4">
          {/* Start Date */}
          <div className="w-full space-y-2">
            <Label className="text-sm font-medium text-[#868686]">
              Start Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full h-[48px] sm:h-[52px] justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                  {startDate ? (
                    format(startDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Expiry Date */}
          <div className="w-full space-y-2">
            <Label className="text-sm font-medium text-[#868686]">
              Expiry Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full h-[48px] sm:h-[52px] justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                  {endDate ? (
                    format(endDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setExpiryDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Minimum Order Value */}
          <div className="w-full space-y-2 py-1">
            <Label
              htmlFor="min-order"
              className="text-sm font-medium text-[#868686]"
            >
              Minimum Order Value (₹)
            </Label>
            <Input
              id="min-order"
              type="number"
              placeholder="0.00"
              className="h-[48px] sm:h-[52px] w-full"
              value={minOrderValue}
              onChange={(e) => onChange("minOrderValue", e.target.value)}
            />
          </div>

          {/* Multiple Gift Cards Toggle */}
          <div className="pt-2 flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="font-medium text-[#253154]">
                Multiple Gift Cards
              </h4>
              <p className="text-xs text-muted-foreground">
                Allow multiple gift cards per order
              </p>
            </div>
            <Switch
              checked={multipleCards}
              onCheckedChange={(v) => onChange("multipleCards", v)}
            />
          </div>

          {/* Usage Type Dropdown */}
          <div className="w-full space-y-2 pt-2">
            <Label
              htmlFor="usage-type"
              className="text-sm font-medium text-[#868686]"
            >
              Usage Type
            </Label>
            <Select value={usageType} onValueChange={(v) => onChange("usageType", v)}>
              <SelectTrigger
                id="usage-type"
                className="h-[48px] sm:h-[52px] w-full rounded-xl"
              >
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one-time">One-time use</SelectItem>
                <SelectItem value="multiple">
                  Multiple use (Partial redemption)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
