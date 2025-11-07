"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface ProgressControlsProps {
  onIncludePlannedChange: (includePlanned: boolean) => void;
  includePlanned: boolean;
}

export function ProgressControls({
  onIncludePlannedChange,
  includePlanned,
}: ProgressControlsProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="include-planned-progress"
          checked={includePlanned}
          onCheckedChange={(checked) =>
            onIncludePlannedChange(checked === true)
          }
          disabled={true}
        />
        <label
          htmlFor="include-planned-progress"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Include planned workouts in progress statistics (Coming Soon)
        </label>
      </div>
      <div className="text-sm text-muted-foreground">
        Progress currently shows completed workouts only
      </div>
    </div>
  );
}
