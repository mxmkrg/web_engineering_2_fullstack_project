"use server";

import "server-only";
import { db } from "@/db";
import { user } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const emailSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
});

/**
 * Update a user's email address.
 * Only accessible by admins.
 */
export async function updateUserEmail(userId: string, newEmail: string) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Validate input
    const validation = emailSchema.safeParse({ userId, email: newEmail });
    if (!validation.success) {
      return { success: false, error: "Invalid email format" };
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

    // Check if email is already taken
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, newEmail))
      .limit(1);

    if (existingUser.length && existingUser[0].id !== userId) {
      return { success: false, error: "Email already in use" };
    }

    // Update the user's email
    const result = await db
      .update(user)
      .set({
        email: newEmail,
        emailVerified: false, // Reset email verification
      })
      .where(eq(user.id, userId))
      .returning();

    if (!result.length) {
      return { success: false, error: "User not found" };
    }

    // Revalidate to refresh UI
    revalidatePath("/", "layout");

    return {
      success: true,
      message: `Email updated to ${newEmail}`,
      user: result[0],
    };
  } catch (error) {
    console.error("Error updating user email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
