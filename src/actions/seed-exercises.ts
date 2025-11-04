"use server";

import "server-only";
import { db } from "@/db";
import { exercise } from "@/db/schema";

const sampleExercises = [
  // CHEST - 8 exercises (major muscle group)
  {
    name: "Push-ups",
    category: "chest",
    muscleGroups: "pectoralis_major,triceps,anterior_deltoid",
    description: "Classic bodyweight chest exercise",
    instructions: "Start in plank position, lower chest to ground, push back up",
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
  {
    name: "Incline Bench Press",
    category: "chest",
    muscleGroups: "pectoralis_major,anterior_deltoid,triceps",
    description: "Upper chest focused pressing",
    instructions: "Bench at 30-45 degree angle, press weight up and slightly back",
  },
  {
    name: "Decline Bench Press",
    category: "chest",
    muscleGroups: "pectoralis_major,triceps",
    description: "Lower chest focused pressing",
    instructions: "Bench declined, press weight up focusing on lower chest",
  },
  {
    name: "Dumbbell Bench Press",
    category: "chest",
    muscleGroups: "pectoralis_major,triceps,anterior_deltoid",
    description: "Unilateral chest pressing",
    instructions: "Press dumbbells up, allowing greater range of motion",
  },
  {
    name: "Chest Dips",
    category: "chest",
    muscleGroups: "pectoralis_major,triceps,anterior_deltoid",
    description: "Bodyweight chest exercise",
    instructions: "Lean forward on dip bars, lower and press up",
  },
  {
    name: "Cable Crossovers",
    category: "chest",
    muscleGroups: "pectoralis_major",
    description: "Cable chest isolation",
    instructions: "Pull cables in arc motion across body, squeeze chest",
  },

  // BACK - 10 exercises (major muscle group)
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
  {
    name: "Deadlifts",
    category: "back",
    muscleGroups: "erector_spinae,latissimus_dorsi,trapezius,hamstrings,glutes",
    description: "Compound posterior chain exercise",
    instructions: "Hinge at hips, keep back straight, drive through heels",
  },
  {
    name: "T-Bar Rows",
    category: "back",
    muscleGroups: "latissimus_dorsi,teres_major,biceps",
    description: "Supported rowing exercise",
    instructions: "Chest supported, pull handle to lower chest",
  },
  {
    name: "Seated Cable Rows",
    category: "back",
    muscleGroups: "latissimus_dorsi,teres_major,posterior_deltoid",
    description: "Horizontal pulling exercise",
    instructions: "Pull handle to lower chest, squeeze shoulder blades",
  },
  {
    name: "Single-Arm Dumbbell Rows",
    category: "back",
    muscleGroups: "latissimus_dorsi,teres_major,biceps",
    description: "Unilateral back exercise",
    instructions: "Support on bench, pull dumbbell to hip",
  },
  {
    name: "Chin-ups",
    category: "back",
    muscleGroups: "latissimus_dorsi,biceps",
    description: "Underhand grip pull-ups",
    instructions: "Underhand grip, pull up focusing on biceps and lats",
  },
  {
    name: "Wide-Grip Pulldowns",
    category: "back",
    muscleGroups: "latissimus_dorsi,teres_major",
    description: "Wide grip lat exercise",
    instructions: "Wide grip, pull to upper chest emphasizing lat width",
  },
  {
    name: "Reverse Flyes",
    category: "back",
    muscleGroups: "posterior_deltoid,upper_back",
    description: "Rear delt and upper back exercise",
    instructions: "Arms out to sides, squeeze shoulder blades together",
  },

  // LEGS - 10 exercises (major muscle group)
  {
    name: "Squats",
    category: "legs",
    muscleGroups: "quadriceps,glutes,hamstrings",
    description: "Compound leg exercise",
    instructions: "Feet shoulder-width apart, lower hips back and down",
  },
  {
    name: "Romanian Deadlifts",
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
  {
    name: "Leg Press",
    category: "legs",
    muscleGroups: "quadriceps,glutes,hamstrings",
    description: "Machine-based leg exercise",
    instructions: "Press weight through heels, control the descent",
  },
  {
    name: "Bulgarian Split Squats",
    category: "legs",
    muscleGroups: "quadriceps,glutes,hamstrings",
    description: "Rear-foot-elevated split squat",
    instructions: "Rear foot elevated, lower front leg, drive up",
  },
  {
    name: "Hip Thrusts",
    category: "legs",
    muscleGroups: "glutes,hamstrings",
    description: "Glute-focused exercise",
    instructions: "Upper back on bench, drive hips up, squeeze glutes",
  },
  {
    name: "Leg Curls",
    category: "legs",
    muscleGroups: "hamstrings",
    description: "Hamstring isolation",
    instructions: "Curl weight up, squeeze hamstrings at top",
  },
  {
    name: "Leg Extensions",
    category: "legs",
    muscleGroups: "quadriceps",
    description: "Quad isolation exercise",
    instructions: "Extend legs up, squeeze quads at top",
  },
  {
    name: "Calf Raises",
    category: "legs",
    muscleGroups: "calves",
    description: "Calf muscle exercise",
    instructions: "Rise up on toes, squeeze calves at top",
  },
  {
    name: "Goblet Squats",
    category: "legs",
    muscleGroups: "quadriceps,glutes,hamstrings",
    description: "Front-loaded squat variation",
    instructions: "Hold weight at chest, squat down keeping chest up",
  },

  // SHOULDERS - 8 exercises (major muscle group)
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
  {
    name: "Arnold Press",
    category: "shoulders",
    muscleGroups: "deltoids,triceps",
    description: "Rotating shoulder press",
    instructions: "Start palms facing you, rotate and press overhead",
  },
  {
    name: "Front Raises",
    category: "shoulders",
    muscleGroups: "anterior_deltoid",
    description: "Front delt isolation",
    instructions: "Raise weight in front to shoulder height",
  },
  {
    name: "Rear Delt Flyes",
    category: "shoulders",
    muscleGroups: "posterior_deltoid",
    description: "Rear deltoid isolation",
    instructions: "Bend over, raise arms out to sides",
  },
  {
    name: "Upright Rows",
    category: "shoulders",
    muscleGroups: "deltoids,trapezius",
    description: "Vertical pulling exercise",
    instructions: "Pull weight up along body to chest level",
  },
  {
    name: "Pike Push-ups",
    category: "shoulders",
    muscleGroups: "anterior_deltoid,triceps",
    description: "Bodyweight shoulder exercise",
    instructions: "In pike position, lower head toward ground, press up",
  },

  // ARMS - 6 exercises (moderate muscle group)
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
  {
    name: "Tricep Pushdowns",
    category: "arms",
    muscleGroups: "triceps",
    description: "Cable tricep exercise",
    instructions: "Push cable down, squeeze triceps at bottom",
  },
  {
    name: "Overhead Tricep Extension",
    category: "arms",
    muscleGroups: "triceps",
    description: "Overhead tricep isolation",
    instructions: "Lower weight behind head, extend arms up",
  },
  {
    name: "Preacher Curls",
    category: "arms",
    muscleGroups: "biceps",
    description: "Supported bicep exercise",
    instructions: "Arms on pad, curl weight up with control",
  },

  // CORE - 5 exercises (moderate muscle group)
  {
    name: "Planks",
    category: "core",
    muscleGroups: "core,abdominals",
    description: "Isometric core exercise",
    instructions: "Hold body straight, engage core throughout",
  },
  {
    name: "Crunches",
    category: "core",
    muscleGroups: "abdominals",
    description: "Abdominal flexion exercise",
    instructions: "Lift shoulders off ground, squeeze abs",
  },
  {
    name: "Russian Twists",
    category: "core",
    muscleGroups: "obliques,abdominals",
    description: "Rotational core exercise",
    instructions: "Sit back, rotate torso side to side",
  },
  {
    name: "Dead Bugs",
    category: "core",
    muscleGroups: "core,abdominals",
    description: "Core stability exercise",
    instructions: "Lying down, extend opposite arm and leg",
  },
  {
    name: "Mountain Climbers",
    category: "core",
    muscleGroups: "core,abdominals,cardio",
    description: "Dynamic core exercise",
    instructions: "In plank, alternate bringing knees to chest",
  },

  // CARDIO - 6 exercises (moderate muscle group)
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
  {
    name: "Burpees",
    category: "cardio",
    muscleGroups: "full_body",
    description: "High-intensity full-body exercise",
    instructions: "Squat, jump back, push-up, jump forward, jump up",
  },
  {
    name: "High Knees",
    category: "cardio",
    muscleGroups: "legs,cardio",
    description: "Running in place with high knees",
    instructions: "Jog in place bringing knees to chest level",
  },
  {
    name: "Battle Ropes",
    category: "cardio",
    muscleGroups: "full_body,cardio",
    description: "High-intensity rope exercise",
    instructions: "Create waves with heavy ropes, maintain intensity",
  },

  // FUNCTIONAL - 3 exercises (smaller muscle group)
  {
    name: "Turkish Get-ups",
    category: "functional",
    muscleGroups: "full_body,core,shoulders",
    description: "Complex movement pattern",
    instructions: "Lying to standing while holding weight overhead",
  },
  {
    name: "Farmer's Walks",
    category: "functional",
    muscleGroups: "grip,core,legs",
    description: "Loaded carry exercise",
    instructions: "Walk with heavy weights in each hand",
  },
  {
    name: "Box Jumps",
    category: "functional",
    muscleGroups: "legs,power",
    description: "Explosive jumping exercise",
    instructions: "Jump onto box, land softly, step down",
  },
];

export async function seedExercises() {
  try {
    // Check if exercises already exist
    const existingExercises = await db.select().from(exercise).limit(1);

    if (existingExercises.length > 0) {
      // Delete existing exercises to allow re-seeding with updated library
      await db.delete(exercise);
    }

    // Insert comprehensive exercise library
    await db.insert(exercise).values(sampleExercises);

    return {
      success: true,
      message: `Successfully seeded ${sampleExercises.length} exercises across 8 categories`,
    };
  } catch (error) {
    console.error("Error seeding exercises:", error);
    return { success: false, error: (error as Error).message };
  }
}
