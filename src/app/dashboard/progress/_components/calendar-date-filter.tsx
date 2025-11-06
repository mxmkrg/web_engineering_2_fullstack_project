"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Calendar, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { DateFilter } from "@/actions/get-progression-stats";

interface CalendarDateFilterProps {
  currentFilter: DateFilter;
}

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
      break;
  }

  return { startDate, endDate };
}

function buildFilterUrl(filter: DateFilter): string {
  const params = new URLSearchParams();

  if (filter.type === "all-time") {
    return "/dashboard/progress";
  }

  params.set("filter_type", filter.type);
  params.set("filter_label", filter.label);

  if (filter.startDate) {
    params.set("start_date", filter.startDate.toISOString());
  }

  if (filter.endDate) {
    params.set("end_date", filter.endDate.toISOString());
  }

  return `/dashboard/progress?${params.toString()}`;
}

function generateYearMonths(
  year: number,
): { month: number; date: Date; label: string }[] {
  const months = [];
  for (let month = 0; month < 12; month++) {
    const date = new Date(year, month, 1);
    const label = date.toLocaleDateString("en-US", { month: "short" });
    months.push({ month, date, label });
  }
  return months;
}

export function CalendarDateFilter({ currentFilter }: CalendarDateFilterProps) {
  const router = useRouter();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [startMonth, setStartMonth] = useState<Date | null>(null);
  const [endMonth, setEndMonth] = useState<Date | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const presetFilters = [
    { type: "all-time" as const, label: "All Time" },
    { type: "preset" as const, label: "Last 30 Days" },
    { type: "preset" as const, label: "Last 3 Months" },
    { type: "preset" as const, label: "Last 6 Months" },
    { type: "preset" as const, label: "This Year" },
  ];

  const yearMonths = generateYearMonths(currentYear);
  const currentDate = new Date();

  const handleMonthClick = (date: Date) => {
    if (!startMonth || (startMonth && endMonth)) {
      // Start new selection
      setStartMonth(date);
      setEndMonth(null);
    } else if (startMonth && !endMonth) {
      // Set end month
      if (date >= startMonth) {
        setEndMonth(date);
      } else {
        // If clicked month is before start, make it the new start
        setEndMonth(startMonth);
        setStartMonth(date);
      }
    }
  };

  const applyCustomRange = () => {
    if (startMonth && endMonth) {
      const start = new Date(
        startMonth.getFullYear(),
        startMonth.getMonth(),
        1,
      );
      const end = new Date(endMonth.getFullYear(), endMonth.getMonth() + 1, 0);

      const startLabel = startMonth.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      const endLabel = endMonth.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      let label = "";
      if (startMonth.getTime() === endMonth.getTime()) {
        label = startLabel;
      } else {
        label = `${startLabel} - ${endLabel}`;
      }

      const filter: DateFilter = {
        type: "custom",
        startDate: start,
        endDate: end,
        label,
      };

      const url = buildFilterUrl(filter);
      router.push(url);
    }
  };

  const isMonthSelected = (date: Date) => {
    if (!startMonth) return false;
    if (!endMonth) return date.getTime() === startMonth.getTime();

    return date >= startMonth && date <= endMonth;
  };

  const isMonthInRange = (date: Date) => {
    if (!startMonth || !endMonth) return false;
    return date > startMonth && date < endMonth;
  };

  const isMonthDisabled = (date: Date) => {
    return date > currentDate;
  };

  const clearSelection = () => {
    setStartMonth(null);
    setEndMonth(null);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Current Filter Display */}
      <Badge variant="secondary" className="flex items-center gap-1">
        <Calendar className="size-3" />
        {currentFilter.label}
      </Badge>

      {/* Quick reset button */}
      {currentFilter.type !== "all-time" && (
        <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
          <Link href="/dashboard/progress">×</Link>
        </Button>
      )}

      {/* Filter Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Filter className="size-4" />
            Change Period
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-white border-l p-6"
        >
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Calendar className="size-4" />
              Select Date Range
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Quick Filters */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Quick Filters</h4>
              <div className="grid grid-cols-2 gap-2">
                {presetFilters.map((preset) => {
                  const filterToApply: DateFilter =
                    preset.type === "all-time"
                      ? { type: "all-time", label: "All Time" }
                      : {
                          type: "preset",
                          label: preset.label,
                          ...getDateRangeForPreset(preset.label),
                        };

                  const url = buildFilterUrl(filterToApply);
                  const isActive =
                    currentFilter.label === preset.label &&
                    !startMonth &&
                    !endMonth;

                  return (
                    <Button
                      key={preset.label}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      asChild
                      className={`text-xs ${isActive ? "bg-blue-600 hover:bg-blue-700 border-blue-600" : ""}`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href={url}>{preset.label}</Link>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Custom Range Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Custom Range</h4>
                {(startMonth || endMonth) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                    className="h-6 px-2 text-xs"
                  >
                    Clear
                  </Button>
                )}
              </div>

              {/* Year Navigator */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentYear((prev) => prev - 1)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <h3 className="font-medium">{currentYear}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentYear((prev) => prev + 1)}
                  disabled={currentYear >= currentDate.getFullYear()}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>

              {/* Month Grid */}
              <div className="grid grid-cols-4 gap-2">
                {yearMonths.map(({ month, date, label }) => {
                  const disabled = isMonthDisabled(date);
                  const selected = isMonthSelected(date);
                  const inRange = isMonthInRange(date);

                  return (
                    <Button
                      key={month}
                      variant={
                        selected ? "default" : inRange ? "secondary" : "outline"
                      }
                      size="sm"
                      disabled={disabled}
                      onClick={() => !disabled && handleMonthClick(date)}
                      className={`h-10 text-xs ${disabled ? "opacity-50" : ""} ${
                        selected
                          ? "bg-blue-600 hover:bg-blue-700 border-blue-600 text-white"
                          : inRange
                            ? "bg-blue-50 border-blue-200 text-blue-700"
                            : ""
                      }`}
                    >
                      {label}
                    </Button>
                  );
                })}
              </div>

              {/* Selection Info */}
              {startMonth && (
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>
                    Start:{" "}
                    {startMonth.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  {endMonth && (
                    <div>
                      End:{" "}
                      {endMonth.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  )}
                  {!endMonth && (
                    <div className="text-muted-foreground/70">
                      Click another month to set end date
                    </div>
                  )}
                </div>
              )}

              {/* Apply Button */}
              {startMonth && endMonth && (
                <Button
                  onClick={() => {
                    applyCustomRange();
                    setIsOpen(false);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 hover:border-blue-700 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Apply Range
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
