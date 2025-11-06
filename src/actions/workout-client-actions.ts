"use server";

import "server-only";
import { getWorkouts } from "@/actions/get-workouts";
import { revalidatePath } from "next/cache";

export async function getWorkoutsAction(
  userId: string,
  options: {
    status?: "active" | "completed" | "archived";
    includeArchived?: boolean;
    limit?: number;
  } = {},
) {
  try {
    const workouts = await getWorkouts(userId, options);
    return { success: true, workouts };
  } catch (error) {
    console.error("Error fetching workouts:", error);
    return { success: false, error: "Failed to fetch workouts", workouts: [] };
  }
}

export async function refreshWorkoutsAction(
  userId: string,
  includeArchived: boolean = false,
) {
  try {
    const workouts = await getWorkouts(userId, { includeArchived, limit: 50 });
    revalidatePath("/dashboard/workouts");
    return { success: true, workouts };
  } catch (error) {
    console.error("Error refreshing workouts:", error);
    return {
      success: false,
      error: "Failed to refresh workouts",
      workouts: [],
    };
  }
}
