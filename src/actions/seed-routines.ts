"use server";

import "server-only";
import { db } from "@/db";
import { routine } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAllTemplates } from "@/lib/workout-templates";

export async function seedRoutines() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  try {
    const templates = getAllTemplates();
    const routinesToCreate = [];

    // Create routines based on workout templates
    for (const [templateKey, template] of Object.entries(templates)) {
      routinesToCreate.push({
        userId: session.user.id,
        name: template.name,
        description:
          template.description ||
          `A ${template.difficulty || "intermediate"} workout focusing on ${template.phase} training.`,
        templateKey,
        difficulty: template.difficulty || "intermediate",
        estimatedDuration: template.baseDuration,
        isActive: true,
      });
    }

    // Insert all routines
    await db.insert(routine).values(routinesToCreate);

    revalidatePath("/", "layout");
  } catch (error) {
    console.error("Failed to seed routines:", error);
    throw new Error("Failed to seed routines");
  }
}
