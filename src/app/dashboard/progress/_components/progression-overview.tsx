import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getProgressionOverview,
  DateFilter,
} from "@/actions/get-progression-stats";
import { Activity, TrendingUp, Target, Calendar } from "lucide-react";

interface ProgressionOverviewProps {
  userId: string;
  dateFilter?: DateFilter;
}

export async function ProgressionOverview({
  userId,
  dateFilter,
}: ProgressionOverviewProps) {
  const overview = await getProgressionOverview(userId, dateFilter);

  // Show getting started message if no data
  if (overview.totalWorkouts === 0) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Workouts
              </CardTitle>
              <Activity className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                No workouts completed yet
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Personal Records
              </CardTitle>
              <TrendingUp className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Start tracking to see records
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Workout Frequency
              </CardTitle>
              <Calendar className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">per week average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Muscle Groups
              </CardTitle>
              <Target className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                trained this period
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                To see progression statistics, you need to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Create some workouts in the Workouts section</li>
                <li>Add exercises to your workouts</li>
                <li>Mark your workouts as "completed" when finished</li>
                <li>Track your sets, reps, and weights</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                Once you have completed workouts with tracked sets, you'll see
                detailed progression charts and muscle group analysis here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Workouts
            </CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalWorkouts}</div>
            <p className="text-xs text-muted-foreground">
              {overview.completedWorkouts} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exercises</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalExercises}</div>
            <p className="text-xs text-muted-foreground">Unique exercises</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.thisWeekWorkouts}
            </div>
            <p className="text-xs text-muted-foreground">Workouts this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <Target className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.recentTrend || "Getting Started"}
            </div>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Message */}
      {overview.completedWorkouts === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You have {overview.totalWorkouts} workout(s) but none are marked
              as completed. Complete some workouts to unlock detailed
              progression analytics!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
