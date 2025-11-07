"use server";

import "server-only";
import { db } from "@/db";
import {
  workout,
  workoutExercise,
  workoutSet,
  exercise,
  routine,
  routineExercise,
} from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const planWorkoutFromRoutineSchema = z.object({
  routineId: z.string().transform((val) => parseInt(val, 10)),
  workoutDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});

export async function planWorkoutFromRoutine(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const validatedFields = planWorkoutFromRoutineSchema.safeParse({
    routineId: formData.get("routineId"),
    workoutDate: formData.get("workoutDate"),
  });

  if (!validatedFields.success) {
    throw new Error("Invalid form data");
  }

  const { routineId, workoutDate } = validatedFields.data;
  const selectedDate = new Date(workoutDate);

  try {
    // Get the routine data
    const [routineData] = await db
      .select()
      .from(routine)
      .where(eq(routine.id, routineId))
      .limit(1);

    if (!routineData || routineData.userId !== session.user.id) {
      throw new Error("Routine not found or access denied");
    }

    // Get the routine exercises with their associated exercise details
    const routineExercises = await db
      .select({
        routineExercise: routineExercise,
        exercise: exercise,
      })
      .from(routineExercise)
      .innerJoin(exercise, eq(routineExercise.exerciseId, exercise.id))
      .where(eq(routineExercise.routineId, routineId));

    if (routineExercises.length === 0) {
      throw new Error("No exercises found in this routine");
    }

    // Create the workout with "planned" status
    const [newWorkout] = await db
      .insert(workout)
      .values({
        userId: session.user.id,
        name: `${routineData.name} (Planned)`,
        status: "planned",
        date: selectedDate,
        notes: `Planned workout from routine: ${routineData.name}`,
      })
      .returning();

    // Process exercises for the workout
    for (const routineExerciseData of routineExercises) {
      const { routineExercise: rExercise, exercise: exerciseData } =
        routineExerciseData;

      // Create workout exercise
      const [newWorkoutExercise] = await db
        .insert(workoutExercise)
        .values({
          workoutId: newWorkout.id,
          exerciseId: exerciseData.id,
          order: rExercise.order,
          notes: rExercise.notes || "",
        })
        .returning();

      // Create sets for this exercise based on the routine's target sets
      const targetSets = rExercise.targetSets || 3; // Default to 3 sets if not specified
      for (let setIndex = 0; setIndex < targetSets; setIndex++) {
        await db.insert(workoutSet).values({
          workoutExerciseId: newWorkoutExercise.id,
          setNumber: setIndex + 1,
          reps: rExercise.targetReps ? parseInt(rExercise.targetReps) : 10, // Parse target reps or default to 10
          weight: rExercise.targetWeight || null,
          completed: false, // Planned workouts start with uncompleted sets
        });
      }
    }

    revalidatePath("/", "layout");
  } catch (error) {
    console.error("Failed to plan workout from routine:", error);
    throw new Error("Failed to plan workout from routine");
  }
}
