"use server";

import "server-only";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Toggle user role between admin and user.
 * This is a development-only function for debugging purposes.
 */
export async function toggleUserRole(
  userId: string,
  newRole: "admin" | "user",
) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== "development") {
    return {
      success: false,
      error: "This function is only available in development mode",
    };
  }

  try {
    // Validate role
    if (newRole !== "user" && newRole !== "admin") {
      return { success: false, error: "Invalid role" };
    }

    // Update the user's role
    await db
      .update(user)
      .set({ role: newRole })
      .where(eq(user.id, userId))
      .execute();

    revalidatePath("/", "layout");

    return {
      success: true,
      message: `User role successfully updated to ${newRole}`,
    };
  } catch (error) {
    console.error("Error updating user role:", error);
    return {
      success: false,
      error: "Failed to update user role",
    };
  }
}
