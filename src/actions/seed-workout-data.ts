"use server";

import "server-only";
import { db } from "@/db";
import {
  workout,
  workoutExercise,
  workoutSet,
  exercise,
  user,
} from "@/db/schema";
import { seedExercises } from "./seed-exercises";

const sampleWorkouts = [
  {
    name: "Upper Body Strength",
    duration: 45,
    notes: "Focus on progressive overload",
    exercises: [
      {
        exerciseName: "Bench Press",
        sets: [
          { setNumber: 1, reps: 8, weight: 135 },
          { setNumber: 2, reps: 8, weight: 145 },
          { setNumber: 3, reps: 6, weight: 155 },
        ],
      },
      {
        exerciseName: "Pull-ups",
        sets: [
          { setNumber: 1, reps: 10, weight: 0 },
          { setNumber: 2, reps: 8, weight: 0 },
          { setNumber: 3, reps: 6, weight: 0 },
        ],
      },
      {
        exerciseName: "Overhead Press",
        sets: [
          { setNumber: 1, reps: 8, weight: 95 },
          { setNumber: 2, reps: 8, weight: 100 },
          { setNumber: 3, reps: 6, weight: 105 },
        ],
      },
    ],
  },
  {
    name: "Lower Body Power",
    duration: 50,
    notes: "Explosive movements",
    exercises: [
      {
        exerciseName: "Squats",
        sets: [
          { setNumber: 1, reps: 10, weight: 185 },
          { setNumber: 2, reps: 8, weight: 205 },
          { setNumber: 3, reps: 6, weight: 225 },
        ],
      },
      {
        exerciseName: "Deadlifts",
        sets: [
          { setNumber: 1, reps: 5, weight: 225 },
          { setNumber: 2, reps: 5, weight: 245 },
          { setNumber: 3, reps: 3, weight: 265 },
        ],
      },
      {
        exerciseName: "Lunges",
        sets: [
          { setNumber: 1, reps: 12, weight: 25 },
          { setNumber: 2, reps: 12, weight: 30 },
          { setNumber: 3, reps: 10, weight: 35 },
        ],
      },
    ],
  },
  {
    name: "Push Day",
    duration: 40,
    notes: "Chest, shoulders, triceps",
    exercises: [
      {
        exerciseName: "Push-ups",
        sets: [
          { setNumber: 1, reps: 15, weight: 0 },
          { setNumber: 2, reps: 12, weight: 0 },
          { setNumber: 3, reps: 10, weight: 0 },
        ],
      },
      {
        exerciseName: "Lateral Raises",
        sets: [
          { setNumber: 1, reps: 12, weight: 15 },
          { setNumber: 2, reps: 12, weight: 15 },
          { setNumber: 3, reps: 10, weight: 20 },
        ],
      },
      {
        exerciseName: "Tricep Dips",
        sets: [
          { setNumber: 1, reps: 12, weight: 0 },
          { setNumber: 2, reps: 10, weight: 0 },
          { setNumber: 3, reps: 8, weight: 0 },
        ],
      },
    ],
  },
  {
    name: "Full Body Circuit",
    duration: 35,
    notes: "High intensity circuit training",
    exercises: [
      {
        exerciseName: "Squats",
        sets: [
          { setNumber: 1, reps: 20, weight: 0 },
          { setNumber: 2, reps: 18, weight: 0 },
          { setNumber: 3, reps: 15, weight: 0 },
        ],
      },
      {
        exerciseName: "Push-ups",
        sets: [
          { setNumber: 1, reps: 12, weight: 0 },
          { setNumber: 2, reps: 10, weight: 0 },
          { setNumber: 3, reps: 8, weight: 0 },
        ],
      },
      {
        exerciseName: "Jumping Jacks",
        sets: [
          { setNumber: 1, reps: 30, weight: 0 },
          { setNumber: 2, reps: 25, weight: 0 },
          { setNumber: 3, reps: 20, weight: 0 },
        ],
      },
    ],
  },
];

export async function seedWorkoutData() {
  try {
    // First ensure exercises are seeded
    await seedExercises();

    // Check if workouts already exist
    const existingWorkouts = await db.select().from(workout).limit(1);
    if (existingWorkouts.length > 0) {
      return { success: true, message: "Workouts already seeded" };
    }

    // Get the first user to associate workouts with
    const users = await db.select().from(user).limit(1);
    if (users.length === 0) {
      return { success: false, error: "No users found. Create a user first." };
    }

    const userId = users[0].id;

    // Get all exercises for mapping
    const exercises = await db.select().from(exercise);
    const exerciseMap = new Map(exercises.map((ex) => [ex.name, ex.id]));

    // Create workouts with dates spread over the last few weeks
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 21); // Start 3 weeks ago

    for (let i = 0; i < sampleWorkouts.length; i++) {
      const workoutData = sampleWorkouts[i];

      // Create workout with date spread over time
      const workoutDate = new Date(baseDate);
      workoutDate.setDate(workoutDate.getDate() + i * 5); // 5 days apart

      const [newWorkout] = await db
        .insert(workout)
        .values({
          userId,
          name: workoutData.name,
          status: "completed",
          date: workoutDate,
          duration: workoutData.duration,
          notes: workoutData.notes,
        })
        .returning();

      // Add exercises to the workout
      for (let j = 0; j < workoutData.exercises.length; j++) {
        const exerciseData = workoutData.exercises[j];
        const exerciseId = exerciseMap.get(exerciseData.exerciseName);

        if (!exerciseId) {
          console.warn(`Exercise not found: ${exerciseData.exerciseName}`);
          continue;
        }

        const [newWorkoutExercise] = await db
          .insert(workoutExercise)
          .values({
            workoutId: newWorkout.id,
            exerciseId,
            order: j,
          })
          .returning();

        // Add sets for the exercise
        for (const setData of exerciseData.sets) {
          await db.insert(workoutSet).values({
            workoutExerciseId: newWorkoutExercise.id,
            setNumber: setData.setNumber,
            reps: setData.reps,
            weight: setData.weight,
            completed: true,
          });
        }
      }
    }

    return {
      success: true,
      message: `Seeded ${sampleWorkouts.length} workouts with exercises and sets`,
    };
  } catch (error) {
    console.error("Error seeding workout data:", error);
    return { success: false, error: (error as Error).message };
  }
}
