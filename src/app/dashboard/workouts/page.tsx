import { Suspense } from "react";
import { getServerSession } from "@/lib/auth-server";
import { WorkoutList } from "./_components/workout-list";
import { WorkoutStats } from "./_components/workout-stats";
import { NewWorkoutButton } from "./_components/new-workout-button";

export default async function WorkoutsPage() {
  const session = await getServerSession();

  // No need to check for session here since middleware and layout handle it
  // But we still need to get the session for user.id

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workouts</h1>
          <p className="text-muted-foreground">
            Track your fitness journey and progress
          </p>
        </div>
        <NewWorkoutButton />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<StatsSkeleton />}>
          <WorkoutStats userId={session?.user.id || ""} />
        </Suspense>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">
            Recent Workouts
          </h3>
        </div>
        <div className="p-6 pt-0">
          <WorkoutList />
        </div>
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border bg-card text-card-foreground shadow-sm"
        >
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-24 mb-2"></div>
              <div className="h-8 bg-muted rounded w-16 mb-1"></div>
              <div className="h-3 bg-muted rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
