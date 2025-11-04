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
    // Fetch workout to get createdAt time
    const [workoutData] = await db
      .select()
      .from(workout)
      .where(eq(workout.id, workoutId))
      .limit(1);

    if (!workoutData) {
      return { success: false, error: "Workout not found" };
    }

    // Calculate duration in minutes
    const now = new Date();
    const createdAt = new Date(workoutData.createdAt);
    const durationMinutes = Math.floor(
      (now.getTime() - createdAt.getTime()) / 60000,
    );

    await db
      .update(workout)
      .set({
        status: "archived",
        duration: durationMinutes,
        updatedAt: now,
      })
      .where(eq(workout.id, workoutId));

    revalidatePath("/dashboard/workouts");
    revalidatePath("/dashboard/workouts/archived");
    return { success: true, duration: durationMinutes };
  } catch (error) {
    console.error("Error completing workout:", error);
    return { success: false, error: "Failed to complete workout" };
  }
}
