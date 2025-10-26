"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save, X } from "lucide-react";
import { ExerciseSelector } from "./exercise-selector";
import { SetManager } from "./set-manager";
import { createWorkoutAction } from "@/actions/create-workout-form-action";

interface Exercise {
  id: number;
  name: string;
  category: string;
  muscleGroups: string;
  equipment: string | null;
  description: string | null;
}

interface WorkoutSet {
  id: string;
  setNumber: number;
  reps: number | null;
  weight: number | null;
  completed: boolean;
}

interface WorkoutExercise {
  id: string;
  exerciseId: number;
  exerciseName: string;
  sets: WorkoutSet[];
  order: number;
}

interface NewWorkoutFormProps {
  exercises: Exercise[];
}

export function NewWorkoutForm({ exercises }: NewWorkoutFormProps) {
  const router = useRouter();
  const [workoutTitle, setWorkoutTitle] = useState("");
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>(
    [],
  );
  const [isSelectingExercise, setIsSelectingExercise] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const addExercise = (exerciseId: number, exerciseName: string) => {
    const newExercise: WorkoutExercise = {
      id: Math.random().toString(36).substr(2, 9),
      exerciseId,
      exerciseName,
      sets: [],
      order: workoutExercises.length,
    };
    setWorkoutExercises([...workoutExercises, newExercise]);
    setIsSelectingExercise(false);
  };

  const removeExercise = (exerciseId: string) => {
    setWorkoutExercises(workoutExercises.filter((ex) => ex.id !== exerciseId));
  };

  const updateExerciseSets = (exerciseId: string, sets: WorkoutSet[]) => {
    setWorkoutExercises(
      workoutExercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, sets } : ex,
      ),
    );
  };

  const saveWorkout = async () => {
    if (!workoutTitle.trim()) {
      alert("Please enter a workout title");
      return;
    }

    if (workoutExercises.length === 0) {
      alert("Please add at least one exercise");
      return;
    }

    setIsSaving(true);

    try {
      const workoutData = {
        name: workoutTitle,
        exercises: workoutExercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          order: ex.order,
          sets: ex.sets.map((set) => ({
            setNumber: set.setNumber,
            reps: set.reps,
            weight: set.weight,
            completed: set.completed,
          })),
        })),
      };

      const formData = new FormData();
      formData.append("workoutData", JSON.stringify(workoutData));

      await createWorkoutAction(null, formData);
    } catch (error) {
      console.error("Error saving workout:", error);
      alert("Failed to save workout");
      setIsSaving(false);
    }
  };

  const cancelWorkout = () => {
    if (workoutExercises.length > 0 || workoutTitle.trim()) {
      if (
        window.confirm(
          "Are you sure you want to cancel this workout? All progress will be lost.",
        )
      ) {
        router.push("/dashboard/workouts" as any);
      }
    } else {
      router.push("/dashboard/workouts" as any);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">New Workout</h1>
          <p className="text-muted-foreground">
            Create and track your workout session
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={cancelWorkout}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="size-4" />
            Cancel
          </button>
          <button
            type="button"
            onClick={saveWorkout}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="size-4" />
            {isSaving ? "Saving..." : "Save Workout"}
          </button>
        </div>
      </div>

      {/* Workout Title */}
      <Card>
        <CardHeader>
          <CardTitle>Workout Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="title">Workout Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Push Day, Leg Day, Full Body..."
              value={workoutTitle}
              onChange={(e) => setWorkoutTitle(e.target.value)}
              className="max-w-md"
              disabled={isSaving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Exercises */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Exercises</CardTitle>
            <button
              type="button"
              onClick={() => setIsSelectingExercise(true)}
              disabled={isSelectingExercise || isSaving}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="size-4" />
              Add Exercise
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {isSelectingExercise && (
            <div className="mb-6 p-4 border rounded-lg bg-muted/50">
              <ExerciseSelector
                exercises={exercises}
                onSelect={addExercise}
                onCancel={() => setIsSelectingExercise(false)}
              />
            </div>
          )}

          {workoutExercises.length === 0 && !isSelectingExercise ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No exercises added yet.</p>
              <p>Click "Add Exercise" to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workoutExercises.map((exercise, index) => (
                <Card key={exercise.id} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {index + 1}. {exercise.exerciseName}
                        </CardTitle>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExercise(exercise.id)}
                        className="p-2 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSaving}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <SetManager
                      sets={exercise.sets}
                      onSetsChange={(sets: WorkoutSet[]) =>
                        updateExerciseSets(exercise.id, sets)
                      }
                      disabled={isSaving}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
