"use server";

import "server-only";
import { db } from "@/db";
import { workout, workoutExercise, workoutSet } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const planWorkoutSchema = z.object({
  name: z.string().min(1, "Workout name is required"),
  date: z.string().transform((str) => new Date(str)),
  notes: z.string().optional(),
  exercises: z.array(z.object({
    exerciseId: z.number(),
    order: z.number(),
    notes: z.string().optional(),
    sets: z.array(z.object({
      reps: z.number().min(1),
      weight: z.number().nullable().optional(),
      notes: z.string().optional()
    }))
  }))
});

export async function planWorkout(formData: FormData) {
  try {
    // Get authenticated user
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const userId = session.user.id;

    // Parse and validate the form data
    const rawData = {
      name: formData.get("name")?.toString() || "",
      date: formData.get("date")?.toString() || "",
      notes: formData.get("notes")?.toString() || "",
      exercises: JSON.parse(formData.get("exercises")?.toString() || "[]")
    };

    const validatedData = planWorkoutSchema.parse(rawData);

    // Create the workout with "planned" status
    const [newWorkout] = await db
      .insert(workout)
      .values({
        userId: userId,
        name: validatedData.name,
        status: "planned",
        date: validatedData.date,
        duration: null, // No duration for planned workouts until started
        notes: validatedData.notes || null,
      })
      .returning();

    // Add exercises and sets if provided
    for (const exerciseData of validatedData.exercises) {
      const [newWorkoutExercise] = await db
        .insert(workoutExercise)
        .values({
          workoutId: newWorkout.id,
          exerciseId: exerciseData.exerciseId,
          order: exerciseData.order,
          notes: exerciseData.notes || null,
        })
        .returning();

      // Add sets for the exercise
      for (let setIndex = 0; setIndex < exerciseData.sets.length; setIndex++) {
        const setData = exerciseData.sets[setIndex];
        
        await db.insert(workoutSet).values({
          workoutExerciseId: newWorkoutExercise.id,
          setNumber: setIndex + 1,
          reps: setData.reps,
          weight: setData.weight || null,
          completed: false, // Planned sets are not completed yet
          notes: setData.notes || null,
        });
      }
    }

    // Trigger data refetching
    revalidatePath("/", "layout");

    return {
      success: true,
      workoutId: newWorkout.id,
      message: "Workout planned successfully!",
    };
  } catch (error) {
    console.error("Error planning workout:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid workout data: " + error.issues.map((e) => e.message).join(", "),
      };
    }
    
    return {
      success: false,
      error: "Failed to plan workout",
    };
  }
}