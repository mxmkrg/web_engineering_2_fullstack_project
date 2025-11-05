"use server";

import "server-only";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "@/lib/auth-server";

/**
 * Makes a user an admin by their email address.
 * This action can only be executed by existing admins.
 */
export async function makeUserAdmin(email: string) {
  try {
    const session = await getServerSession();

    // Check if the current user is an admin
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Get current user's role
    const currentUser = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!currentUser.length || currentUser[0].role !== "admin") {
      return { success: false, error: "Only admins can promote users" };
    }

    // Update the target user's role
    const result = await db
      .update(user)
      .set({ role: "admin" })
      .where(eq(user.email, email))
      .returning();

    if (result.length === 0) {
      return { success: false, error: "User not found" };
    }

    return {
      success: true,
      message: `User ${email} is now an admin`,
      user: result[0],
    };
  } catch (error) {
    console.error("Error making user admin:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * EMERGENCY FUNCTION: Makes the first user in the database an admin.
 * Use this only for initial setup when no admin exists yet.
 * Should be called via a temporary debug route or script.
 */
export async function makeFirstUserAdmin() {
  try {
    const users = await db.select().from(user).limit(1);

    if (users.length === 0) {
      return { success: false, error: "No users found in database" };
    }

    const result = await db
      .update(user)
      .set({ role: "admin" })
      .where(eq(user.id, users[0].id))
      .returning();

    return {
      success: true,
      message: `First user (${users[0].email}) is now an admin`,
      user: result[0],
    };
  } catch (error) {
    console.error("Error making first user admin:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
