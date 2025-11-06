"use server";

import "server-only";
import { getServerSession } from "@/lib/auth-server";
import { db } from "@/db";
import { user, session, workout } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function deleteOwnAccount() {
  try {
    const sessionData = await getServerSession();
    if (!sessionData) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = sessionData.user.id;

    // Delete all user's workouts first (cascade)
    await db.delete(workout).where(eq(workout.userId, userId));

    // Delete all user's sessions
    await db.delete(session).where(eq(session.userId, userId));

    // Delete the user account
    await db.delete(user).where(eq(user.id, userId));

    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("Error deleting account:", error);
    return { success: false, error: "Failed to delete account" };
  }
}
