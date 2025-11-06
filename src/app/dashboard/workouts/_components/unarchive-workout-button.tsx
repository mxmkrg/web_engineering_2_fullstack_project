"use client";

import { unarchiveWorkout } from "@/actions/archive-old-workouts";
import { RotateCcw } from "lucide-react";
import { useState } from "react";

interface UnarchiveWorkoutButtonProps {
  workoutId: number;
}

export function UnarchiveWorkoutButton({
  workoutId,
}: UnarchiveWorkoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUnarchive = async () => {
    setIsLoading(true);
    try {
      const result = await unarchiveWorkout(workoutId);
      if (!result.success) {
        console.error("Failed to unarchive workout:", result.error);
      }
    } catch (error) {
      console.error("Error unarchiving workout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleUnarchive}
      disabled={isLoading}
      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
      title="Unarchive workout"
      type="button"
    >
      <RotateCcw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
    </button>
  );
}
