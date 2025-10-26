import "server-only";
import { db } from "@/db";
import { workout, workoutExercise, workoutSet } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

interface WorkoutSet {
  setNumber: number;
  reps: number | null;
  weight: number | null;
  completed: boolean;
}

interface WorkoutExercise {
  exerciseId: number;
  sets: WorkoutSet[];
  order: number;
}

interface CreateWorkoutData {
  name: string;
  exercises: WorkoutExercise[];
}

export async function createWorkout(data: CreateWorkoutData) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  try {
    // Start a transaction
    const result = await db.transaction(async (tx) => {
      // Create the workout
      const [newWorkout] = await tx
        .insert(workout)
        .values({
          userId: session.user.id,
          name: data.name,
          status: "active",
          date: new Date(),
        })
        .returning();

      // Add exercises and sets
      for (const exercise of data.exercises) {
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
    return { success: true, workoutId: result.id };
  } catch (error) {
    console.error("Error creating workout:", error);
    return { success: false, error: "Failed to create workout" };
  }
}

export async function updateWorkout(
  workoutId: number,
  data: Partial<CreateWorkoutData>,
) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  try {
    // Update workout name if provided
    if (data.name) {
      await db
        .update(workout)
        .set({ name: data.name, updatedAt: new Date() })
        .where(eq(workout.id, workoutId));
    }

    // If exercises are provided, update them
    if (data.exercises) {
      // This is a simplified version - in a real app you might want to handle
      // updating existing exercises rather than deleting and recreating
      await db
        .delete(workoutExercise)
        .where(eq(workoutExercise.workoutId, workoutId));

      for (const exercise of data.exercises) {
        const [workoutExerciseRecord] = await db
          .insert(workoutExercise)
          .values({
            workoutId: workoutId,
            exerciseId: exercise.exerciseId,
            order: exercise.order,
          })
          .returning();

        for (const set of exercise.sets) {
          await db.insert(workoutSet).values({
            workoutExerciseId: workoutExerciseRecord.id,
            setNumber: set.setNumber,
            reps: set.reps,
            weight: set.weight,
            completed: set.completed,
          });
        }
      }
    }

    revalidatePath("/dashboard/workouts");
    return { success: true };
  } catch (error) {
    console.error("Error updating workout:", error);
    return { success: false, error: "Failed to update workout" };
  }
}

export async function completeWorkout(workoutId: number) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  try {
    await db
      .update(workout)
      .set({
        status: "completed",
        updatedAt: new Date(),
        // Calculate duration based on created and updated time
      })
      .where(eq(workout.id, workoutId));

    revalidatePath("/dashboard/workouts");
    return { success: true };
  } catch (error) {
    console.error("Error completing workout:", error);
    return { success: false, error: "Failed to complete workout" };
  }
}

export async function cancelWorkout(workoutId: number) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  try {
    // Delete the workout and all associated data
    await db.delete(workout).where(eq(workout.id, workoutId));

    revalidatePath("/dashboard/workouts");
    return { success: true };
  } catch (error) {
    console.error("Error canceling workout:", error);
    return { success: false, error: "Failed to cancel workout" };
  }
}

export async function getActiveWorkout(userId: string) {
  try {
    const activeWorkouts = await db
      .select()
      .from(workout)
      .where(eq(workout.userId, userId) && eq(workout.status, "active"))
      .limit(1);

    return activeWorkouts[0] || null;
  } catch (error) {
    console.error("Error fetching active workout:", error);
    return null;
  }
}
