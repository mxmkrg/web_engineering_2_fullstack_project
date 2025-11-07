"use server";

import "server-only";
import { db } from "@/db";
import { user, account } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomBytes, scryptSync } from "crypto";

/**
 * Create a new user.
 * Only accessible by admins.
 */
export async function createNewUser(formData: FormData) {
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

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = (formData.get("role") as string) || "user";
    const emailVerified = formData.get("emailVerified") === "true";

    // Validation
    if (!name || !email || !password) {
      return { success: false, error: "Missing required fields" };
    }

    if (password.length < 8) {
      return {
        success: false,
        error: "Password must be at least 8 characters long",
      };
    }

    if (!email.includes("@")) {
      return { success: false, error: "Invalid email address" };
    }

    if (role !== "user" && role !== "admin") {
      return { success: false, error: "Invalid role" };
    }

    // Check if user with this email already exists
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return { success: false, error: "User with this email already exists" };
    }

    // Create new user
    const userId = `user_${randomBytes(16).toString("hex")}`;

    // Hash password using scrypt (same as better-auth default)
    const salt = randomBytes(16).toString("hex");
    const derivedKey = scryptSync(password, salt, 64).toString("hex");
    const hashedPassword = `${salt}:${derivedKey}`;

    // Insert user
    await db.insert(user).values({
      id: userId,
      name,
      email: email.toLowerCase(),
      emailVerified,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Insert account with password
    await db.insert(account).values({
      id: `account_${randomBytes(16).toString("hex")}`,
      accountId: userId,
      providerId: "credential",
      userId,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/", "layout");

    return {
      success: true,
      message: "User created successfully",
      userId,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
