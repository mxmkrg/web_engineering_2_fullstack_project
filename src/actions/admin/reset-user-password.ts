"use server";

import "server-only";
import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/auth-server";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Reset a user's password.
 * Only accessible by admins.
 */
export async function resetUserPassword(formData: FormData) {
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

    const userId = formData.get("userId") as string;
    const newPassword = formData.get("newPassword") as string;

    if (!userId || !newPassword) {
      return { success: false, error: "Missing required fields" };
    }

    // Validate password length
    if (newPassword.length < 8) {
      return {
        success: false,
        error: "Password must be at least 8 characters long",
      };
    }

    // Check if the target user exists
    const targetUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!targetUser.length) {
      return { success: false, error: "User not found" };
    }

    // Use the better-auth admin API to set the password
    // This is done through an internal API call
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/auth/admin/set-user-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Include the admin session
          Cookie: `better-auth.session_token=${session.session.token}`,
        },
        body: JSON.stringify({
          userId,
          newPassword,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || "Failed to reset password",
      };
    }

    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Password reset successfully",
    };
  } catch (error) {
    console.error("Error resetting user password:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
