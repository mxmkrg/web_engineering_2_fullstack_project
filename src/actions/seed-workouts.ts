"use server";

import "server-only";
import { db } from "@/db";
import { workout, workoutExercise, workoutSet, exercise } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";

// Helper function to generate workout dates (Mon/Wed/Fri pattern)
function generateWorkoutDates(weeksBack: number): Date[] {
  const dates: Date[] = [];
  const today = new Date();

  for (let week = 0; week < weeksBack; week++) {
    // Generate dates for Monday, Wednesday, Friday of each week
    for (const dayOffset of [0, 2, 4]) {
      // Monday, Wednesday, Friday
      const date = new Date(today);
      date.setDate(today.getDate() - week * 7 - dayOffset);
      // Only add if it's not in the future
      if (date <= today) {
        dates.push(date);
      }
    }
  }

  return dates.sort((a, b) => a.getTime() - b.getTime()); // Sort chronologically
}

// Helper function to calculate progressive weight increases
function calculateWeight(
  baseWeight: number,
  weekNumber: number,
  progressionRate: number,
): number {
  // progressionRate: 1.0 = normal, 1.2 = fast, 0.8 = slow
  const increment = baseWeight * 0.05 * progressionRate; // 5% base increase per week
  return Math.round((baseWeight + increment * weekNumber) * 2) / 2; // Round to nearest 0.5
}

// Helper function to calculate rep progression (sometimes reps increase instead of weight)
function calculateReps(
  baseReps: number,
  weekNumber: number,
  isProgressing: boolean,
): number {
  if (!isProgressing) return baseReps;
  return Math.min(baseReps + Math.floor(weekNumber / 2), baseReps + 3); // Max 3 extra reps
}

// Helper function to calculate workout duration with some variance
function calculateDuration(baseDuration: number, weekNumber: number): number {
  const efficiency = Math.min(weekNumber * 0.5, 10); // Get more efficient over time
  const variance = Math.random() * 10 - 5; // ±5 minutes random variance
  return Math.max(20, Math.round(baseDuration - efficiency + variance)); // Minimum 20 minutes
}

// Workout templates with progression characteristics
const workoutTemplates = {
  // Week 1-4: Basic full body workouts
  fullBodyA: {
    name: "Full Body Strength A",
    baseDuration: 50,
    exercises: [
      {
        name: "Squats",
        baseWeight: 45,
        baseReps: 8,
        sets: 3,
        progressionRate: 1.1, // Good progression
        notes: "Focus on form and depth",
      },
      {
        name: "Bench Press",
        baseWeight: 65,
        baseReps: 8,
        sets: 3,
        progressionRate: 0.9, // Slower progression - bench is hard for beginners
        notes: "Full range of motion",
      },
      {
        name: "Bent-over Rows",
        baseWeight: 55,
        baseReps: 10,
        sets: 3,
        progressionRate: 1.0, // Normal progression
        notes: "Squeeze shoulder blades",
      },
      {
        name: "Overhead Press",
        baseWeight: 35,
        baseReps: 8,
        sets: 3,
        progressionRate: 0.7, // Slow progression - shoulders are weak initially
        notes: "Keep core tight",
      },
      {
        name: "Planks",
        baseWeight: null,
        baseReps: 30,
        sets: 3,
        progressionRate: 1.3, // Fast progression in endurance
        notes: "Hold for seconds, not reps",
      },
    ],
  },

  fullBodyB: {
    name: "Full Body Strength B",
    baseDuration: 45,
    exercises: [
      {
        name: "Romanian Deadlifts",
        baseWeight: 75,
        baseReps: 8,
        sets: 3,
        progressionRate: 1.2, // Fast progression - deadlifts respond well
        notes: "Hinge at hips, feel the stretch",
      },
      {
        name: "Dumbbell Bench Press",
        baseWeight: 25,
        baseReps: 10,
        sets: 3,
        progressionRate: 1.0, // Normal progression
        notes: "Control the weight",
      },
      {
        name: "Lat Pulldowns",
        baseWeight: 70,
        baseReps: 10,
        sets: 3,
        progressionRate: 1.1, // Good progression
        notes: "Pull to upper chest",
      },
      {
        name: "Lunges",
        baseWeight: 20,
        baseReps: 12,
        sets: 3,
        progressionRate: 0.8, // Slower progression - balance takes time
        notes: "Alternate legs, control the movement",
      },
      {
        name: "Bicep Curls",
        baseWeight: 15,
        baseReps: 12,
        sets: 3,
        progressionRate: 0.9, // Slower progression - small muscle
        notes: "Squeeze at the top",
      },
    ],
  },

  // Week 5-8: Upper/Lower split
  upperBody: {
    name: "Upper Body Focus",
    baseDuration: 55,
    exercises: [
      {
        name: "Bench Press",
        baseWeight: 75,
        baseReps: 8,
        sets: 4,
        progressionRate: 1.0, // Getting stronger
        notes: "Adding volume with 4th set",
      },
      {
        name: "Pull-ups",
        baseWeight: null,
        baseReps: 5,
        sets: 3,
        progressionRate: 1.4, // Fast progression once form improves
        notes: "Use assistance if needed",
      },
      {
        name: "Overhead Press",
        baseWeight: 45,
        baseReps: 8,
        sets: 3,
        progressionRate: 0.8, // Still challenging
        notes: "Stronger base now",
      },
      {
        name: "Seated Cable Rows",
        baseWeight: 80,
        baseReps: 10,
        sets: 3,
        progressionRate: 1.1, // Good back development
        notes: "Squeeze shoulder blades",
      },
      {
        name: "Lateral Raises",
        baseWeight: 10,
        baseReps: 15,
        sets: 3,
        progressionRate: 0.6, // Very slow - delts are stubborn
        notes: "Light weight, perfect form",
      },
      {
        name: "Tricep Pushdowns",
        baseWeight: 30,
        baseReps: 12,
        sets: 3,
        progressionRate: 0.9, // Moderate progression
        notes: "Full extension",
      },
    ],
  },

  lowerBody: {
    name: "Lower Body Power",
    baseDuration: 60,
    exercises: [
      {
        name: "Squats",
        baseWeight: 85,
        baseReps: 8,
        sets: 4,
        progressionRate: 1.2, // Great progression by now
        notes: "Adding weight and volume",
      },
      {
        name: "Romanian Deadlifts",
        baseWeight: 95,
        baseReps: 8,
        sets: 3,
        progressionRate: 1.3, // Excellent progression
        notes: "Hamstrings getting stronger",
      },
      {
        name: "Bulgarian Split Squats",
        baseWeight: 25,
        baseReps: 10,
        sets: 3,
        progressionRate: 1.0, // Balance improved
        notes: "Better stability now",
      },
      {
        name: "Leg Press",
        baseWeight: 180,
        baseReps: 12,
        sets: 3,
        progressionRate: 1.4, // Machine allows faster progression
        notes: "Full range of motion",
      },
      {
        name: "Calf Raises",
        baseWeight: 100,
        baseReps: 15,
        sets: 4,
        progressionRate: 1.1, // Steady progression
        notes: "Pause at the top",
      },
      {
        name: "Leg Curls",
        baseWeight: 50,
        baseReps: 12,
        sets: 3,
        progressionRate: 1.0, // Normal progression
        notes: "Squeeze hamstrings",
      },
    ],
  },

  // Week 9-12: Push/Pull/Legs split
  pushDay: {
    name: "Push Day (Chest, Shoulders, Triceps)",
    baseDuration: 65,
    exercises: [
      {
        name: "Bench Press",
        baseWeight: 85,
        baseReps: 8,
        sets: 4,
        progressionRate: 1.1, // Strong progression
        notes: "Confident with heavier weight",
      },
      {
        name: "Incline Bench Press",
        baseWeight: 65,
        baseReps: 10,
        sets: 3,
        progressionRate: 1.0, // Learning new movement
        notes: "Upper chest development",
      },
      {
        name: "Overhead Press",
        baseWeight: 55,
        baseReps: 8,
        sets: 4,
        progressionRate: 0.9, // Improving but still challenging
        notes: "Shoulders getting stronger",
      },
      {
        name: "Lateral Raises",
        baseWeight: 15,
        baseReps: 15,
        sets: 4,
        progressionRate: 0.7, // Slow but steady
        notes: "Better mind-muscle connection",
      },
      {
        name: "Tricep Dips",
        baseWeight: null,
        baseReps: 10,
        sets: 3,
        progressionRate: 1.2, // Good bodyweight progression
        notes: "Full range of motion",
      },
      {
        name: "Overhead Tricep Extension",
        baseWeight: 40,
        baseReps: 12,
        sets: 3,
        progressionRate: 0.8, // Steady growth
        notes: "Control the negative",
      },
    ],
  },

  pullDay: {
    name: "Pull Day (Back, Biceps)",
    baseDuration: 60,
    exercises: [
      {
        name: "Pull-ups",
        baseWeight: null,
        baseReps: 8,
        sets: 4,
        progressionRate: 1.5, // Excellent progression
        notes: "Big improvement in pulling strength",
      },
      {
        name: "Bent-over Rows",
        baseWeight: 75,
        baseReps: 8,
        sets: 4,
        progressionRate: 1.2, // Strong back development
        notes: "Heavier weight, better form",
      },
      {
        name: "Lat Pulldowns",
        baseWeight: 90,
        baseReps: 10,
        sets: 3,
        progressionRate: 1.1, // Good progression
        notes: "Wide grip focus",
      },
      {
        name: "Single-Arm Dumbbell Rows",
        baseWeight: 40,
        baseReps: 10,
        sets: 3,
        progressionRate: 1.0, // Learning unilateral movement
        notes: "Focus on each side",
      },
      {
        name: "Bicep Curls",
        baseWeight: 25,
        baseReps: 12,
        sets: 4,
        progressionRate: 1.0, // Steady arm growth
        notes: "Biceps responding well",
      },
      {
        name: "Hammer Curls",
        baseWeight: 22.5,
        baseReps: 12,
        sets: 3,
        progressionRate: 0.9, // Good variation
        notes: "Forearm strength improving",
      },
    ],
  },

  legDay: {
    name: "Leg Day (Quads, Hamstrings, Glutes)",
    baseDuration: 70,
    exercises: [
      {
        name: "Squats",
        baseWeight: 105,
        baseReps: 8,
        sets: 5,
        progressionRate: 1.3, // Excellent squat progression
        notes: "Squat strength really taking off",
      },
      {
        name: "Romanian Deadlifts",
        baseWeight: 115,
        baseReps: 8,
        sets: 4,
        progressionRate: 1.4, // Outstanding hamstring development
        notes: "Posterior chain very strong",
      },
      {
        name: "Leg Press",
        baseWeight: 220,
        baseReps: 12,
        sets: 4,
        progressionRate: 1.5, // Machine allows heavy progression
        notes: "Moving serious weight",
      },
      {
        name: "Leg Extensions",
        baseWeight: 60,
        baseReps: 15,
        sets: 3,
        progressionRate: 1.1, // Good quad isolation
        notes: "Quad definition improving",
      },
      {
        name: "Leg Curls",
        baseWeight: 65,
        baseReps: 12,
        sets: 3,
        progressionRate: 1.2, // Strong hamstring growth
        notes: "Hamstring strength balanced",
      },
      {
        name: "Calf Raises",
        baseWeight: 120,
        baseReps: 20,
        sets: 4,
        progressionRate: 1.2, // High volume, good progression
        notes: "Calf endurance and strength up",
      },
    ],
  },

  // Occasional cardio/conditioning workouts
  cardioDay: {
    name: "Cardio & Conditioning",
    baseDuration: 35,
    exercises: [
      {
        name: "Running",
        baseWeight: null,
        baseReps: 20,
        sets: 1,
        progressionRate: 1.3, // Endurance improving
        notes: "Minutes of steady cardio",
      },
      {
        name: "Burpees",
        baseWeight: null,
        baseReps: 8,
        sets: 4,
        progressionRate: 1.4, // High intensity improving
        notes: "Full body explosive movement",
      },
      {
        name: "Mountain Climbers",
        baseWeight: null,
        baseReps: 30,
        sets: 3,
        progressionRate: 1.5, // Core and cardio together
        notes: "Core strength and cardio",
      },
      {
        name: "Battle Ropes",
        baseWeight: null,
        baseReps: 30,
        sets: 3,
        progressionRate: 1.2, // Upper body cardio
        notes: "High intensity upper body",
      },
    ],
  },
};

// Generate 12 weeks of workouts (3 per week = 36 total workouts)
function generateWorkoutProgression(): any[] {
  const workouts: any[] = [];
  const dates = generateWorkoutDates(4); // 4 weeks back to include current week

  // Workout rotation pattern for 4 weeks
  const rotations = [
    // Weeks 1-4: Full Body (A/B alternating) - 12 workouts total
    ...Array(12)
      .fill(null)
      .map((_, i) => (i % 2 === 0 ? "fullBodyA" : "fullBodyB")),
  ];

  dates.forEach((date, index) => {
    if (index >= rotations.length) return;

    const weekNumber = Math.floor(index / 3); // Which week (0-11)
    const templateKey = rotations[index];
    const template =
      workoutTemplates[templateKey as keyof typeof workoutTemplates];

    const workout = {
      name: template.name,
      date: date,
      duration: calculateDuration(template.baseDuration, weekNumber),
      notes: `Week ${weekNumber + 1} - ${getWorkoutNotes(weekNumber, templateKey)}`,
      exercises: template.exercises.map((exercise) => ({
        name: exercise.name,
        notes: exercise.notes,
        sets: Array(exercise.sets)
          .fill(null)
          .map((_, setIndex) => {
            const weight = exercise.baseWeight
              ? calculateWeight(
                  exercise.baseWeight,
                  weekNumber,
                  exercise.progressionRate,
                )
              : null;
            const reps = exercise.baseWeight
              ? exercise.baseReps
              : calculateReps(exercise.baseReps, weekNumber, true);

            // Add some variance to sets (sometimes last set has fewer reps)
            const isLastSet = setIndex === exercise.sets - 1;
            const finalReps =
              isLastSet && Math.random() > 0.7
                ? Math.max(1, reps - Math.floor(Math.random() * 3))
                : reps;

            return {
              reps: finalReps,
              weight: weight,
            };
          }),
      })),
    };

    workouts.push(workout);
  });

  return workouts;
}

// Helper function to generate contextual workout notes
function getWorkoutNotes(weekNumber: number, templateKey: string): string {
  const notes = [
    // Weeks 1-4
    "Getting familiar with movements and building base strength",
    "Form is improving, starting to feel more confident",
    "Weights feeling easier, ready to progress",
    "Solid foundation built, ready for new challenges",
    // Weeks 5-8
    "Transitioning to upper/lower split for more volume",
    "Enjoying the focused muscle group training",
    "Strength gains really showing now",
    "Upper/lower split working great for recovery",
    // Weeks 9-12
    "Push/pull/legs split for serious muscle building",
    "Each muscle group getting optimal attention",
    "Feeling like a real lifter now!",
    "Three months of progress - incredible transformation",
  ];

  return notes[weekNumber] || "Continuing the journey";
}

const sampleWorkouts = generateWorkoutProgression();

export async function seedWorkouts() {
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

    // Check if workouts already exist for this user
    const existingWorkouts = await db
      .select()
      .from(workout)
      .where(eq(workout.userId, userId))
      .limit(1);

    if (existingWorkouts.length > 0) {
      // Clear existing workouts to allow re-seeding with new progression data
      await db.delete(workout).where(eq(workout.userId, userId));
    }

    let createdWorkoutsCount = 0;

    // Create each workout from the progression
    for (const workoutData of sampleWorkouts) {
      // Create the workout with completed status
      const [newWorkout] = await db
        .insert(workout)
        .values({
          userId: userId,
          name: workoutData.name,
          status: "completed",
          date: workoutData.date,
          duration: workoutData.duration,
          notes: workoutData.notes,
        })
        .returning();

      // Add exercises and sets
      for (
        let exerciseIndex = 0;
        exerciseIndex < workoutData.exercises.length;
        exerciseIndex++
      ) {
        const exerciseData = workoutData.exercises[exerciseIndex];

        // Find the exercise by name
        const [existingExercise] = await db
          .select()
          .from(exercise)
          .where(eq(exercise.name, exerciseData.name))
          .limit(1);

        if (!existingExercise) {
          console.warn(`Exercise "${exerciseData.name}" not found in database`);
          continue;
        }

        // Create workoutExercise entry
        const [newWorkoutExercise] = await db
          .insert(workoutExercise)
          .values({
            workoutId: newWorkout.id,
            exerciseId: existingExercise.id,
            order: exerciseIndex,
            notes: exerciseData.notes || null,
          })
          .returning();

        // Create workoutSet entries
        for (
          let setIndex = 0;
          setIndex < exerciseData.sets.length;
          setIndex++
        ) {
          const setData = exerciseData.sets[setIndex];

          await db.insert(workoutSet).values({
            workoutExerciseId: newWorkoutExercise.id,
            setNumber: setIndex + 1,
            reps: setData.reps,
            weight: setData.weight,
            completed: true, // Mark as completed since these are completed workouts
            notes: null,
          });
        }
      }

      createdWorkoutsCount++;
    }

    return {
      success: true,
      message: `Successfully created ${createdWorkoutsCount} progressive workouts spanning 3 months! 
					   \nIncludes: 
					   • Weeks 1-4: Full body foundation building
					   • Weeks 5-8: Upper/lower split for increased volume  
					   • Weeks 9-12: Push/pull/legs for muscle specialization
					   • Realistic progression with varying muscle group development`,
    };
  } catch (error) {
    console.error("Error seeding workouts:", error);
    return {
      success: false,
      error: "Failed to seed workouts: " + (error as Error).message,
    };
  }
}
