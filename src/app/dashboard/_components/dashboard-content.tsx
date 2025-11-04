import { Activity, TrendingUp, Calendar, Target, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { db } from "@/db";
import { workout } from "@/db/schema";
import { eq, count, sql } from "drizzle-orm";
import { QuickStartButton } from "./quick-start-button";

interface DashboardContentProps {
  userName: string;
  userId: string;
}

async function getWorkoutStats(userId: string) {
  // Get total workouts
  const totalWorkouts = await db
    .select({ count: count() })
    .from(workout)
    .where(eq(workout.userId, userId));

  // Get workouts this month
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const monthlyWorkouts = await db
    .select({ count: count() })
    .from(workout)
    .where(
      sql`${workout.userId} = ${userId} AND ${workout.date} >= ${thisMonth.getTime()}`,
    );

  // Get workouts this week
  const thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay());
  thisWeek.setHours(0, 0, 0, 0);

  const weeklyWorkouts = await db
    .select({ count: count() })
    .from(workout)
    .where(
      sql`${workout.userId} = ${userId} AND ${workout.date} >= ${thisWeek.getTime()}`,
    );

  // Calculate average duration
  const avgDuration = await db
    .select({ avg: sql<number>`AVG(${workout.duration})` })
    .from(workout)
    .where(eq(workout.userId, userId));

  return {
    total: totalWorkouts[0]?.count || 0,
    thisMonth: monthlyWorkouts[0]?.count || 0,
    thisWeek: weeklyWorkouts[0]?.count || 0,
    avgDuration: Math.round(avgDuration[0]?.avg || 0),
  };
}

export async function DashboardContent({ userName, userId }: DashboardContentProps) {
  const workoutStats = await getWorkoutStats(userId);

  const stats = [
    {
      title: "Total Workouts",
      value: workoutStats.total.toString(),
      description: "Workouts completed",
      icon: Activity,
      color: "text-blue-600",
    },
    {
      title: "This Week",
      value: workoutStats.thisWeek.toString(),
      description: "Workouts this week",
      icon: Calendar,
      color: "text-green-600",
    },
    {
      title: "Average Duration",
      value: `${workoutStats.avgDuration}m`,
      description: "Per workout",
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      title: "This Month",
      value: workoutStats.thisMonth.toString(),
      description: "Workouts this month",
      icon: Target,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {userName}!</h1>
        <p className="text-muted-foreground">
          Track your workouts and monitor your fitness progress
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Action Card */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>
              Ready to begin your fitness journey?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <QuickStartButton />
              <p className="text-sm text-muted-foreground text-center">
                Track exercises, sets, reps, and weights to monitor your
                progress over time.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your workout history will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <Activity className="size-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No workouts yet. Create your first workout to see your activity
                here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Features we're working on to enhance your fitness journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <TrendingUp className="size-8 text-green-600" />
              <div>
                <h4 className="font-medium">Progress Tracking</h4>
                <p className="text-sm text-muted-foreground">
                  Visual progress charts and analytics
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <Calendar className="size-8 text-purple-600" />
              <div>
                <h4 className="font-medium">Workout Scheduling</h4>
                <p className="text-sm text-muted-foreground">
                  Plan and schedule your workouts
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <Users className="size-8 text-orange-600" />
              <div>
                <h4 className="font-medium">Goal Setting</h4>
                <p className="text-sm text-muted-foreground">
                  Set and track fitness goals
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
