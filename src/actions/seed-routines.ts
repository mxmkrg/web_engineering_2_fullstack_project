"use server";

import "server-only";
import { db } from "@/db";
import { routine } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function seedRoutines() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  try {
    const routinesToCreate = [
      {
        userId: session.user.id,
        name: "Push Day",
        description: "Chest, shoulders, and triceps workout",
        category: "strength",
        difficulty: "intermediate",
        duration: 60,
        isPublic: false,
        isTemplate: false,
        tags: JSON.stringify(["push", "strength", "upper"]),
      },
      {
        userId: session.user.id,
        name: "Pull Day",
        description: "Back and biceps workout", 
        category: "strength",
        difficulty: "intermediate",
        duration: 60,
        isPublic: false,
        isTemplate: false,
        tags: JSON.stringify(["pull", "strength", "upper"]),
      },
      {
        userId: session.user.id,
        name: "Leg Day",
        description: "Legs and glutes workout",
        category: "strength", 
        difficulty: "intermediate",
        duration: 60,
        isPublic: false,
        isTemplate: false,
        tags: JSON.stringify(["legs", "strength", "lower"]),
      },
      {
        userId: session.user.id,
        name: "Full Body Beginner",
        description: "A beginner-friendly full body workout",
        category: "strength",
        difficulty: "beginner",
        duration: 45,
        isPublic: false,
        isTemplate: false,
        tags: JSON.stringify(["full-body", "beginner"]),
      },
    ];

    // Insert all routines
    await db.insert(routine).values(routinesToCreate);

    revalidatePath("/", "layout");
  } catch (error) {
    console.error("Failed to seed routines:", error);
    throw new Error("Failed to seed routines");
  }
}
