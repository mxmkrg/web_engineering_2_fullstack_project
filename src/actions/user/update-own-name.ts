"use server";

import "server-only";
import { getServerSession } from "@/lib/auth-server";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateNameSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
});

export async function updateOwnName(formData: FormData) {
  try {
    const session = await getServerSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const rawData = {
      name: formData.get("name"),
    };

    const validatedData = updateNameSchema.parse(rawData);

    await db
      .update(user)
      .set({
        name: validatedData.name,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id));

    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Failed to update name" };
  }
}
