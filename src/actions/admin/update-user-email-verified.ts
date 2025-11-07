"use server";

import "server-only";
import { db } from "@/db";
import { user } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Update a user's email verification status.
 * Only accessible by admins.
 */
export async function updateUserEmailVerified(
  userId: string,
  emailVerified: boolean,
) {
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

    // Update the user's email verification status
    const result = await db
      .update(user)
      .set({ emailVerified })
      .where(eq(user.id, userId))
      .returning();

    if (!result.length) {
      return { success: false, error: "User not found" };
    }

    // Revalidate to refresh UI
    revalidatePath("/", "layout");

    return {
      success: true,
      message: `Email verification ${emailVerified ? "enabled" : "disabled"}`,
      user: result[0],
    };
  } catch (error) {
    console.error("Error updating email verification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
