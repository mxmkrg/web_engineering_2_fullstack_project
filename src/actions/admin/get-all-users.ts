"use server";

import "server-only";
import { db } from "@/db";
import { user } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { desc } from "drizzle-orm";

/**
 * Get all users in the system.
 * Only accessible by admins.
 */
export async function getAllUsers() {
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

    // Get all users
    const users = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .orderBy(desc(user.createdAt));

    return {
      success: true,
      users,
    };
  } catch (error) {
    console.error("Error getting all users:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
