"use server";

import "server-only";
import { db } from "@/db";
import { routine, routineExercise } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function clearRoutines() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Delete all routines and their exercises for the current user
    await db.transaction(async (tx) => {
      // First get all user routines
      const userRoutines = await tx
        .select({ id: routine.id })
        .from(routine)
        .where(eq(routine.userId, session.user.id));

      // Delete routine exercises for these routines
      for (const userRoutine of userRoutines) {
        await tx
          .delete(routineExercise)
          .where(eq(routineExercise.routineId, userRoutine.id));
      }

      // Delete the routines themselves
      await tx
        .delete(routine)
        .where(eq(routine.userId, session.user.id));
    });

    revalidatePath("/", "layout");

    return {
      success: true,
      message: "All routines cleared successfully!",
    };
  } catch (error) {
    console.error("Error clearing routines:", error);
    return {
      success: false,
      error: "Failed to clear routines",
    };
  }
}