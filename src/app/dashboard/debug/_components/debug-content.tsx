"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Database,
  Loader2,
  CheckCircle,
  AlertCircle,
  Dumbbell,
  Calendar,
  Trash2,
  Users,
} from "lucide-react";
import { seedExercises } from "@/actions/seed-exercises";
import { seedWorkouts } from "@/actions/seed-workouts";
import { clearWorkouts } from "@/actions/clear-workouts";
import { seedRoutines } from "@/actions/seed-routines";
import { clearExercises } from "@/actions/clear-exercises";
import { clearRoutines } from "@/actions/clear-routines";
import { toggleUserRole } from "@/actions/user/toggle-user-role";

interface DebugContentProps {
  userId: string;
}

interface ActionResult {
  success: boolean;
  message: string;
}

export function DebugContent({ userId }: DebugContentProps) {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeedingWorkouts, setIsSeedingWorkouts] = useState(false);
  const [isClearingWorkouts, setIsClearingWorkouts] = useState(false);
  const [isSeedingRoutines, setIsSeedingRoutines] = useState(false);
  const [isClearingExercises, setIsClearingExercises] = useState(false);
  const [isClearingRoutines, setIsClearingRoutines] = useState(false);
  const [isTogglingRole, setIsTogglingRole] = useState(false);

  const [seedResult, setSeedResult] = useState<ActionResult | null>(null);
  const [workoutResult, setWorkoutResult] = useState<ActionResult | null>(null);
  const [clearResult, setClearResult] = useState<ActionResult | null>(null);
  const [routineResult, setRoutineResult] = useState<ActionResult | null>(null);
  const [clearExerciseResult, setClearExerciseResult] = useState<ActionResult | null>(null);
  const [clearRoutineResult, setClearRoutineResult] = useState<ActionResult | null>(null);
  const [roleResult, setRoleResult] = useState<ActionResult | null>(null);

  const handleSeedExercises = async () => {
    setIsSeeding(true);
    setSeedResult(null);

    try {
      const result = await seedExercises();
      setSeedResult({
        success: result.success,
        message: result.success ? result.message! : result.error || "Failed to seed exercises",
      });
    } catch (error) {
      setSeedResult({
        success: false,
        message: "Error: " + (error as Error).message,
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSeedWorkouts = async () => {
    setIsSeedingWorkouts(true);
    setWorkoutResult(null);

    try {
      const result = await seedWorkouts();
      setWorkoutResult({
        success: result.success,
        message: result.success ? result.message! : result.error || "Failed to seed workouts",
      });
    } catch (error) {
      setWorkoutResult({
        success: false,
        message: "Error: " + (error as Error).message,
      });
    } finally {
      setIsSeedingWorkouts(false);
    }
  };

  const handleClearWorkouts = async () => {
    setIsClearingWorkouts(true);
    setClearResult(null);

    try {
      const result = await clearWorkouts();
      setClearResult({
        success: result.success,
        message: result.success ? result.message! : result.error || "Failed to clear workouts",
      });
    } catch (error) {
      setClearResult({
        success: false,
        message: "Error: " + (error as Error).message,
      });
    } finally {
      setIsClearingWorkouts(false);
    }
  };

  const handleSeedRoutines = async () => {
    setIsSeedingRoutines(true);
    setRoutineResult(null);

    try {
      await seedRoutines();
      setRoutineResult({
        success: true,
        message: "Sample routines seeded successfully!",
      });
    } catch (error) {
      setRoutineResult({
        success: false,
        message: "Error: " + (error as Error).message,
      });
    } finally {
      setIsSeedingRoutines(false);
    }
  };

  const handleClearExercises = async () => {
    setIsClearingExercises(true);
    setClearExerciseResult(null);

    try {
      const result = await clearExercises();
      setClearExerciseResult({
        success: result.success,
        message: result.success ? result.message! : result.error || "Failed to clear exercises",
      });
    } catch (error) {
      setClearExerciseResult({
        success: false,
        message: "Error: " + (error as Error).message,
      });
    } finally {
      setIsClearingExercises(false);
    }
  };

  const handleClearRoutines = async () => {
    setIsClearingRoutines(true);
    setClearRoutineResult(null);

    try {
      const result = await clearRoutines();
      setClearRoutineResult({
        success: result.success,
        message: result.success ? result.message! : result.error || "Failed to clear routines",
      });
    } catch (error) {
      setClearRoutineResult({
        success: false,
        message: "Error: " + (error as Error).message,
      });
    } finally {
      setIsClearingRoutines(false);
    }
  };

  const handleToggleRole = async (newRole: "admin" | "user") => {
    setIsTogglingRole(true);
    setRoleResult(null);

    try {
      const result = await toggleUserRole(userId, newRole);
      setRoleResult({
        success: result.success,
        message: result.success ? result.message! : result.error || "Failed to update role",
      });
    } catch (error) {
      setRoleResult({
        success: false,
        message: "Error: " + (error as Error).message,
      });
    } finally {
      setIsTogglingRole(false);
    }
  };

  const ResultMessage = ({ result }: { result: ActionResult | null }) => {
    if (!result) return null;

    return (
      <div
        className={`flex items-center gap-2 p-3 rounded-lg ${
          result.success
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-700 border border-red-200"
        }`}
      >
        {result.success ? (
          <CheckCircle className="size-4" />
        ) : (
          <AlertCircle className="size-4" />
        )}
        <span className="text-sm">{result.message}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Exercise Management */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Exercise Management</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Seed Exercise Database */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="size-5" />
                Seed Exercise Library
              </CardTitle>
              <CardDescription>
                Populate database with comprehensive exercise library
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Creates 66 exercises total:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <strong>
                      Chest (8), Back (10), Legs (10), Shoulders (8)
                    </strong>{" "}
                    - major muscle groups
                  </li>
                  <li>
                    <strong>
                      Arms (6), Core (5), Cardio (6), Functional (3)
                    </strong>{" "}
                    - supporting exercises
                  </li>
                </ul>
                <p className="mt-2">
                  Each exercise includes detailed instructions and muscle group
                  targeting.
                </p>
              </div>

              <ResultMessage result={seedResult} />

              <Button
                onClick={handleSeedExercises}
                disabled={isSeeding}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Seeding...
                  </>
                ) : (
                  <>
                    <Database className="size-4 mr-2" />
                    Seed Exercise Library
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Clear Exercise Library */}
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Dumbbell className="size-5" />
                Clear Exercise Library
              </CardTitle>
              <CardDescription className="text-red-600">
                Remove all exercises from the database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="text-red-700">
                  This will permanently delete all exercises from the exercise library.
                </p>
                <p className="text-red-600 font-medium mt-2 bg-red-100 p-2 rounded-md border border-red-200">
                  ⚠️ This will affect all users and cannot be undone!
                </p>
              </div>

              <ResultMessage result={clearExerciseResult} />

              <Button
                onClick={handleClearExercises}
                disabled={isClearingExercises}
                variant="destructive"
                className="w-full font-medium shadow-sm bg-red-600 hover:bg-red-700 text-white"
              >
                {isClearingExercises ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Dumbbell className="size-4 mr-2" />
                    Clear Exercise Library
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Routine Management */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Routine Management</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Seed Sample Routines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5" />
                Seed Sample Routines
              </CardTitle>
              <CardDescription>
                Add sample workout routines for testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Creates sample routines:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <strong>Push Day</strong> - Chest, shoulders, triceps
                  </li>
                  <li>
                    <strong>Pull Day</strong> - Back and biceps
                  </li>
                  <li>
                    <strong>Leg Day</strong> - Lower body strength
                  </li>
                  <li>
                    <strong>Full Body Beginner</strong> - Complete workout
                  </li>
                </ul>
              </div>

              <ResultMessage result={routineResult} />

              <Button
                onClick={handleSeedRoutines}
                disabled={isSeedingRoutines}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
              >
                {isSeedingRoutines ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Seeding Routines...
                  </>
                ) : (
                  <>
                    <Database className="size-4 mr-2" />
                    Seed Sample Routines
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Clear User Routines */}
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Users className="size-5" />
                Clear All Routines
              </CardTitle>
              <CardDescription className="text-red-600">
                Remove all user routines and their exercises
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="text-red-700">
                  This will permanently delete all your saved routines and their exercise configurations.
                </p>
                <p className="text-red-600 font-medium mt-2 bg-red-100 p-2 rounded-md border border-red-200">
                  ⚠️ This action cannot be undone!
                </p>
              </div>

              <ResultMessage result={clearRoutineResult} />

              <Button
                onClick={handleClearRoutines}
                disabled={isClearingRoutines}
                variant="destructive"
                className="w-full font-medium shadow-sm bg-red-600 hover:bg-red-700 text-white"
              >
                {isClearingRoutines ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Users className="size-4 mr-2" />
                    Clear All Routines
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Workout Management */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Workout Management</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Seed Progressive Workout Journey */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-5" />
                Seed Workout Journey
              </CardTitle>
              <CardDescription>
                Create 3-month progressive training program
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Creates 36 workouts across 3 months:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <strong>Weeks 1-4:</strong> Full body foundation
                  </li>
                  <li>
                    <strong>Weeks 5-8:</strong> Upper/lower split
                  </li>
                  <li>
                    <strong>Weeks 9-12:</strong> Push/pull/legs
                  </li>
                </ul>
                <p className="mt-2">
                  Perfect for testing progression statistics and filtering features.
                </p>
              </div>

              <ResultMessage result={workoutResult} />

              <Button
                onClick={handleSeedWorkouts}
                disabled={isSeedingWorkouts}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
              >
                {isSeedingWorkouts ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Creating Journey...
                  </>
                ) : (
                  <>
                    <Calendar className="size-4 mr-2" />
                    Seed 3-Month Journey
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Clear All Workouts */}
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Trash2 className="size-5" />
                Clear All Workouts
              </CardTitle>
              <CardDescription className="text-red-600">
                Permanently delete all workout data for current user
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="text-red-700">
                  This will permanently delete all workouts, exercises, and sets
                  for the current user.
                </p>
                <p className="text-red-600 font-medium mt-2 bg-red-100 p-2 rounded-md border border-red-200">
                  ⚠️ This action cannot be undone!
                </p>
              </div>

              <ResultMessage result={clearResult} />

              <Button
                onClick={handleClearWorkouts}
                disabled={isClearingWorkouts}
                variant="destructive"
                className="w-full font-medium shadow-sm bg-red-600 hover:bg-red-700 text-white"
              >
                {isClearingWorkouts ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="size-4 mr-2" />
                    Clear All Workouts
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User Role Management */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">User Role Management</h3>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Toggle Current User Role
            </CardTitle>
            <CardDescription>
              Change the current user's role between admin and regular user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                <strong>Current User ID:</strong> {userId}
              </p>
              <p>
                Use this to quickly grant or revoke admin privileges for the current user.
                This is useful when the database is empty and no admin user exists.
              </p>
            </div>

            <ResultMessage result={roleResult} />

            <div className="grid gap-3 md:grid-cols-2">
              <Button
                onClick={() => handleToggleRole("admin")}
                disabled={isTogglingRole}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-sm"
              >
                {isTogglingRole ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Users className="size-4 mr-2" />
                    Make Admin
                  </>
                )}
              </Button>

              <Button
                onClick={() => handleToggleRole("user")}
                disabled={isTogglingRole}
                variant="outline"
                className="w-full font-medium shadow-sm"
              >
                {isTogglingRole ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Users className="size-4 mr-2" />
                    Make User
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Development Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Development Information</h3>
        <Card>
          <CardHeader>
            <CardTitle>Development Information</CardTitle>
            <CardDescription>
              Current environment and user details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Environment:</strong>{" "}
                {process.env.NODE_ENV || "development"}
              </p>
              <p>
                <strong>User ID:</strong> {userId}
              </p>
              <p>
                <strong>Note:</strong> This page is only accessible in
                development mode and will redirect to dashboard in production.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}