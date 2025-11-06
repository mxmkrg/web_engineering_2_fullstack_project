"use server";

import "server-only";
import { db } from "@/db";
import { user } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Delete a user from the system.
 * Only accessible by admins.
 * Admins cannot delete themselves.
 */
export async function deleteUser(userId: string) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Check if current user is admin
    const currentUser = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!currentUser.length || currentUser[0].role !== "admin") {
      return { success: false, error: "Unauthorized: Admin access required" };
    }

    // Prevent self-deletion
    if (userId === session.user.id) {
      return { success: false, error: "Cannot delete your own account" };
    }

    // Check if user exists
    const userToDelete = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!userToDelete.length) {
      return { success: false, error: "User not found" };
    }

    // Delete the user (cascade will handle sessions, workouts, etc.)
    await db.delete(user).where(eq(user.id, userId));

    // Revalidate to refresh UI
    revalidatePath("/", "layout");

    return {
      success: true,
      message: `User ${userToDelete[0].email} has been deleted`,
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
