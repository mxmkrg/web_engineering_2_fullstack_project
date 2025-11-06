import "server-only";
import { db } from "@/db";
import { workout } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function debugWorkouts(userId: string) {
  try {
    // Get all workouts for the user
    const allWorkouts = await db
      .select({
        id: workout.id,
        name: workout.name,
        status: workout.status,
        date: workout.date,
      })
      .from(workout)
      .where(eq(workout.userId, userId))
      .orderBy(workout.date);

    const statusCounts = {
      planned: allWorkouts.filter(w => w.status === "planned").length,
      active: allWorkouts.filter(w => w.status === "active").length,
      completed: allWorkouts.filter(w => w.status === "completed").length,
      archived: allWorkouts.filter(w => w.status === "archived").length,
    };

    const today = new Date();
    const futureWorkouts = allWorkouts.filter(w => {
      const workoutDate = new Date(w.date);
      return workoutDate > today;
    });

    return {
      success: true,
      data: {
        total: allWorkouts.length,
        statusCounts,
        futureWorkouts: futureWorkouts.length,
        futureWorkoutsSample: futureWorkouts.slice(0, 5).map(w => ({
          name: w.name,
          status: w.status,
          date: new Date(w.date).toDateString()
        })),
        allWorkoutsSample: allWorkouts.slice(0, 10).map(w => ({
          name: w.name,
          status: w.status,
          date: new Date(w.date).toDateString()
        }))
      }
    };
  } catch (error) {
    console.error("Error debugging workouts:", error);
    return {
      success: false,
      error: "Failed to debug workouts"
    };
  }
}