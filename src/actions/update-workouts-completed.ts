"use server";

import "server-only";
import { db } from "@/db";
import { workout } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function updateWorkoutsToCompleted() {
  try {
    // Update all existing workouts to completed status
    const result = await db
      .update(workout)
      .set({ status: "completed" })
      .execute();

    console.log("Updated workouts to completed status");
    return {
      success: true,
      message: "All workouts updated to completed status",
    };
  } catch (error) {
    console.error("Error updating workouts:", error);
    return { success: false, error: (error as Error).message };
  }
}
