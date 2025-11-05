"use server";

import "server-only";
import { db } from "@/db";
import { workout, workoutExercise, workoutSet } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function deleteWorkout(workoutId: number) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Get the workout to verify ownership
    const [workoutData] = await db
      .select()
      .from(workout)
      .where(eq(workout.id, workoutId));

    if (!workoutData) {
      return {
        success: false,
        error: "Workout not found",
      };
    }

    // Check if the workout belongs to the authenticated user
    if (workoutData.userId !== session.user.id) {
      return {
        success: false,
        error: "Not authorized to delete this workout",
      };
    }

    // Delete in proper order to respect foreign key constraints
    // 1. Get all workout exercises for this workout
    const exercises = await db
      .select({ id: workoutExercise.id })
      .from(workoutExercise)
      .where(eq(workoutExercise.workoutId, workoutId));

    // 2. Delete all sets for each exercise
    for (const exercise of exercises) {
      await db
        .delete(workoutSet)
        .where(eq(workoutSet.workoutExerciseId, exercise.id));
    }

    // 3. Delete workout exercises
    await db
      .delete(workoutExercise)
      .where(eq(workoutExercise.workoutId, workoutId));

    // 4. Finally delete the workout
    await db.delete(workout).where(eq(workout.id, workoutId));

    // Revalidate to refresh the UI
    revalidatePath("/dashboard/workouts");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Workout deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting workout:", error);
    return {
      success: false,
      error: "Failed to delete workout",
    };
  }
}
