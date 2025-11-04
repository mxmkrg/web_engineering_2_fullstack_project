import { db } from "@/db";
import { workout } from "@/db/schema";
import { eq, count, sql } from "drizzle-orm";

export interface WorkoutStatsData {
  total: number;
  thisMonth: number;
  thisWeek: number;
  avgDuration: number;
}

export async function getWorkoutStatistics(
  userId: string,
): Promise<WorkoutStatsData> {
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
