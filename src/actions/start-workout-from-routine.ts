"use server";

import "server-only";
import { db } from "@/db";
import {
  workout,
  workoutExercise,
  workoutSet,
  exercise,
  routine,
} from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getTemplate } from "@/lib/workout-templates";

const startWorkoutFromRoutineSchema = z.object({
  routineId: z.string().transform((val) => parseInt(val, 10)),
});

export async function startWorkoutFromRoutine(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const validatedFields = startWorkoutFromRoutineSchema.safeParse({
    routineId: formData.get("routineId"),
  });

  if (!validatedFields.success) {
    throw new Error("Invalid form data");
  }

  const { routineId } = validatedFields.data;

  try {
    // Get the routine with template info
    const [routineData] = await db
      .select()
      .from(routine)
      .where(eq(routine.id, routineId))
      .limit(1);

    if (!routineData || routineData.userId !== session.user.id) {
      throw new Error("Routine not found or access denied");
    }

    // Get the workout template
    const template = getTemplate(routineData.templateKey);
    if (!template) {
      throw new Error("Workout template not found");
    }

    // Create the workout with "active" status
    const [newWorkout] = await db
      .insert(workout)
      .values({
        userId: session.user.id,
        name: template.name,
        status: "active",
        date: new Date(), // Current time for active workouts
        notes: `Started workout from routine: ${routineData.name}`,
      })
      .returning();

    // Process exercises for the workout
    for (let i = 0; i < template.exercises.length; i++) {
      const templateExercise = template.exercises[i];

      // Find or create the exercise in the database
      let [exerciseRecord] = await db
        .select()
        .from(exercise)
        .where(eq(exercise.name, templateExercise.name))
        .limit(1);

      if (!exerciseRecord) {
        [exerciseRecord] = await db
          .insert(exercise)
          .values({
            name: templateExercise.name,
            category: "unknown",
            muscleGroups: JSON.stringify([]),
            equipment: "unknown",
          })
          .returning();
      }

      // Create workout exercise
      const [newWorkoutExercise] = await db
        .insert(workoutExercise)
        .values({
          workoutId: newWorkout.id,
          exerciseId: exerciseRecord.id,
          order: i,
          notes: "",
        })
        .returning();

      // Create sets for this exercise
      for (let setIndex = 0; setIndex < templateExercise.sets; setIndex++) {
        await db.insert(workoutSet).values({
          workoutExerciseId: newWorkoutExercise.id,
          setNumber: setIndex + 1,
          reps: templateExercise.baseReps,
          weight:
            templateExercise.baseWeight > 0 ? templateExercise.baseWeight : null,
          completed: false, // Sets start as uncompleted
        });
      }
    }

    revalidatePath("/", "layout");

    // Redirect to the workout tracking page
    redirect(`/dashboard/workouts/${newWorkout.id}/track`);
  } catch (error) {
    console.error("Failed to start workout from routine:", error);
    throw new Error("Failed to start workout from routine");
  }
}