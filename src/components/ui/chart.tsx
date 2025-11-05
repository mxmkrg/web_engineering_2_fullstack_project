"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const CHART_COLORS = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
  accent: "hsl(var(--accent))",
  muted: "hsl(var(--muted))",
  destructive: "hsl(var(--destructive))",
  blue: "#3b82f6",
  green: "#10b981",
  orange: "#f59e0b",
  red: "#ef4444",
  purple: "#8b5cf6",
  pink: "#ec4899",
  cyan: "#06b6d4",
  indigo: "#6366f1",
} as const;

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config?: Record<string, { label: string; color?: string }>;
  }
>(({ className, config, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("w-full", className)}
      style={
        {
          "--chart-1": CHART_COLORS.blue,
          "--chart-2": CHART_COLORS.green,
          "--chart-3": CHART_COLORS.orange,
          "--chart-4": CHART_COLORS.red,
          "--chart-5": CHART_COLORS.purple,
          "--chart-6": CHART_COLORS.pink,
          "--chart-7": CHART_COLORS.cyan,
          "--chart-8": CHART_COLORS.indigo,
        } as React.CSSProperties
      }
      {...props}
    />
  );
});
ChartContainer.displayName = "ChartContainer";

const ChartTooltip = ({ active, payload, label, config }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-background p-2 shadow-md">
      <div className="grid gap-2">
        {label && <div className="font-medium text-foreground">{label}</div>}
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground">{entry.name}:</span>
            <span className="text-sm font-medium text-foreground">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChartLegend = ({ payload }: any) => {
  if (!payload?.length) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export { ChartContainer, ChartTooltip, ChartLegend, CHART_COLORS };
