import "server-only";
import { db } from "@/db";
import { workout } from "@/db/schema";
import { eq, desc, and, inArray } from "drizzle-orm";

export interface GetWorkoutsOptions {
  status?: "planned" | "active" | "completed" | "archived";
  includeArchived?: boolean;
  limit?: number;
}

export async function getWorkouts(
  userId: string,
  options: GetWorkoutsOptions = {},
) {
  const { status, includeArchived = false, limit } = options;

  if (status) {
    const result = db
      .select()
      .from(workout)
      .where(and(eq(workout.userId, userId), eq(workout.status, status)))
      .orderBy(desc(workout.date));

    return limit ? await result.limit(limit) : await result;
  }

  // Default behavior: get planned, active and completed workouts, optionally include archived
  const allowedStatuses = includeArchived
    ? ["planned", "active", "completed", "archived"]
    : ["planned", "active", "completed"];

  const result = db
    .select()
    .from(workout)
    .where(
      and(eq(workout.userId, userId), inArray(workout.status, allowedStatuses)),
    )
    .orderBy(desc(workout.date));

  return limit ? await result.limit(limit) : await result;
}
