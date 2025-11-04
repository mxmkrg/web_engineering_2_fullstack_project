"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Filter, X } from "lucide-react";

export interface DateFilter {
  type: "all-time" | "preset" | "month" | "custom";
  startDate?: Date;
  endDate?: Date;
  label: string;
}

interface DateFilterComponentProps {
  currentFilter: DateFilter;
  onFilterChange: (filter: DateFilter) => void;
}

const presetFilters: Omit<DateFilter, "startDate" | "endDate">[] = [
  { type: "all-time", label: "All Time" },
  { type: "preset", label: "Last 30 Days" },
  { type: "preset", label: "Last 3 Months" },
  { type: "preset", label: "Last 6 Months" },
  { type: "preset", label: "This Year" },
];

function getDateRangeForPreset(label: string): {
  startDate: Date;
  endDate: Date;
} {
  const now = new Date();
  const endDate = new Date(now);
  let startDate = new Date(now);

  switch (label) {
    case "Last 30 Days":
      startDate.setDate(startDate.getDate() - 30);
      break;
    case "Last 3 Months":
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case "Last 6 Months":
      startDate.setMonth(startDate.getMonth() - 6);
      break;
    case "This Year":
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      // All time - no dates needed
      break;
  }

  return { startDate, endDate };
}

function generateMonthOptions(): {
  value: string;
  label: string;
  date: Date;
}[] {
  const months = [];
  const now = new Date();

  // Generate last 24 months
  for (let i = 0; i < 24; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    months.push({ value, label, date });
  }

  return months;
}

export function DateFilterComponent({
  currentFilter,
  onFilterChange,
}: DateFilterComponentProps) {
  const [showMonthSelector, setShowMonthSelector] = useState(false);

  // Memoize month options to prevent recalculation on every render
  const monthOptions = useMemo(() => generateMonthOptions(), []);

  const handlePresetSelect = useCallback(
    (preset: Omit<DateFilter, "startDate" | "endDate">) => {
      if (preset.type === "all-time") {
        onFilterChange({
          type: "all-time",
          label: "All Time",
        });
      } else {
        const { startDate, endDate } = getDateRangeForPreset(preset.label);
        onFilterChange({
          type: "preset",
          startDate,
          endDate,
          label: preset.label,
        });
      }
      setShowMonthSelector(false);
    },
    [onFilterChange],
  );

  const handleMonthSelect = useCallback(
    (monthValue: string) => {
      const [year, month] = monthValue.split("-").map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // Last day of the month

      const monthOption = monthOptions.find((opt) => opt.value === monthValue);
      onFilterChange({
        type: "month",
        startDate,
        endDate,
        label: monthOption?.label || "Selected Month",
      });
      setShowMonthSelector(false);
    },
    [onFilterChange, monthOptions],
  );

  const clearFilter = useCallback(() => {
    onFilterChange({
      type: "all-time",
      label: "All Time",
    });
    setShowMonthSelector(false);
  }, [onFilterChange]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Filter className="size-4" />
          Date Filter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Filter Display */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Calendar className="size-3" />
            {currentFilter.label}
          </Badge>
          {currentFilter.type !== "all-time" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilter}
              className="h-6 w-6 p-0"
            >
              <X className="size-3" />
            </Button>
          )}
        </div>

        {/* Preset Filters */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Quick Filters
          </h4>
          <div className="flex flex-wrap gap-2">
            {presetFilters.map((preset) => (
              <Button
                key={preset.label}
                variant={
                  currentFilter.label === preset.label ? "default" : "outline"
                }
                size="sm"
                onClick={() => handlePresetSelect(preset)}
                className="text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Month Selector */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Individual Months
          </h4>
          <Select onValueChange={handleMonthSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select a month" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Info */}
        {currentFilter.startDate && currentFilter.endDate && (
          <div className="text-xs text-muted-foreground border-t pt-3">
            <div className="flex items-center gap-1">
              <Calendar className="size-3" />
              <span>
                {currentFilter.startDate.toLocaleDateString()} -{" "}
                {currentFilter.endDate.toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
