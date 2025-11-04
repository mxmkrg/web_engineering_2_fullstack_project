"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { X, Save } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface WorkoutSet {
  setNumber: number;
  reps: number | null;
  weight: number | null;
  completed: boolean;
}

interface WorkoutExerciseData {
  exerciseId: number;
  exerciseName: string;
  order: number;
  sets: WorkoutSet[];
}

interface WorkoutEditFormProps {
  workoutId: number;
  initialData: {
    name: string;
    notes: string | null;
    exercises: WorkoutExerciseData[];
  };
}

export function WorkoutEditForm({
  workoutId,
  initialData,
}: WorkoutEditFormProps) {
  const [workoutTitle, setWorkoutTitle] = useState(initialData.name);
  const [workoutNotes, setWorkoutNotes] = useState(initialData.notes || "");
  const [exercises, setExercises] = useState(initialData.exercises);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: "reps" | "weight",
    value: string,
  ) => {
    const updated = [...exercises];
    const set = updated[exerciseIndex].sets[setIndex];

    if (field === "reps") {
      set.reps = value === "" ? null : parseInt(value) || 0;
    } else {
      set.weight = value === "" ? null : parseFloat(value) || 0;
    }

    setExercises(updated);
  };

  async function handleSave() {
    if (!workoutTitle || workoutTitle.trim() === "") {
      toast.error("Please enter a workout title");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/workouts/${workoutId}/edit`, {
        method: "PATCH",
        credentials: "include", // Include cookies for authentication
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: workoutTitle.trim(),
          notes: workoutNotes.trim() || null,
          exercises: exercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            order: ex.order,
            sets: ex.sets,
          })),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || "Workout updated successfully!");
        router.push("/dashboard/workouts");
      } else {
        toast.error(result.error || "Failed to update workout");
      }
    } catch (error) {
      console.error("Error updating workout:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Edit Workout</h1>
          <p className="mt-1 text-muted-foreground">
            Update your workout details
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => router.push("/dashboard/workouts")}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            size="lg"
            className="bg-blue-500 hover:bg-blue-600"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Workout"}
          </Button>
        </div>
      </div>

      {/* Workout Details */}
      <Card className="mb-6 p-6">
        <h2 className="mb-4 text-xl font-semibold">Workout Details</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Workout Title <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g., Push Day, Leg Day, Full Body..."
              value={workoutTitle}
              onChange={(e) => setWorkoutTitle(e.target.value)}
              className="max-w-md"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              Notes{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </label>
            <Textarea
              placeholder="Add notes about this workout..."
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>
      </Card>

      {/* Exercises */}
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Exercises</h2>
        </div>

        {exercises.length > 0 && (
          <div className="space-y-4">
            {exercises.map((exercise, exerciseIndex) => (
              <div
                key={exerciseIndex}
                className="rounded-lg border bg-card p-4"
              >
                <h3 className="text-lg font-semibold mb-4">
                  {exercise.exerciseName}
                </h3>

                <div className="space-y-3">
                  {exercise.sets.map((set, setIndex) => (
                    <div
                      key={setIndex}
                      className="grid grid-cols-3 gap-4 items-center"
                    >
                      <div className="text-sm font-medium">
                        Set {set.setNumber}
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium">
                          Reps <span className="text-destructive">*</span>
                        </label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="12"
                          value={set.reps || ""}
                          onChange={(e) =>
                            updateSet(
                              exerciseIndex,
                              setIndex,
                              "reps",
                              e.target.value,
                            )
                          }
                          className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium">
                          Weight (kg){" "}
                          <span className="text-muted-foreground text-xs">
                            (optional)
                          </span>
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="20.5"
                          value={set.weight || ""}
                          onChange={(e) =>
                            updateSet(
                              exerciseIndex,
                              setIndex,
                              "weight",
                              e.target.value,
                            )
                          }
                          className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
