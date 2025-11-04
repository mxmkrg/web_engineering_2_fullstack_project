"use server";

import "server-only";
import { db } from "@/db";
import { workout } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export type WorkoutFilterType = "total" | "thisWeek" | "thisMonth";

interface GetFilteredWorkoutsOptions {
  status?: string;
  limit?: number;
  filter?: WorkoutFilterType;
}

export async function getFilteredWorkouts(
  userId: string,
  options: GetFilteredWorkoutsOptions = {}
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id || session.user.id !== userId) {
      return [];
    }

    const { status = "archived", limit = 50, filter = "total" } = options;

    // Calculate date ranges
    const now = new Date();
    let startDate: Date | null = null;

    switch (filter) {
      case "thisWeek":
        // Get start of current week (Monday)
        const currentDay = now.getDay();
        const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // Sunday = 0, so 6 days from Monday
        startDate = new Date(now);
        startDate.setDate(now.getDate() - daysFromMonday);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "thisMonth":
        // Get start of current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "total":
      default:
        startDate = null; // No date filter
        break;
    }

    // Build query conditions
    const conditions = [eq(workout.userId, userId), eq(workout.status, status)];

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

    return workouts;
  } catch (error) {
    console.error("Error getting filtered workouts:", error);
    return [];
  }
}