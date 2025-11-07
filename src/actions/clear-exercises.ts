"use server";

import "server-only";
import { db } from "@/db";
import { exercise } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { revalidatePath } from "next/cache";

export async function clearExercises() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Delete all exercises from the exercise library
    await db.delete(exercise);

    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Exercise library cleared successfully!",
    };
  } catch (error) {
    console.error("Error clearing exercises:", error);
    return {
      success: false,
      error: "Failed to clear exercise library",
    };
  }
}
