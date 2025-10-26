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
