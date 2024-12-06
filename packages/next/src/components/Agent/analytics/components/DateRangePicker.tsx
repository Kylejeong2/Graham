import React from 'react';
import { addDays, format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import { Separator } from "@/components/ui/separator";

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  align?: "start" | "center" | "end";
}

const presets = {
  today: {
    label: 'Today',
    getValue: () => ({
      from: new Date(),
      to: new Date(),
    }),
  },
  yesterday: {
    label: 'Yesterday',
    getValue: () => ({
      from: addDays(new Date(), -1),
      to: addDays(new Date(), -1),
    }),
  },
  last7: {
    label: 'Last 7 days',
    getValue: () => ({
      from: addDays(new Date(), -7),
      to: new Date(),
    }),
  },
  last14: {
    label: 'Last 14 days',
    getValue: () => ({
      from: addDays(new Date(), -14),
      to: new Date(),
    }),
  },
  last30: {
    label: 'Last 30 days',
    getValue: () => ({
      from: addDays(new Date(), -30),
      to: new Date(),
    }),
  },
  thisMonth: {
    label: 'This Month',
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
  lastMonth: {
    label: 'Last Month',
    getValue: () => ({
      from: startOfMonth(addDays(new Date(), -30)),
      to: endOfMonth(addDays(new Date(), -30)),
    }),
  },
  thisYear: {
    label: 'This Year',
    getValue: () => ({
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    }),
  },
};

const quickSelectGroups = [
  {
    label: 'Common Ranges',
    options: ['today', 'yesterday', 'last7', 'last14', 'last30'],
  },
  {
    label: 'By Period',
    options: ['thisMonth', 'lastMonth', 'thisYear'],
  },
];

export function DateRangePicker({ dateRange, onDateRangeChange, align = "start" }: DateRangePickerProps) {
  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align={align}
        >
          <div className="flex space-x-4 p-3">
            {/* <div className="flex-1">
              <Calendar
                autoFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={onDateRangeChange}
                numberOfMonths={1}
                disabled={(date) => date > new Date()}
              />
            </div> */}
            <div className="flex flex-col space-y-3 border-l px-3">
              {quickSelectGroups.map((group) => (
                <div key={group.label}>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                    {group.label}
                  </h4>
                  <div className="flex flex-col gap-2">
                    {group.options.map((key) => {
                      const preset = presets[key as keyof typeof presets];
                      return (
                        <Button
                          key={key}
                          variant="ghost"
                          size="sm"
                          className="justify-start font-normal"
                          onClick={() => onDateRangeChange(preset.getValue())}
                        >
                          {preset.label}
                        </Button>
                      );
                    })}
                  </div>
                  {group !== quickSelectGroups[quickSelectGroups.length - 1] && (
                    <Separator className="my-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 