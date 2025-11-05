"use server";

import "server-only";
import { db } from "@/db";
import { user } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const nameSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1).max(255),
});

/**
 * Update a user's name.
 * Only accessible by admins.
 */
export async function updateUserName(userId: string, newName: string) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Validate input
    const validation = nameSchema.safeParse({ userId, name: newName });
    if (!validation.success) {
      return {
        success: false,
        error: "Invalid name (1-255 characters required)",
      };
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

    // Update the user's name
    const result = await db
      .update(user)
      .set({ name: newName })
      .where(eq(user.id, userId))
      .returning();

    if (!result.length) {
      return { success: false, error: "User not found" };
    }

    // Revalidate to refresh UI
    revalidatePath("/", "layout");

    return {
      success: true,
      message: `Name updated to ${newName}`,
      user: result[0],
    };
  } catch (error) {
    console.error("Error updating user name:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
