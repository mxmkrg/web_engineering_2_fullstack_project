"use server";

import "server-only";
import { db } from "@/db";
import { user } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type UserRole = "user" | "admin";

/**
 * Update a user's role.
 * Only accessible by admins.
 * Admins cannot change their own role.
 */
export async function updateUserRole(userId: string, newRole: UserRole) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Validate role
    if (newRole !== "user" && newRole !== "admin") {
      return { success: false, error: "Invalid role" };
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

    // Prevent self-role change
    if (userId === session.user.id) {
      return { success: false, error: "Cannot change your own role" };
    }

    // Update the user's role
    const result = await db
      .update(user)
      .set({ role: newRole })
      .where(eq(user.id, userId))
      .returning();

    if (!result.length) {
      return { success: false, error: "User not found" };
    }

    // Revalidate to refresh UI
    revalidatePath("/", "layout");

    return {
      success: true,
      message: `User role updated to ${newRole}`,
      user: result[0],
    };
  } catch (error) {
    console.error("Error updating user role:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
