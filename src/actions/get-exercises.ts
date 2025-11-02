import "server-only";
import { db } from "@/db";
import { exercise } from "@/db/schema";
import { like, or, eq, and } from "drizzle-orm";

export async function getExercises() {
  try {
    const exercises = await db.select().from(exercise);
    return exercises;
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return [];
  }
}

export async function searchExercises(searchTerm?: string, category?: string) {
  try {
    const conditions = [];

    if (searchTerm) {
      conditions.push(
        or(
          like(exercise.name, `%${searchTerm}%`),
          like(exercise.category, `%${searchTerm}%`),
          like(exercise.muscleGroups, `%${searchTerm}%`),
        ),
      );
    }

    if (category && category !== "all") {
      conditions.push(eq(exercise.category, category));
    }

    const query =
      conditions.length > 0
        ? db
            .select()
            .from(exercise)
            .where(and(...conditions))
        : db.select().from(exercise);

    const results = await query;
    return results;
  } catch (error) {
    console.error("Error searching exercises:", error);
    return [];
  }
}

export async function getExercisesByCategory() {
  try {
    const exercises = await db.select().from(exercise);

    // Gruppiere nach Kategorie
    const grouped: Record<string, Array<{ id: number; name: string }>> = {};

    for (const ex of exercises) {
      if (!grouped[ex.category]) {
        grouped[ex.category] = [];
      }
      grouped[ex.category].push({ id: ex.id, name: ex.name });
    }

    return grouped;
  } catch (error) {
    console.error("Error fetching exercises by category:", error);
    return {};
  }
}
