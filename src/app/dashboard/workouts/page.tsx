import { Suspense } from "react";
import { getServerSession } from "@/lib/auth-server";
import { getWorkouts } from "@/actions/get-workouts";
import { getWorkoutStatistics } from "@/lib/workout-stats";
import { FilterableWorkoutSection } from "./_components/filterable-workout-section";
import { NewWorkoutButton } from "./_components/new-workout-button";
import { WorkoutViewTabs } from "./_components/workout-view-tabs";

export default async function WorkoutsPage() {
  const session = await getServerSession();

  // No need to check for session here since middleware and layout handle it
  // But we still need to get the session for user.id
  const userId = session?.user.id || "";

  // Debug: Log the userId and workout counts
  console.log("🔍 DEBUG - Full session object:", session);
  console.log("🆔 DEBUG - userId from session:", userId);
  console.log(
    "🧩 DEBUG - Expected userId from debug endpoint:",
    "7985bd0f-0bd2-430a-aebb-8160ea1a811d",
  );

  // Fetch initial workouts and stats for the client component
  const [initialWorkouts, workoutStats] = await Promise.all([
    getWorkouts(userId, { limit: 50 }), // Remove status filter to see all workouts
    getWorkoutStatistics(userId),
  ]);

  console.log("Debug - initialWorkouts count:", initialWorkouts.length);
  console.log("Debug - workoutStats:", workoutStats);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Workouts</h1>
          <p className="text-muted-foreground">
            View your saved workout history and create new workouts
          </p>
        </div>
        <div className="flex gap-2">
          <NewWorkoutButton />
        </div>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <WorkoutViewTabs
          userId={userId}
          initialStats={workoutStats}
          initialWorkouts={initialWorkouts}
        />
      </Suspense>
    </div>
  );
}
