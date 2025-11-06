import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RoutineList } from "./_components/routine-list";
import { NewRoutineDialog } from "./_components/new-routine-dialog";
import { SeedRoutinesButton } from "./_components/seed-routines-button";

export default function RoutinesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Workout Routines
          </h1>
          <p className="text-muted-foreground">
            Create and manage your workout routines for quick planning.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SeedRoutinesButton />
          <NewRoutineDialog />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Routines</CardTitle>
          <CardDescription>
            Click "Plan Workout" on any routine to schedule it for a specific
            day.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            }
          >
            <RoutineList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
