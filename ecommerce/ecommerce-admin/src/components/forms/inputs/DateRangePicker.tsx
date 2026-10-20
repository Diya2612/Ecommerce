"use client"

import * as React from "react"
import { Calendar as CalendarIcon, RotateCcw } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose
} from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"

/* ============================================================
   Types - Backward Compatible Interface
============================================================ */

export type DateRangeValue = {
  from: Date | null;
  to: Date | null;
};

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (next: DateRangeValue) => void;
  placeholder?: string;
  className?: string;
}

/* ============================================================
   Helpers
============================================================ */

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/* ============================================================
   Component - DateRangePicker (Backward Compatible)
============================================================ */

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
}) => {
  const isMobile = useIsMobile();

  // Convert DateRangeValue to react-day-picker DateRange
  const dateRangeValue: DateRange | undefined = value.from
    ? { from: value.from, to: value.to ?? undefined }
    : undefined;

  const handleSelect = (range: DateRange | undefined) => {
    onChange({
      from: range?.from ?? null,
      to: range?.to ?? null,
    });
  };

  const TriggerButton = (
    <Button
      id="date"
      variant={"outline"}
      className={cn(
        "w-full justify-start text-left font-normal h-10 px-2 sm:px-4",
        !value.from && "text-muted-foreground"
      )}
    >
      <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
      <span className="truncate text-[12px] sm:text-sm">
        {value.from ? (
          value.to ? (
            <>
              {formatDate(value.from)} - {formatDate(value.to)}
            </>
          ) : (
            formatDate(value.from)
          )
        ) : (
          <span>{placeholder}</span>
        )}
      </span>
    </Button>
  );

  if (isMobile) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="grid gap-2 w-full">
          <Drawer>
            <DrawerTrigger asChild>
              {TriggerButton}
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="text-left">
                <DrawerTitle>Select Date Range</DrawerTitle>
              </DrawerHeader>
              <div className="p-4 flex justify-center">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={value.from ?? undefined}
                  selected={dateRangeValue}
                  onSelect={handleSelect}
                  numberOfMonths={1}
                />
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button>Apply</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onChange({ from: null, to: null })}
          disabled={!value.from && !value.to}
          className="h-10 w-10 rounded-xl flex-shrink-0"
          title="Reset date range"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="grid gap-2 w-[300px]">
        <Popover>
          <PopoverTrigger asChild>
            {TriggerButton}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={value.from ?? undefined}
              selected={dateRangeValue}
              onSelect={handleSelect}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange({ from: null, to: null })}
        disabled={!value.from && !value.to}
        className="h-10 w-10 rounded-xl flex-shrink-0"
        title="Reset date range"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  )
}

/* ============================================================
   Wrapper - DatePickerWithRange (Internal State Version)
============================================================ */

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function DatePickerWithRange({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2024, 0, 20),
    to: addDays(new Date(2024, 0, 20), 20),
  })
  const isMobile = useIsMobile();

  const TriggerButton = (
    <Button
      id="date"
      variant={"outline"}
      className={cn(
        "w-full justify-start text-left font-normal",
        !date && "text-muted-foreground"
      )}
    >
      <CalendarIcon className="mr-2 h-4 w-4" />
      {date?.from ? (
        date.to ? (
          <>
            {formatDate(date.from)} -{" "}
            {formatDate(date.to)}
          </>
        ) : (
          formatDate(date.from)
        )
      ) : (
        <span>Pick a date</span>
      )}
    </Button>
  );

  if (isMobile) {
    return (
      <div className={cn("grid gap-2 w-full", className)}>
        <Drawer>
          <DrawerTrigger asChild>
            {TriggerButton}
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Select Date Range</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 flex justify-center">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={1}
              />
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button>Apply</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-2 w-[300px]", className)}>
      <Popover>
        <PopoverTrigger asChild>
          {TriggerButton}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { DateRangePicker };