import "server-only";
import { db } from "@/db";
import { workout } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export interface GetWorkoutsOptions {
  status?: "active" | "completed" | "archived";
  limit?: number;
}

export async function getWorkouts(
  userId: string,
  options: GetWorkoutsOptions = {},
) {
  const { status, limit } = options;

  if (status) {
    const result = db
      .select()
      .from(workout)
      .where(and(eq(workout.userId, userId), eq(workout.status, status)))
      .orderBy(desc(workout.date));

    return limit ? await result.limit(limit) : await result;
  }

  const result = db
    .select()
    .from(workout)
    .where(eq(workout.userId, userId))
    .orderBy(desc(workout.date));

  return limit ? await result.limit(limit) : await result;
}
