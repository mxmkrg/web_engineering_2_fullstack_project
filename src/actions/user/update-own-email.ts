"use server";

import "server-only";
import { getServerSession } from "@/lib/auth-server";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function updateOwnEmail(formData: FormData) {
  try {
    const session = await getServerSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const rawData = {
      email: formData.get("email"),
    };

    const validatedData = updateEmailSchema.parse(rawData);

    // Check if email is already taken by another user
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, validatedData.email))
      .limit(1);

    if (existingUser.length > 0 && existingUser[0].id !== session.user.id) {
      return { success: false, error: "Email is already in use" };
    }

    await db
      .update(user)
      .set({
        email: validatedData.email,
        emailVerified: false, // Reset email verification
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id));

    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Failed to update email" };
  }
}
