"use server";

import "server-only";
import { db } from "@/db";
import { workout } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function startWorkout(workoutId: number) {
  try {
    // Get authenticated user
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const userId = session.user.id;

    // Get the workout to verify it exists and belongs to the user
    const [existingWorkout] = await db
      .select()
      .from(workout)
      .where(and(eq(workout.id, workoutId), eq(workout.userId, userId)))
      .limit(1);

    if (!existingWorkout) {
      return {
        success: false,
        error: "Workout not found",
      };
    }

    if (existingWorkout.status !== "planned") {
      return {
        success: false,
        error: "Only planned workouts can be started",
      };
    }

    // Update the workout status to "active" and set current timestamp
    await db
      .update(workout)
      .set({ 
        status: "active",
        date: new Date(), // Update to current time when starting
        duration: null // Reset duration since it will be tracked
      })
      .where(and(eq(workout.id, workoutId), eq(workout.userId, userId)));

    // Trigger data refetching
    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Workout started successfully!",
    };
  } catch (error) {
    console.error("Error starting workout:", error);
    return {
      success: false,
      error: "Failed to start workout",
    };
  }
}