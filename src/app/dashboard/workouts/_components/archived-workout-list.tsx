import { getWorkouts } from "@/actions/get-workouts";
import { format } from "date-fns";
import { Clock, Calendar, Archive, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { UnarchiveWorkoutButton } from "./unarchive-workout-button";

interface ArchivedWorkoutListProps {
  userId: string;
}

type Workout = {
  id: number;
  name: string;
  status: string;
  date: Date;
  duration: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

export async function ArchivedWorkoutList({
  userId,
}: ArchivedWorkoutListProps) {
  const workouts = await getWorkouts(userId, { status: "archived" });

  if (workouts.length === 0) {
    return (
      <div className="text-center py-8">
        <Archive className="size-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Archived Workouts</h3>
        <p className="text-muted-foreground">
          You haven't archived any workouts yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {workouts.map((workout: Workout) => (
        <Card key={workout.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{workout.name}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="size-4" />
                    {format(new Date(workout.date), "PPP")}
                  </div>
                  {workout.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="size-4" />
                      {workout.duration} minutes
                    </div>
                  )}
                </div>
                {workout.notes && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {workout.notes}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                  <Archive className="size-3" />
                  Archived
                </div>
                <UnarchiveWorkoutButton workoutId={workout.id} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
