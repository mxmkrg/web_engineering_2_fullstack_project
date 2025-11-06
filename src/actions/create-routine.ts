"use server";

import "server-only";
import { db } from "@/db";
import { routine } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getTemplate } from "@/lib/workout-templates";

const createRoutineSchema = z.object({
  name: z.string().min(1, "Routine name is required"),
  description: z.string().optional(),
  templateKey: z.string().min(1, "Template key is required"),
  difficulty: z
    .enum(["beginner", "intermediate", "advanced"])
    .default("intermediate"),
});

export async function createRoutine(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const validatedFields = createRoutineSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    templateKey: formData.get("templateKey"),
    difficulty: formData.get("difficulty"),
  });

  if (!validatedFields.success) {
    throw new Error("Invalid form data");
  }

  const { name, description, templateKey, difficulty } = validatedFields.data;

  try {
    // Validate that the template exists
    const template = getTemplate(templateKey);
    if (!template) {
      throw new Error("Invalid workout template");
    }

    // Create the routine
    await db.insert(routine).values({
      userId: session.user.id,
      name,
      description: description || null,
      templateKey,
      difficulty,
      estimatedDuration: template.baseDuration,
      isActive: true,
    });

    revalidatePath("/", "layout");
  } catch (error) {
    console.error("Failed to create routine:", error);
    throw new Error("Failed to create routine");
  }
}
