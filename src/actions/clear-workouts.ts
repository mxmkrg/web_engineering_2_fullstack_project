"use server";

import "server-only";
import { db } from "@/db";
import { workout, workoutExercise, workoutSet } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";

export async function clearWorkouts() {
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

    // Get all workouts for this user
    const userWorkouts = await db
      .select({ id: workout.id })
      .from(workout)
      .where(eq(workout.userId, userId));

    if (userWorkouts.length === 0) {
      return {
        success: true,
        message: "No workouts found to delete",
      };
    }

    // Delete in proper order to respect foreign key constraints
    // 1. Delete workout sets first
    for (const userWorkout of userWorkouts) {
      // Get all workout exercises for this workout
      const exercises = await db
        .select({ id: workoutExercise.id })
        .from(workoutExercise)
        .where(eq(workoutExercise.workoutId, userWorkout.id));

      // Delete all sets for each exercise
      for (const exercise of exercises) {
        await db
          .delete(workoutSet)
          .where(eq(workoutSet.workoutExerciseId, exercise.id));
      }

      // 2. Delete workout exercises
      await db
        .delete(workoutExercise)
        .where(eq(workoutExercise.workoutId, userWorkout.id));
    }

    // 3. Finally delete workouts
    const deletedWorkouts = await db
      .delete(workout)
      .where(eq(workout.userId, userId))
      .returning();

    return {
      success: true,
      message: `Successfully deleted ${deletedWorkouts.length} workouts and all associated data`,
    };
  } catch (error) {
    console.error("Error clearing workouts:", error);
    return {
      success: false,
      error: "Failed to clear workouts",
    };
  }
}
