"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Save, Clock3, Play, Dumbbell, Hash, Target, Weight, Trash2, ArrowLeft } from "lucide-react";
import { ExerciseSearch } from "./exercise-search";
import { saveWorkout } from "@/actions/save-workout";
import { planWorkout } from "@/actions/plan-workout";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface WorkoutSet {
  id: string;
  reps: number;
  weight: number | null;
}

interface Exercise {
  id: string;
  name: string;
  sets: WorkoutSet[];
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

  // Generate unique ID for sets/exercises
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleAddExercise = (exerciseName: string) => {
    const newExercise: Exercise = {
      id: generateId(),
      name: exerciseName,
      sets: [
        {
          id: generateId(),
          reps: 0,
          weight: null,
        },
      ],
    };
    setSelectedExercises([...selectedExercises, newExercise]);
    setShowExerciseSearch(false);
  };

  const addSetToExercise = (exerciseId: string) => {
    setSelectedExercises(prev => 
      prev.map(exercise => 
        exercise.id === exerciseId 
          ? {
              ...exercise,
              sets: [...exercise.sets, {
                id: generateId(),
                reps: 0,
                weight: null,
              }]
            }
          : exercise
      )
    );
  };

  const removeSetFromExercise = (exerciseId: string, setId: string) => {
    setSelectedExercises(prev => 
      prev.map(exercise => 
        exercise.id === exerciseId 
          ? {
              ...exercise,
              sets: exercise.sets.filter(set => set.id !== setId)
            }
          : exercise
      )
    );
  };

  const updateSet = (exerciseId: string, setId: string, field: "reps" | "weight", value: string) => {
    setSelectedExercises(prev => 
      prev.map(exercise => 
        exercise.id === exerciseId 
          ? {
              ...exercise,
              sets: exercise.sets.map(set => 
                set.id === setId 
                  ? {
                      ...set,
                      [field]: field === "reps" 
                        ? parseInt(value) || 0 
                        : value === "" ? null : parseFloat(value) || null
                    }
                  : set
              )
            }
          : exercise
      )
    );
  };

  const removeExercise = (exerciseId: string) => {
    setSelectedExercises(selectedExercises.filter(ex => ex.id !== exerciseId));
  };

  async function saveData() {
    // Validation
    if (!workoutTitle || workoutTitle.trim() === "") {
      toast.error("Please enter a workout title");
      return;
    }

    if (selectedExercises.length === 0) {
      toast.error("Please add at least one exercise");
      return;
    }

    // Check if all exercises have at least one set with reps
    const hasInvalidSets = selectedExercises.some(ex => 
      ex.sets.length === 0 || ex.sets.every(set => !set.reps || set.reps === 0)
    );
    
    if (hasInvalidSets) {
      toast.error("Please enter repetitions for all sets");
      return;
    }

    setIsSaving(true);

    try {
      let result;

      if (mode === "plan") {
        // For plan mode, use the planWorkout action
        const formData = new FormData();
        formData.append("workoutTitle", workoutTitle.trim());
        formData.append("workoutNotes", workoutNotes.trim() || "");
        formData.append("workoutDate", workoutDate);

        const exercises = selectedExercises.map((exercise) => ({
          name: exercise.name,
          notes: "",
          sets: exercise.sets.map(set => ({
            reps: set.reps,
            weight: set.weight,
            notes: "",
          })),
        }));

        formData.append("exercises", JSON.stringify(exercises));
        result = await planWorkout(formData);
      } else {
        // For start mode, convert to legacy format for saveWorkout
        const legacyExercises = selectedExercises.flatMap(exercise => 
          exercise.sets.map(set => ({
            name: exercise.name,
            reps: set.reps,
            weight: set.weight || undefined,
          }))
        );

        result = await saveWorkout({
          workoutTitle: workoutTitle.trim(),
          workoutNotes: workoutNotes.trim() || null,
          exercises: legacyExercises,
        });
      }

      if (result.success) {
        toast.success(
          result.message ||
            `Workout ${mode === "plan" ? "planned" : "started"} successfully!`,
        );
        
        // Redirect based on mode
        if (mode === "start" && result.workoutId) {
          // For started workouts, redirect to the workout page to continue
          router.push(`/dashboard/workouts/${result.workoutId}`);
        } else {
          // For planned workouts, redirect to workouts list
          router.push("/dashboard/workouts");
        }
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

  const totalSets = selectedExercises.reduce((total, ex) => total + ex.sets.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/workouts")}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {mode === "plan" ? (
                  <Clock3 className="h-6 w-6 text-blue-600" />
                ) : (
                  <Play className="h-6 w-6 text-blue-600" />
                )}
                {mode === "plan" ? "Plan Workout" : "Start Workout"}
              </h1>
              <p className="text-gray-600 text-sm">
                {mode === "plan"
                  ? "Schedule a workout for later"
                  : "Build your workout session"}
              </p>
            </div>
          </div>
          
          {selectedExercises.length > 0 && (
            <Badge variant="outline" className="text-sm border-blue-200 text-blue-700">
              {selectedExercises.length} exercise{selectedExercises.length !== 1 ? 's' : ''} • {totalSets} set{totalSets !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Workout Title - Sleek and Minimal */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Target className="h-4 w-4 text-blue-600" />
              <label className="text-sm font-medium text-gray-700">Workout Name</label>
            </div>
            <Input
              placeholder="What's today's focus? (e.g., Push Day, Leg Blast, Full Body)"
              value={workoutTitle}
              onChange={(e) => setWorkoutTitle(e.target.value)}
              className="text-base font-medium border-gray-200 focus-visible:ring-blue-500 focus-visible:border-blue-500"
            />
            
            <div className="flex items-center gap-4 mt-4">
              {mode === "plan" && (
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    Scheduled Date
                  </label>
                  <Input
                    type="date"
                    value={workoutDate}
                    onChange={(e) => setWorkoutDate(e.target.value)}
                    className="w-40 text-sm border-gray-200 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              )}

              {!workoutNotes ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setWorkoutNotes("")}
                  className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 mt-4"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add notes
                </Button>
              ) : (
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    Notes
                  </label>
                  <textarea
                    placeholder={
                      mode === "plan"
                        ? "Any notes for this planned workout..."
                        : "How are you feeling? Any specific goals for today..."
                    }
                    value={workoutNotes}
                    onChange={(e) => setWorkoutNotes(e.target.value)}
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 resize-none"
                    rows={2}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Exercises Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Dumbbell className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Exercises</h2>
            </div>
            <Button
              onClick={() => setShowExerciseSearch(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
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

          {/* Selected Exercises */}
          {selectedExercises.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
              <CardContent className="p-12 text-center">
                <Dumbbell className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No exercises yet</h3>
                <p className="text-gray-500 mb-4">Add your first exercise to get started</p>
                <Button
                  onClick={() => setShowExerciseSearch(true)}
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Browse Exercises
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {selectedExercises.map((exercise, exerciseIndex) => (
                <Card key={exercise.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-700">{exerciseIndex + 1}</span>
                        </div>
                        <CardTitle className="text-lg text-gray-900">{exercise.name}</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExercise(exercise.id)}
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Sets */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                        <Hash className="h-4 w-4" />
                        <span>Sets</span>
                      </div>
                      
                      {exercise.sets.map((set, setIndex) => (
                        <div key={set.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-gray-700">{setIndex + 1}</span>
                          </div>
                          
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-blue-500" />
                              <Input
                                type="number"
                                min="1"
                                placeholder="Reps"
                                value={set.reps || ""}
                                onChange={(e) => updateSet(exercise.id, set.id, "reps", e.target.value)}
                                className="w-16 text-center font-medium text-sm border-gray-200 focus-visible:ring-blue-500"
                              />
                              <span className="text-xs text-gray-500">reps</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Weight className="h-4 w-4 text-gray-500" />
                              <Input
                                type="number"
                                min="0"
                                step="0.5"
                                placeholder="Weight"
                                value={set.weight || ""}
                                onChange={(e) => updateSet(exercise.id, set.id, "weight", e.target.value)}
                                className="w-20 text-center font-medium text-sm border-gray-200 focus-visible:ring-blue-500"
                              />
                              <span className="text-xs text-gray-500">kg</span>
                            </div>
                          </div>
                          
                          {exercise.sets.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSetFromExercise(exercise.id, set.id)}
                              className="text-gray-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      {/* Add Set Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addSetToExercise(exercise.id)}
                        className="w-full border-dashed border-gray-300 text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Set
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        {selectedExercises.length > 0 && (
          <div className="sticky bottom-6 pt-4">
            <Card className="border border-gray-200 bg-white shadow-lg">
              <CardContent className="p-4">
                <Button
                  size="lg"
                  onClick={saveData}
                  disabled={isSaving}
                  className={`w-full text-base font-semibold ${
                    mode === "plan"
                      ? "bg-gray-600 hover:bg-gray-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white`}
                >
                  {mode === "plan" ? (
                    <Clock3 className="mr-3 h-5 w-5" />
                  ) : (
                    <Play className="mr-3 h-5 w-5" />
                  )}
                  {isSaving
                    ? mode === "plan"
                      ? "Planning..."
                      : "Starting..."
                    : mode === "plan"
                      ? "Plan Workout"
                      : "Start Workout"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}