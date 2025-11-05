import { Suspense } from "react";
import { getServerSession } from "@/lib/auth-server";
import { ArchivedWorkoutList } from "../_components/archived-workout-list";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ArchivedWorkoutsPage() {
  const session = await getServerSession();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/workouts" as="/dashboard/workouts">
            <Button variant="outline" size="sm">
              <ArrowLeft className="size-4 mr-2" />
              Back to Workouts
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Archived Workouts</h1>
            <p className="text-muted-foreground">
              View your archived workout history
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">
            Archived Workouts
          </h3>
        </div>
        <div className="p-6 pt-0">
          <Suspense fallback={<WorkoutListSkeleton />}>
            <ArchivedWorkoutList userId={session?.user.id || ""} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function WorkoutListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 animate-pulse">
          <div className="h-12 w-12 bg-muted rounded-lg"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-32"></div>
            <div className="h-3 bg-muted rounded w-24"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
