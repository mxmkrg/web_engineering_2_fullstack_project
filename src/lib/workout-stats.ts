import { db } from "@/db";
import { workout } from "@/db/schema";
import { eq, count, sql, and, inArray } from "drizzle-orm";

export interface WorkoutStatsData {
  total: number;
  thisMonth: number;
  thisWeek: number;
  avgDuration: number;
}

export async function getWorkoutStatistics(
  userId: string,
  includePlanned: boolean = false,
): Promise<WorkoutStatsData> {
  // Define which statuses to include
  const statuses = includePlanned 
    ? ["completed", "archived", "planned"] 
    : ["completed", "archived"];

  // Get total completed and archived workouts (and planned if requested)
  const totalWorkouts = await db
    .select({ count: count() })
    .from(workout)
    .where(
      and(
        eq(workout.userId, userId),
        inArray(workout.status, statuses),
      ),
    );

  // Get workouts this month
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const statusCondition = statuses.map(status => `'${status}'`).join(', ');
  const monthlyWorkouts = await db
    .select({ count: count() })
    .from(workout)
    .where(
      sql`${workout.userId} = ${userId} AND ${workout.status} IN (${sql.raw(statusCondition)}) AND ${workout.date} >= ${thisMonth.getTime()}`,
    );

  // Get workouts this week (starting from Monday)
  const thisWeek = new Date();
  const currentDay = thisWeek.getDay();
  const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // Sunday = 0, so 6 days from Monday
  thisWeek.setDate(thisWeek.getDate() - daysFromMonday);
  thisWeek.setHours(0, 0, 0, 0);

  const weeklyWorkouts = await db
    .select({ count: count() })
    .from(workout)
    .where(
      sql`${workout.userId} = ${userId} AND ${workout.status} IN (${sql.raw(statusCondition)}) AND ${workout.date} >= ${thisWeek.getTime()}`,
    );

  // Calculate average duration for included workout statuses
  const avgDuration = await db
    .select({ avg: sql<number>`AVG(${workout.duration})` })
    .from(workout)
    .where(
      and(
        eq(workout.userId, userId),
        inArray(workout.status, statuses),
      ),
    );

  return {
    total: totalWorkouts[0]?.count || 0,
    thisMonth: monthlyWorkouts[0]?.count || 0,
    thisWeek: weeklyWorkouts[0]?.count || 0,
    avgDuration: Math.round(avgDuration[0]?.avg || 0),
  };
}
