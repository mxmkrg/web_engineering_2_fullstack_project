"use server";

import "server-only";
import { db } from "@/db";
import { workout, workoutExercise, workoutSet } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq, desc, and, gte, sql, inArray } from "drizzle-orm";

export type WorkoutFilterType = "total" | "thisWeek" | "thisMonth";

interface GetFilteredWorkoutsOptions {
  status?: string | string[];
  limit?: number;
  filter?: WorkoutFilterType;
}

export interface FilteredWorkoutsResult {
  workouts: any[];
  avgDuration: number;
  totalDuration: number;
  avgSets: number;
  totalSets: number;
}

export async function getFilteredWorkouts(
  userId: string,
  options: GetFilteredWorkoutsOptions = {},
): Promise<FilteredWorkoutsResult> {
  try {
    const session = await getServerSession();

    if (!session?.user?.id || session.user.id !== userId) {
      return { 
        workouts: [], 
        avgDuration: 0, 
        totalDuration: 0, 
        avgSets: 0, 
        totalSets: 0 
      };
    }

    const { status = ["completed", "archived"], limit = 50, filter = "total" } = options;

    // Calculate date ranges
    const now = new Date();
    let startDate: Date | null = null;

    switch (filter) {
      case "thisWeek": {
        // Get start of current week (Monday)
        const currentDay = now.getDay();
        const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // Sunday = 0, so 6 days from Monday
        startDate = new Date(now);
        startDate.setDate(now.getDate() - daysFromMonday);
        startDate.setHours(0, 0, 0, 0);
        break;
      }
      case "thisMonth": {
        // Get start of current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      }
      default:
        startDate = null; // No date filter
        break;
    }

    // Build query conditions
    const conditions = [eq(workout.userId, userId)];

    // Add status condition
    if (Array.isArray(status)) {
      conditions.push(inArray(workout.status, status));
    } else {
      conditions.push(eq(workout.status, status));
    }

    if (startDate) {
      conditions.push(gte(workout.date, startDate));
    }

    // Fetch filtered workouts
    const workouts = await db
      .select()
      .from(workout)
      .where(and(...conditions))
      .orderBy(desc(workout.date))
      .limit(limit);

    // Calculate average duration for the filtered workouts
    const avgDurationResult = await db
      .select({ avg: sql<number>`AVG(${workout.duration})` })
      .from(workout)
      .where(and(...conditions));

    const avgDuration = Math.round(avgDurationResult[0]?.avg || 0);

    // Calculate total duration for the filtered workouts
    const totalDurationResult = await db
      .select({ sum: sql<number>`SUM(${workout.duration})` })
      .from(workout)
      .where(and(...conditions));

    const totalDuration = Math.round(totalDurationResult[0]?.sum || 0);

    // Calculate set statistics for the filtered workouts
    // First, let's test a simpler query to see if sets exist at all
    const allSetsCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(workoutSet);

    console.log("🔍 Total sets in database:", allSetsCount[0]?.count);

    // Test without conditions first
    const setStatsNoConditions = await db
      .select({
        totalSets: sql<number>`COUNT(${workoutSet.id})`,
        totalWorkouts: sql<number>`COUNT(DISTINCT ${workout.id})`,
      })
      .from(workout)
      .leftJoin(workoutExercise, eq(workout.id, workoutExercise.workoutId))
      .leftJoin(workoutSet, eq(workoutExercise.id, workoutSet.workoutExerciseId))
      .where(eq(workout.userId, userId));

    console.log("🔍 Set stats without date filter:", setStatsNoConditions);

    const setStatsResult = await db
      .select({
        totalSets: sql<number>`COUNT(${workoutSet.id})`,
        avgSets: sql<number>`CAST(COUNT(${workoutSet.id}) AS FLOAT) / COUNT(DISTINCT ${workout.id})`,
      })
      .from(workout)
      .leftJoin(workoutExercise, eq(workout.id, workoutExercise.workoutId))
      .leftJoin(workoutSet, eq(workoutExercise.id, workoutSet.workoutExerciseId))
      .where(and(...conditions));

    console.log("🔍 Set Stats Debug:", setStatsResult);
    console.log("🔍 Conditions:", conditions);

    const totalSets = Math.round(setStatsResult[0]?.totalSets || 0);
    const avgSets = Math.round(setStatsResult[0]?.avgSets || 0);

    console.log("🔍 Final sets - Total:", totalSets, "Avg:", avgSets);

    return { 
      workouts, 
      avgDuration, 
      totalDuration, 
      avgSets, 
      totalSets 
    };
  } catch (error) {
    console.error("Error getting filtered workouts:", error);
    return { 
      workouts: [], 
      avgDuration: 0, 
      totalDuration: 0, 
      avgSets: 0, 
      totalSets: 0 
    };
  }
}
