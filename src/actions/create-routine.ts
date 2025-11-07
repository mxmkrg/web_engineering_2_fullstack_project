"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { routine } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { z } from "zod";

const createRoutineSchema = z.object({
  name: z.string().min(1, "Routine name is required"),
  description: z.string().optional(),
  category: z.enum(["strength", "hypertrophy", "endurance", "mixed", "custom"]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  duration: z.coerce.number().min(15).max(180).optional(),
  tags: z.string().optional(),
});

export async function createRoutine(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  try {
    const validatedData = createRoutineSchema.parse({
      name: formData.get("name"),
      description: formData.get("description"),
      category: formData.get("category"),
      difficulty: formData.get("difficulty"),
      duration: formData.get("duration"),
      tags: formData.get("tags"),
    });

    await db.insert(routine).values({
      name: validatedData.name,
      description: validatedData.description || null,
      category: validatedData.category,
      difficulty: validatedData.difficulty,
      duration: validatedData.duration || null,
      tags: validatedData.tags || null,
      userId: session.user.id,
      isPublic: false,
      isTemplate: false,
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error creating routine:", error);
    throw new Error(
      error instanceof z.ZodError
        ? error.issues[0].message
        : "Failed to create routine"
    );
  }
}
