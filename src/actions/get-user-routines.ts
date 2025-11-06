import "server-only";
import { db } from "@/db";
import { routine } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserRoutines(userId: string) {
  try {
    const userRoutines = await db
      .select()
      .from(routine)
      .where(eq(routine.userId, userId))
      .orderBy(routine.createdAt);

    return userRoutines.map((r) => ({
      ...r,
      tags: r.tags ? JSON.parse(r.tags) : [],
    }));
  } catch (error) {
    console.error("Error fetching user routines:", error);
    return [];
  }
}
