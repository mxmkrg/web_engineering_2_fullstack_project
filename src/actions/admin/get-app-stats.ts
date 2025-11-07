"use server";

import "server-only";
import { db } from "@/db";
import {
  user,
  workout,
  exercise,
  routine,
  session,
  workoutSet,
} from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq, gte, and, count, sql } from "drizzle-orm";

// Store the app start time
const APP_START_TIME = Date.now();

export interface AppStats {
  totalUsers: number;
  totalAdmins: number;
  totalWorkouts: number;
  completedWorkouts: number;
  totalExercises: number;
  totalRoutines: number;
  totalSets: number;
  activeSessions: number;
  workoutsThisMonth: number;
  workoutsThisWeek: number;
  uptimeMinutes: number;
  recentUsersCount: number; // Users created in last 30 days
}

/**
 * Get application statistics.
 * Only accessible by admins.
 */
export async function getAppStats() {
  try {
    const currentSession = await getServerSession();

    if (!currentSession?.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Check if current user is admin
    const currentUser = await db
      .select()
      .from(user)
      .where(eq(user.id, currentSession.user.id))
      .limit(1);

    if (!currentUser.length || currentUser[0].role !== "admin") {
      return { success: false, error: "Unauthorized: Admin access required" };
    }

    // Calculate date ranges
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // Get all statistics in parallel
    const [
      totalUsersResult,
      totalAdminsResult,
      totalWorkoutsResult,
      completedWorkoutsResult,
      totalExercisesResult,
      totalRoutinesResult,
      totalSetsResult,
      activeSessionsResult,
      workoutsThisMonthResult,
      workoutsThisWeekResult,
      recentUsersResult,
    ] = await Promise.all([
      // Total users
      db
        .select({ count: count() })
        .from(user),

      // Total admins
      db
        .select({ count: count() })
        .from(user)
        .where(eq(user.role, "admin")),

      // Total workouts
      db
        .select({ count: count() })
        .from(workout),

      // Completed workouts
      db
        .select({ count: count() })
        .from(workout)
        .where(eq(workout.status, "completed")),

      // Total exercises
      db
        .select({ count: count() })
        .from(exercise),

      // Total routines
      db
        .select({ count: count() })
        .from(routine),

      // Total sets
      db
        .select({ count: count() })
        .from(workoutSet),

      // Active sessions (not expired)
      db
        .select({ count: count() })
        .from(session)
        .where(gte(session.expiresAt, now)),

      // Workouts this month
      db
        .select({ count: count() })
        .from(workout)
        .where(gte(workout.date, startOfMonth)),

      // Workouts this week
      db
        .select({ count: count() })
        .from(workout)
        .where(gte(workout.date, startOfWeek)),

      // Recent users (last 30 days)
      db
        .select({ count: count() })
        .from(user)
        .where(gte(user.createdAt, thirtyDaysAgo)),
    ]);

    // Calculate uptime
    const uptimeMs = Date.now() - APP_START_TIME;
    const uptimeMinutes = Math.floor(uptimeMs / 60000);

    const stats: AppStats = {
      totalUsers: totalUsersResult[0]?.count || 0,
      totalAdmins: totalAdminsResult[0]?.count || 0,
      totalWorkouts: totalWorkoutsResult[0]?.count || 0,
      completedWorkouts: completedWorkoutsResult[0]?.count || 0,
      totalExercises: totalExercisesResult[0]?.count || 0,
      totalRoutines: totalRoutinesResult[0]?.count || 0,
      totalSets: totalSetsResult[0]?.count || 0,
      activeSessions: activeSessionsResult[0]?.count || 0,
      workoutsThisMonth: workoutsThisMonthResult[0]?.count || 0,
      workoutsThisWeek: workoutsThisWeekResult[0]?.count || 0,
      uptimeMinutes,
      recentUsersCount: recentUsersResult[0]?.count || 0,
    };

    return {
      success: true,
      stats,
    };
  } catch (error) {
    console.error("Error fetching app stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
