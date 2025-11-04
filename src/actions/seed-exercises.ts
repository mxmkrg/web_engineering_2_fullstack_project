"use server";

import "server-only";
import { db } from "@/db";
import { exercise } from "@/db/schema";

const sampleExercises = [
  // Chest
  {
    name: "Push-ups",
    category: "chest",
    muscleGroups: "pectoralis_major,triceps,anterior_deltoid",
    description: "Classic bodyweight chest exercise",
    instructions:
      "Start in plank position, lower chest to ground, push back up",
  },
  {
    name: "Bench Press",
    category: "chest",
    muscleGroups: "pectoralis_major,triceps,anterior_deltoid",
    description: "Barbell chest exercise",
    instructions: "Lie on bench, lower bar to chest, press up",
  },
  {
    name: "Dumbbell Flyes",
    category: "chest",
    muscleGroups: "pectoralis_major",
    description: "Isolation chest exercise",
    instructions: "Lie on bench, arc dumbbells out and back together",
  },

  // Back
  {
    name: "Pull-ups",
    category: "back",
    muscleGroups: "latissimus_dorsi,biceps,posterior_deltoid",
    description: "Bodyweight back exercise",
    instructions: "Hang from bar, pull body up until chin over bar",
  },
  {
    name: "Bent-over Rows",
    category: "back",
    muscleGroups: "latissimus_dorsi,teres_major,biceps",
    description: "Barbell/dumbbell back exercise",
    instructions: "Hinge at hips, row weight to lower chest",
  },
  {
    name: "Lat Pulldowns",
    category: "back",
    muscleGroups: "latissimus_dorsi,teres_major",
    description: "Cable back exercise",
    instructions: "Pull bar down to upper chest, squeeze shoulder blades",
  },

  // Legs
  {
    name: "Squats",
    category: "legs",
    muscleGroups: "quadriceps,glutes,hamstrings",
    description: "Compound leg exercise",
    instructions: "Feet shoulder-width apart, lower hips back and down",
  },
  {
    name: "Deadlifts",
    category: "legs",
    muscleGroups: "hamstrings,glutes,erector_spinae",
    description: "Hip hinge movement",
    instructions: "Hinge at hips, lower weight, drive hips forward",
  },
  {
    name: "Lunges",
    category: "legs",
    muscleGroups: "quadriceps,glutes,hamstrings",
    description: "Single-leg exercise",
    instructions: "Step forward, lower back knee toward ground",
  },

  // Shoulders
  {
    name: "Overhead Press",
    category: "shoulders",
    muscleGroups: "deltoids,triceps",
    description: "Vertical pressing movement",
    instructions: "Press weight overhead, keep core tight",
  },
  {
    name: "Lateral Raises",
    category: "shoulders",
    muscleGroups: "lateral_deltoid",
    description: "Shoulder isolation",
    instructions: "Raise arms out to sides until parallel to ground",
  },
  {
    name: "Face Pulls",
    category: "shoulders",
    muscleGroups: "rear_deltoid,upper_back",
    description: "Rear delt exercise",
    instructions: "Pull cable to face level, separate handles",
  },

  // Arms
  {
    name: "Bicep Curls",
    category: "arms",
    muscleGroups: "biceps",
    description: "Bicep isolation",
    instructions: "Curl weight up, squeeze bicep at top",
  },
  {
    name: "Tricep Dips",
    category: "arms",
    muscleGroups: "triceps,pectoralis_major",
    description: "Tricep exercise",
    instructions: "Lower body by bending elbows, push back up",
  },
  {
    name: "Hammer Curls",
    category: "arms",
    muscleGroups: "biceps,brachialis",
    description: "Neutral grip bicep exercise",
    instructions: "Curl with neutral grip, control the weight",
  },

  // Cardio
  {
    name: "Running",
    category: "cardio",
    muscleGroups: "full_body",
    description: "Cardiovascular exercise",
    instructions: "Maintain steady pace, focus on breathing",
  },
  {
    name: "Cycling",
    category: "cardio",
    muscleGroups: "legs,cardio",
    description: "Low-impact cardio",
    instructions: "Maintain consistent cadence and resistance",
  },
  {
    name: "Jumping Jacks",
    category: "cardio",
    muscleGroups: "full_body",
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
