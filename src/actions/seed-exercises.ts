"use server";

import "server-only";
import { db } from "@/db";
import { exercise } from "@/db/schema";

const sampleExercises = [
  // Chest
  {
    name: "Push-ups",
    category: "chest",
    description: "Classic bodyweight chest exercise",
    instructions:
      "Start in plank position, lower chest to ground, push back up",
  },
  {
    name: "Bench Press",
    category: "chest",
    description: "Barbell chest exercise",
    instructions: "Lie on bench, lower bar to chest, press up",
  },
  {
    name: "Dumbbell Flyes",
    category: "chest",
    description: "Isolation chest exercise",
    instructions: "Lie on bench, arc dumbbells out and back together",
  },

  // Back
  {
    name: "Pull-ups",
    category: "back",
    description: "Bodyweight back exercise",
    instructions: "Hang from bar, pull body up until chin over bar",
  },
  {
    name: "Bent-over Rows",
    category: "back",
    description: "Barbell/dumbbell back exercise",
    instructions: "Hinge at hips, row weight to lower chest",
  },
  {
    name: "Lat Pulldowns",
    category: "back",
    description: "Cable back exercise",
    instructions: "Pull bar down to upper chest, squeeze shoulder blades",
  },

  // Legs
  {
    name: "Squats",
    category: "legs",
    description: "Compound leg exercise",
    instructions: "Feet shoulder-width apart, lower hips back and down",
  },
  {
    name: "Deadlifts",
    category: "legs",
    description: "Hip hinge movement",
    instructions: "Hinge at hips, lower weight, drive hips forward",
  },
  {
    name: "Lunges",
    category: "legs",
    description: "Single-leg exercise",
    instructions: "Step forward, lower back knee toward ground",
  },

  // Shoulders
  {
    name: "Overhead Press",
    category: "shoulders",
    description: "Vertical pressing movement",
    instructions: "Press weight overhead, keep core tight",
  },
  {
    name: "Lateral Raises",
    category: "shoulders",
    description: "Shoulder isolation",
    instructions: "Raise arms out to sides until parallel to ground",
  },
  {
    name: "Face Pulls",
    category: "shoulders",
    description: "Rear delt exercise",
    instructions: "Pull cable to face level, separate handles",
  },

  // Arms
  {
    name: "Bicep Curls",
    category: "arms",
    description: "Bicep isolation",
    instructions: "Curl weight up, squeeze bicep at top",
  },
  {
    name: "Tricep Dips",
    category: "arms",
    description: "Tricep exercise",
    instructions: "Lower body by bending elbows, push back up",
  },
  {
    name: "Hammer Curls",
    category: "arms",
    description: "Neutral grip bicep exercise",
    instructions: "Curl with neutral grip, control the weight",
  },

  // Cardio
  {
    name: "Running",
    category: "cardio",
    description: "Cardiovascular exercise",
    instructions: "Maintain steady pace, focus on breathing",
  },
  {
    name: "Cycling",
    category: "cardio",
    description: "Low-impact cardio",
    instructions: "Maintain consistent cadence and resistance",
  },
  {
    name: "Jumping Jacks",
    category: "cardio",
    description: "Full-body cardio",
    instructions: "Jump feet apart while raising arms overhead",
  },
];

export async function seedExercises() {
  try {
    // Check if exercises already exist
    const existingExercises = await db.select().from(exercise).limit(1);

    if (existingExercises.length > 0) {
      return { success: true, message: "Exercises already seeded" };
    }

    // Insert sample exercises
    await db.insert(exercise).values(sampleExercises);

    return {
      success: true,
      message: `Seeded ${sampleExercises.length} exercises`,
    };
  } catch (error) {
    console.error("Error seeding exercises:", error);
    return { success: false, error: (error as Error).message };
  }
}
