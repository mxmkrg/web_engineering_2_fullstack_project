"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, BookOpen, Clock, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoutineBuilder } from "./routine-builder";

type Routine = {
  id: number;
  name: string;
  description: string | null;
  category: string;
  difficulty: string;
  duration: number | null;
  tags: string[];
  isPublic: boolean;
  isTemplate: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  exerciseCount: number;
};

type Exercise = {
  id: number;
  name: string;
  category: string;
  muscleGroups: string;
  equipment: string | null;
  description: string | null;
};

interface RoutinesContentProps {
  userId: string;
  initialRoutines: Routine[];
  exercises: Exercise[];
  onGetRoutines: () => Promise<Routine[]>;
  onCreateRoutine: (
    formData: FormData,
  ) => Promise<{ success: boolean; error?: string; routineId?: number }>;
  onGetExercises: () => Promise<Exercise[]>;
  onGetRoutineWithExercises: (routineId: number) => Promise<any>;
}

export function RoutinesContent({
  userId,
  initialRoutines,
  exercises,
  onGetRoutines,
  onCreateRoutine,
  onGetExercises,
  onGetRoutineWithExercises,
}: RoutinesContentProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [routines, setRoutines] = useState<Routine[]>(initialRoutines);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setRoutines(initialRoutines);
  }, [initialRoutines]);

  const refreshRoutines = async () => {
    setLoading(true);
    try {
      const userRoutines = await onGetRoutines();
      setRoutines(userRoutines);
    } catch (error) {
      console.error("Error fetching routines:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = async (routine: Routine) => {
    try {
      // Get the routine with exercises
      const routineWithExercises = await onGetRoutineWithExercises(routine.id);

      if (
        !routineWithExercises ||
        !routineWithExercises.exercises ||
        routineWithExercises.exercises.length === 0
      ) {
        alert(
          "This routine has no exercises yet. Please edit the routine to add exercises first.",
        );
        return;
      }

      // Store routine data in localStorage to pass to workout creation
      const workoutTemplate = {
        name: `${routine.name} Workout`,
        routineId: routine.id,
        exercises: routineWithExercises.exercises,
      };

      localStorage.setItem("workoutTemplate", JSON.stringify(workoutTemplate));

      // Navigate to workout creation page
      router.push("/dashboard/workouts/new?fromRoutine=true");
    } catch (error) {
      console.error("Error starting workout from routine:", error);
      alert("Failed to start workout from routine. Please try again.");
    }
  };

  const handleEditRoutine = (routine: Routine) => {
    // TODO: Implement routine editing
    // This would open the routine builder in edit mode
    alert(`Editing "${routine.name}" - Coming soon!`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "strength":
        return Target;
      case "hypertrophy":
        return Users;
      case "endurance":
        return Clock;
      default:
        return BookOpen;
    }
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div>Loading routines...</div>
      ) : (
        <>
          {/* Header with Create Button */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">
                Create and manage your custom workout routines
              </p>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="size-4 mr-2" />
              Create Routine
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Routines
                </CardTitle>
                <BookOpen className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {routines?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Custom workout routines
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Duration
                </CardTitle>
                <Clock className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(routines?.length || 0) > 0
                    ? Math.round(
                        (routines || [])
                          .filter((r) => r.duration)
                          .reduce((acc, r) => acc + (r.duration || 0), 0) /
                          (routines || []).filter((r) => r.duration).length,
                      ) || 0
                    : 0}
                  m
                </div>
                <p className="text-xs text-muted-foreground">
                  Average workout time
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Categories
                </CardTitle>
                <Target className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set((routines || []).map((r) => r.category)).size}
                </div>
                <p className="text-xs text-muted-foreground">
                  Different routine types
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Routines Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your Routines</h3>
            {(routines?.length || 0) === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="size-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No routines yet
                  </h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create your first custom workout routine to get started
                  </p>
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="size-4 mr-2" />
                    Create Your First Routine
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {(routines || []).map((routine) => {
                  const CategoryIcon = getCategoryIcon(routine.category);
                  return (
                    <Card
                      key={routine.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CategoryIcon className="size-5 text-blue-600" />
                            <CardTitle className="text-lg">
                              {routine.name}
                            </CardTitle>
                          </div>
                          <Badge
                            className={getDifficultyColor(routine.difficulty)}
                          >
                            {routine.difficulty}
                          </Badge>
                        </div>
                        <CardDescription>
                          {routine.description || "No description"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="size-4" />
                              {routine.duration || "N/A"}m
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="size-4" />
                              {routine.exerciseCount} exercises
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {routine.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleEditRoutine(routine)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => handleStartWorkout(routine)}
                            >
                              Start Workout
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Create Routine Builder */}
      <RoutineBuilder
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        userId={userId}
        exercises={exercises}
        onCreateRoutine={onCreateRoutine}
        onRoutineCreated={refreshRoutines}
      />
    </div>
  );
}
