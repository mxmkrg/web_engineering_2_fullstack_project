"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar, CalendarIcon } from "lucide-react";
import { planWorkoutFromRoutine } from "@/actions/plan-workout-from-routine";

interface PlanWorkoutFromRoutineDialogProps {
  routine: {
    id: number;
    name: string;
    description: string | null;
    category: string;
    difficulty: string;
    duration: number | null;
    isPublic: boolean;
    isTemplate: boolean;
    tags: string | null;
    exerciseCount?: number;
  };
  children: React.ReactNode;
}

export function PlanWorkoutFromRoutineDialog({
  routine,
  children,
}: PlanWorkoutFromRoutineDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await planWorkoutFromRoutine(formData);
      setOpen(false);
    } catch (error) {
      console.error("Failed to plan workout:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for the date input
  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Plan Workout from Routine</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">{routine.name}</h4>
            <p className="text-sm text-muted-foreground">
              {routine.description || "No description available"}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Duration: {routine.duration || 60} min</span>
              <span>Exercises: {routine.exerciseCount || 0}</span>
            </div>
          </div>

          <form action={handleSubmit} className="space-y-4">
            <input type="hidden" name="routineId" value={routine.id} />

            <div className="space-y-2">
              <Label htmlFor="workoutDate">Workout Date</Label>
              <Input
                id="workoutDate"
                name="workoutDate"
                type="date"
                min={today}
                defaultValue={today}
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Planning..." : "Plan Workout"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
