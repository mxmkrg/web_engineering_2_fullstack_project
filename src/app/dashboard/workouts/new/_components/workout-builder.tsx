"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Plus, Save, Clock3, Play } from "lucide-react";
import { ExerciseSearch } from "./exercise-search";
import { saveWorkout } from "@/actions/save-workout";
import { planWorkout } from "@/actions/plan-workout";
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
  const [workoutDate, setWorkoutDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [mode, setMode] = useState<"start" | "plan">("start");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Detect mode from URL parameters
  useEffect(() => {
    const urlMode = searchParams.get("mode");
    if (urlMode === "plan") {
      setMode("plan");
      // Set date to tomorrow for planning mode
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setWorkoutDate(tomorrow.toISOString().split("T")[0]);
    } else {
      setMode("start");
      // Set date to today for start mode
      setWorkoutDate(new Date().toISOString().split("T")[0]);
    }
  }, [searchParams]);

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
      let result;

      if (mode === "plan") {
        // For planning mode, create a form data object
        const formData = new FormData();
        formData.append("name", workoutTitle.trim());
        formData.append("date", workoutDate);
        formData.append("notes", workoutNotes.trim() || "");

        // Convert exercises to the format expected by plan-workout action
        const exercises = selectedExercises.map((exercise, index) => ({
          exerciseId: 1, // This needs to be handled properly - we need to get exercise IDs
          order: index,
          notes: "",
          sets: [
            {
              reps: exercise.reps,
              weight: exercise.weight || null,
              notes: "",
            },
          ],
        }));

        formData.append("exercises", JSON.stringify(exercises));
        result = await planWorkout(formData);
      } else {
        // For start mode, use the existing save workflow
        result = await saveWorkout({
          workoutTitle: workoutTitle.trim(),
          workoutNotes: workoutNotes.trim() || null,
          exercises: selectedExercises,
        });
      }

      if (result.success) {
        toast.success(
          result.message ||
            `Workout ${mode === "plan" ? "planned" : "saved"} successfully!`,
        );
        // Redirect to workouts page or workout detail
        router.push("/dashboard/workouts");
      } else {
        toast.error(result.error || `Failed to ${mode} workout`);
      }
    } catch (error) {
      console.error(`Error ${mode}ing workout:`, error);
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
          <h1 className="text-4xl font-bold">
            {mode === "plan" ? "Plan Workout" : "Start Workout"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {mode === "plan"
              ? "Schedule a workout for later"
              : "Create and track your workout session"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/dashboard/workouts")}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Back
          </Button>
          <Button
            size="lg"
            className={
              mode === "plan"
                ? "bg-gray-500 hover:bg-gray-600"
                : "bg-blue-500 hover:bg-blue-600"
            }
            onClick={saveData}
            disabled={isSaving}
          >
            {mode === "plan" ? (
              <Clock3 className="mr-2 h-4 w-4" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSaving
              ? mode === "plan"
                ? "Planning..."
                : "Saving..."
              : mode === "plan"
                ? "Plan Workout"
                : "Save Workout"}
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
          {mode === "plan" && (
            <div>
              <label className="mb-2 block text-sm font-medium">
                Scheduled Date <span className="text-destructive">*</span>
              </label>
              <Input
                type="date"
                value={workoutDate}
                onChange={(e) => setWorkoutDate(e.target.value)}
                className="max-w-md"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          )}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Notes{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </label>
            <textarea
              placeholder={
                mode === "plan"
                  ? "Add notes about this planned workout (e.g., goals, focus areas)..."
                  : "Add notes about this workout (e.g., how you felt, goals, achievements)..."
              }
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
                    variant="outline"
                    size="sm"
                    onClick={() => removeExercise(index)}
                    className="flex items-center gap-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-4 w-4" />
                    Remove
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
