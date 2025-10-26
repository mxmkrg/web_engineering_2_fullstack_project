import { drizzle } from "drizzle-orm/libsql";
import { exercise } from "@/db/schema";

// Create a direct database connection for seeding
const db = drizzle({
  connection: {
    url: "file:./src/db/localdb.sqlite",
  },
});

const exercises = [
  // Chest
  {
    name: "Bench Press",
    category: "chest",
    muscleGroups: JSON.stringify(["chest", "triceps", "shoulders"]),
    equipment: "barbell",
    description: "Classic compound chest exercise",
    instructions: "Lie on bench, lower bar to chest, press up with control",
  },
  {
    name: "Incline Bench Press",
    category: "chest",
    muscleGroups: JSON.stringify(["chest", "triceps", "shoulders"]),
    equipment: "barbell",
    description: "Targets upper chest fibers",
    instructions: "Set bench to 30-45 degrees, press with controlled motion",
  },
  {
    name: "Dumbbell Flyes",
    category: "chest",
    muscleGroups: JSON.stringify(["chest"]),
    equipment: "dumbbell",
    description: "Isolation exercise for chest",
    instructions:
      "Lower dumbbells with slight bend in elbows, squeeze chest at top",
  },
  {
    name: "Push-ups",
    category: "chest",
    muscleGroups: JSON.stringify(["chest", "triceps", "shoulders", "core"]),
    equipment: "bodyweight",
    description: "Bodyweight chest exercise",
    instructions: "Lower body as one unit, push up explosively",
  },

  // Back
  {
    name: "Deadlift",
    category: "back",
    muscleGroups: JSON.stringify(["back", "hamstrings", "glutes", "traps"]),
    equipment: "barbell",
    description: "King of all exercises",
    instructions: "Hip hinge movement, keep bar close to body throughout",
  },
  {
    name: "Pull-ups",
    category: "back",
    muscleGroups: JSON.stringify(["back", "biceps"]),
    equipment: "bodyweight",
    description: "Upper body pulling exercise",
    instructions: "Pull body up until chin clears bar, control descent",
  },
  {
    name: "Bent Over Row",
    category: "back",
    muscleGroups: JSON.stringify(["back", "biceps", "rear delts"]),
    equipment: "barbell",
    description: "Horizontal pulling movement",
    instructions: "Hinge at hips, pull bar to lower chest",
  },
  {
    name: "Lat Pulldown",
    category: "back",
    muscleGroups: JSON.stringify(["back", "biceps"]),
    equipment: "machine",
    description: "Machine-based vertical pull",
    instructions: "Pull bar to upper chest, squeeze shoulder blades",
  },

  // Legs
  {
    name: "Squat",
    category: "legs",
    muscleGroups: JSON.stringify(["quadriceps", "glutes", "hamstrings"]),
    equipment: "barbell",
    description: "King of leg exercises",
    instructions: "Descend until hip crease below knee, drive through heels",
  },
  {
    name: "Romanian Deadlift",
    category: "legs",
    muscleGroups: JSON.stringify(["hamstrings", "glutes", "back"]),
    equipment: "barbell",
    description: "Hip hinge movement for posterior chain",
    instructions: "Keep bar close, push hips back, feel stretch in hamstrings",
  },
  {
    name: "Leg Press",
    category: "legs",
    muscleGroups: JSON.stringify(["quadriceps", "glutes"]),
    equipment: "machine",
    description: "Machine-based leg exercise",
    instructions: "Lower weight with control, press through full range",
  },
  {
    name: "Lunges",
    category: "legs",
    muscleGroups: JSON.stringify(["quadriceps", "glutes", "hamstrings"]),
    equipment: "bodyweight",
    description: "Unilateral leg exercise",
    instructions: "Step forward, lower back knee, return to start",
  },

  // Shoulders
  {
    name: "Overhead Press",
    category: "shoulders",
    muscleGroups: JSON.stringify(["shoulders", "triceps", "core"]),
    equipment: "barbell",
    description: "Vertical pressing movement",
    instructions: "Press bar overhead, keep core tight throughout",
  },
  {
    name: "Lateral Raises",
    category: "shoulders",
    muscleGroups: JSON.stringify(["shoulders"]),
    equipment: "dumbbell",
    description: "Isolation for side delts",
    instructions: "Raise arms to side until parallel to floor",
  },
  {
    name: "Rear Delt Flyes",
    category: "shoulders",
    muscleGroups: JSON.stringify(["rear delts", "upper back"]),
    equipment: "dumbbell",
    description: "Targets rear deltoids",
    instructions: "Bend forward, raise arms back in arc motion",
  },

  // Arms
  {
    name: "Bicep Curls",
    category: "arms",
    muscleGroups: JSON.stringify(["biceps"]),
    equipment: "dumbbell",
    description: "Basic bicep isolation",
    instructions: "Curl weight up, squeeze bicep, lower with control",
  },
  {
    name: "Tricep Dips",
    category: "arms",
    muscleGroups: JSON.stringify(["triceps", "shoulders"]),
    equipment: "bodyweight",
    description: "Bodyweight tricep exercise",
    instructions: "Lower body by bending elbows, push back up",
  },
  {
    name: "Close Grip Bench Press",
    category: "arms",
    muscleGroups: JSON.stringify(["triceps", "chest"]),
    equipment: "barbell",
    description: "Compound tricep movement",
    instructions: "Narrow grip, focus on tricep contraction",
  },

  // Core
  {
    name: "Plank",
    category: "core",
    muscleGroups: JSON.stringify(["core", "shoulders"]),
    equipment: "bodyweight",
    description: "Isometric core exercise",
    instructions: "Hold straight line from head to heels",
  },
  {
    name: "Russian Twists",
    category: "core",
    muscleGroups: JSON.stringify(["core", "obliques"]),
    equipment: "bodyweight",
    description: "Rotational core movement",
    instructions: "Rotate torso side to side while balancing",
  },
];

export async function seedExercises() {
  console.log("Seeding exercises...");

  try {
    await db.insert(exercise).values(exercises);
    console.log(`Successfully seeded ${exercises.length} exercises`);
  } catch (error) {
    console.error("Error seeding exercises:", error);
  }
}

// Run this if called directly
if (require.main === module) {
  seedExercises();
}
