"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Plus, Save } from "lucide-react";
import { ExerciseSearch } from "./exercise-search";
import { saveWorkout } from "@/actions/save-workout";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Exercise {
  name: string;
  reps: number;
  weight?: number;
}

export function WorkoutBuilder() {
  const [workoutTitle, setWorkoutTitle] = useState("");
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleAddExercise = (exerciseName: string) => {
    const newExercise: Exercise = {
      name: exerciseName,
      reps: 0,
      weight: undefined,
    };
    setSelectedExercises([...selectedExercises, newExercise]);
    setShowExerciseSearch(false);
  };

  const updateExercise = (
    index: number,
    field: "reps" | "weight",
    value: string,
  ) => {
    const updated = [...selectedExercises];
    if (field === "reps") {
      updated[index].reps = parseInt(value) || 0;
    } else {
      updated[index].weight = value === "" ? undefined : parseFloat(value) || 0;
    }
    setSelectedExercises(updated);
  };

  const removeExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  async function saveData() {
    // Validierung
    if (!workoutTitle || workoutTitle.trim() === "") {
      toast.error("Please enter a workout title");
      return;
    }

    if (selectedExercises.length === 0) {
      toast.error("Please add at least one exercise");
      return;
    }

    // Prüfe ob alle Übungen Wiederholungen haben
    const hasEmptyReps = selectedExercises.some(
      (ex) => !ex.reps || ex.reps === 0,
    );
    if (hasEmptyReps) {
      toast.error("Please enter repetitions for all exercises");
      return;
    }

    setIsSaving(true);

    try {
      const result = await saveWorkout({
        workoutTitle: workoutTitle.trim(),
        workoutNotes: workoutNotes.trim() || null,
        exercises: selectedExercises,
      });

      if (result.success) {
        toast.success(result.message || "Workout saved successfully!");
        // Redirect to workouts page or workout detail
        router.push("/dashboard/workouts");
      } else {
        toast.error(result.error || "Failed to save workout");
      }
    } catch (error) {
      console.error("Error saving workout:", error);
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
          <h1 className="text-4xl font-bold">New Workout</h1>
          <p className="mt-1 text-muted-foreground">
            Create and track your workout session
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
            onClick={saveData}
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
            <textarea
              placeholder="Add notes about this workout (e.g., how you felt, goals, achievements)..."
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              rows={4}
            />
          </div>
        </div>
      </Card>

      {/* Exercises */}
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Exercises</h2>
          <Button
            onClick={() => setShowExerciseSearch(true)}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Exercise
          </Button>
        </div>

        {/* Exercise Search Modal */}
        {showExerciseSearch && (
          <ExerciseSearch
            onSelect={handleAddExercise}
            onClose={() => setShowExerciseSearch(false)}
          />
        )}

        {/* Selected Exercises List */}
        {selectedExercises.length > 0 && (
          <div className="space-y-4">
            {selectedExercises.map((exercise, index) => (
              <div key={index} className="rounded-lg border bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{exercise.name}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExercise(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Repetitions <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="e.g., 12"
                      value={exercise.reps || ""}
                      onChange={(e) =>
                        updateExercise(index, "reps", e.target.value)
                      }
                      className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Weight (kg){" "}
                      <span className="text-muted-foreground text-xs">
                        (optional)
                      </span>
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="e.g., 20.5"
                      value={exercise.weight || ""}
                      onChange={(e) =>
                        updateExercise(index, "weight", e.target.value)
                      }
                      className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
