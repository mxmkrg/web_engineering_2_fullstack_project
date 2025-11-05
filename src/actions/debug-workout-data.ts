"use server";

import "server-only";
import { db } from "@/db";
import { workout, workoutExercise, workoutSet, exercise } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function debugWorkoutData(userId: string) {
  console.log("🔍 Debugging workout data for user:", userId);

  // Check all workouts for user
  const allWorkouts = await db
    .select({
      id: workout.id,
      name: workout.name,
      status: workout.status,
      date: workout.date,
      userId: workout.userId,
    })
    .from(workout)
    .where(eq(workout.userId, userId));

  console.log("📋 All workouts:", allWorkouts);

  // Check all workout exercises
  const allWorkoutExercises = await db
    .select({
      workoutId: workoutExercise.workoutId,
      exerciseId: workoutExercise.exerciseId,
      exerciseName: exercise.name,
    })
    .from(workoutExercise)
    .innerJoin(exercise, eq(workoutExercise.exerciseId, exercise.id))
    .innerJoin(workout, eq(workoutExercise.workoutId, workout.id))
    .where(eq(workout.userId, userId));

  console.log("🏋️ All workout exercises:", allWorkoutExercises);

  // Check all workout sets
  const allSets = await db
    .select({
      workoutId: workout.id,
      exerciseName: exercise.name,
      setNumber: workoutSet.setNumber,
      reps: workoutSet.reps,
      weight: workoutSet.weight,
      completed: workoutSet.completed,
    })
    .from(workoutSet)
    .innerJoin(
      workoutExercise,
      eq(workoutSet.workoutExerciseId, workoutExercise.id),
    )
    .innerJoin(workout, eq(workoutExercise.workoutId, workout.id))
    .innerJoin(exercise, eq(workoutExercise.exerciseId, exercise.id))
    .where(eq(workout.userId, userId));

  console.log("🔢 All workout sets:", allSets);

  // Check total counts
  const workoutCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(workout)
    .where(eq(workout.userId, userId));

  const exerciseCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(exercise);

  console.log("📊 Counts:", {
    totalWorkouts: workoutCount[0]?.count || 0,
    totalExercises: exerciseCount[0]?.count || 0,
  });

  return {
    workouts: allWorkouts,
    workoutExercises: allWorkoutExercises,
    sets: allSets,
    counts: {
      totalWorkouts: workoutCount[0]?.count || 0,
      totalExercises: exerciseCount[0]?.count || 0,
    },
  };
}
