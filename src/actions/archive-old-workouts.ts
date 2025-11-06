"use server";

import "server-only";
import { db } from "@/db";
import { workout } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq, and, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function archiveOldWorkouts() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Calculate date one year ago
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Archive completed workouts older than one year
    const result = await db
      .update(workout)
      .set({ 
        status: "archived",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(workout.userId, session.user.id),
          eq(workout.status, "completed"),
          lt(workout.date, oneYearAgo)
        )
      );

    // For SQLite, we need to count separately since result doesn't have changes
    const archivedWorkouts = await db
      .select()
      .from(workout)
      .where(
        and(
          eq(workout.userId, session.user.id),
          eq(workout.status, "archived"),
          lt(workout.date, oneYearAgo)
        )
      );

    const archivedCount = archivedWorkouts.length;

    revalidatePath("/dashboard/workouts");
    
    return { 
      success: true, 
      archivedCount,
      message: `Archived ${archivedCount} workouts older than one year`
    };
  } catch (error) {
    console.error("Error archiving old workouts:", error);
    return { 
      success: false, 
      error: "Failed to archive old workouts" 
    };
  }
}

export async function unarchiveWorkout(workoutId: number) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    await db
      .update(workout)
      .set({
        status: "completed",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(workout.id, workoutId),
          eq(workout.userId, session.user.id),
          eq(workout.status, "archived")
        )
      );

    revalidatePath("/dashboard/workouts");
    revalidatePath("/dashboard/workouts/archived");
    
    return { success: true };
  } catch (error) {
    console.error("Error unarchiving workout:", error);
    return { success: false, error: "Failed to unarchive workout" };
  }
}