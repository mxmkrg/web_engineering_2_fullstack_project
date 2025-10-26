"use server";

import "server-only";
import { db } from "@/db";
import { workout, workoutExercise, workoutSet } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createWorkoutAction(prevState: any, formData: FormData) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login" as any);
  }

  try {
    // Parse the JSON data from the form
    const workoutDataString = formData.get("workoutData") as string;
    const workoutData = JSON.parse(workoutDataString);

    // Start a transaction
    const result = await db.transaction(async (tx) => {
      // Create the workout
      const [newWorkout] = await tx
        .insert(workout)
        .values({
          userId: session.user.id,
          name: workoutData.name,
          status: "active",
          date: new Date(),
        })
        .returning();

      // Add exercises and sets
      for (const exercise of workoutData.exercises) {
        const [workoutExerciseRecord] = await tx
          .insert(workoutExercise)
          .values({
            workoutId: newWorkout.id,
            exerciseId: exercise.exerciseId,
            order: exercise.order,
          })
          .returning();

        // Add sets for this exercise
        for (const set of exercise.sets) {
          await tx.insert(workoutSet).values({
            workoutExerciseId: workoutExerciseRecord.id,
            setNumber: set.setNumber,
            reps: set.reps,
            weight: set.weight,
            completed: set.completed,
          });
        }
      }

      return newWorkout;
    });

    revalidatePath("/dashboard/workouts");

    // Redirect to workouts page on success
    redirect("/dashboard/workouts" as any);
  } catch (error) {
    console.error("Error creating workout:", error);
    return { error: "Failed to create workout" };
  }
}
