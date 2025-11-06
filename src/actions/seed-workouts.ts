"use server";

import "server-only";
import { db } from "@/db";
import { workout, workoutExercise, workoutSet, exercise } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { workoutTemplates } from "@/lib/workout-templates";

// Helper function to generate workout dates from September 2025 to December 2025
function generateGymJourneyDates(): Date[] {
  const dates: Date[] = [];

  // Start from September 2, 2025 (Monday) through December 30, 2025
  const startDate = new Date(2025, 8, 2); // September 2, 2025
  const endDate = new Date(2025, 11, 30); // December 30, 2025

  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();

    // Monday (1), Wednesday (3), Friday (5) - 3x per week
    if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
      dates.push(new Date(currentDate));
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

// Helper function to calculate progressive weight increases with realistic plateaus
function calculateWeight(
  baseWeight: number,
  weekNumber: number,
  progressionRate: number,
  exerciseType: "compound" | "isolation" | "bodyweight",
): number {
  if (exerciseType === "bodyweight") return baseWeight;

  let totalIncrease = 0;

  // Week-by-week progression with plateaus and deload weeks
  for (let week = 0; week < weekNumber; week++) {
    let weeklyIncrease = 0;

    // Different progression phases
    if (week < 4) {
      // First month: Linear progression (beginner gains)
      weeklyIncrease = baseWeight * 0.08 * progressionRate; // 8% per week
    } else if (week < 8) {
      // Second month: Slower progression
      weeklyIncrease = baseWeight * 0.04 * progressionRate; // 4% per week
    } else if (week < 12) {
      // Third month: Even slower, with plateaus
      if (week % 3 === 2) {
        weeklyIncrease = 0; // Plateau every 3rd week
      } else {
        weeklyIncrease = baseWeight * 0.025 * progressionRate; // 2.5% per week
      }
    } else {
      // Fourth month: Minimal gains, focus on technique
      if (week % 4 === 3) {
        weeklyIncrease = -baseWeight * 0.02; // Deload week
      } else {
        weeklyIncrease = baseWeight * 0.015 * progressionRate; // 1.5% per week
      }
    }

    totalIncrease += weeklyIncrease;
  }

  const finalWeight = baseWeight + totalIncrease;

  // Round to nearest 2.5lbs for plates
  if (exerciseType === "compound") {
    return Math.round(finalWeight / 2.5) * 2.5;
  } else {
    return Math.round(finalWeight / 2.5) * 2.5;
  }
}

// Helper function to calculate rep progression with fatigue and adaptation
function calculateReps(
  baseReps: number,
  weekNumber: number,
  setNumber: number,
  totalSets: number,
  exerciseType: "compound" | "isolation" | "bodyweight",
): number {
  let reps = baseReps;

  // Progressive overload through reps (especially for bodyweight exercises)
  if (exerciseType === "bodyweight") {
    reps += Math.floor(weekNumber / 2); // Add 1 rep every 2 weeks
  }

  // Fatigue effects (later sets have fewer reps)
  const isLastSet = setNumber === totalSets - 1;
  const isSecondToLastSet = setNumber === totalSets - 2;

  if (isLastSet && weekNumber < 8) {
    // Beginners struggle more on last sets
    reps -= Math.floor(Math.random() * 3) + 1; // 1-3 fewer reps
  } else if (isLastSet && weekNumber >= 8) {
    // More experienced, better endurance
    reps -= Math.floor(Math.random() * 2); // 0-1 fewer reps
  } else if (isSecondToLastSet && Math.random() > 0.7) {
    reps -= 1; // Sometimes struggle on second to last set
  }

  return Math.max(1, reps); // Never go below 1 rep
}

// Helper function to calculate workout duration with learning curve
function calculateDuration(
  baseDuration: number,
  weekNumber: number,
  exerciseCount: number,
): number {
  let duration = baseDuration;

  // Get more efficient over time
  const efficiencyGain = Math.min(weekNumber * 0.8, 12); // Max 12 minutes saved
  duration -= efficiencyGain;

  // Rest periods vary by experience level
  if (weekNumber < 4) {
    duration += 5; // Longer rests when learning
  } else if (weekNumber < 8) {
    duration += 2; // Getting better at timing
  }

  // More exercises = longer workout
  duration += exerciseCount * 0.5;

  // Random variance ±8 minutes
  duration += (Math.random() - 0.5) * 16;

  return Math.max(25, Math.round(duration)); // Minimum 25 minutes
}

// Generate the complete 4-month gym journey
function generateGymJourney(): any[] {
  const dates = generateGymJourneyDates();
  const workouts: any[] = [];

  // Define the rotation pattern for each phase
  const rotationPatterns = {
    foundation: ["fullBodyA", "fullBodyB", "fullBodyA"], // Weeks 1-4
    strength: ["upperBody", "lowerBody", "upperBody"], // Weeks 5-8
    hypertrophy: ["pushDay", "pullDay", "legDay"], // Weeks 9-12
    refinement: ["strengthFocus", "volumeSession", "strengthFocus"], // Weeks 13-16
  };

  dates.forEach((date, index) => {
    const weekNumber = Math.floor(index / 3);
    let currentPhase: keyof typeof rotationPatterns;
    let templateKey: string;

    // Determine phase and workout template
    if (weekNumber < 4) {
      currentPhase = "foundation";
    } else if (weekNumber < 8) {
      currentPhase = "strength";
    } else if (weekNumber < 12) {
      currentPhase = "hypertrophy";
    } else {
      currentPhase = "refinement";
    }

    const patternIndex = index % 3;
    templateKey = rotationPatterns[currentPhase][patternIndex];

    const template =
      workoutTemplates[templateKey as keyof typeof workoutTemplates];

    // Generate workout notes based on phase and progress
    const notes = generateWorkoutNotes(weekNumber, currentPhase, date);

    const workout = {
      name: template.name,
      date: date,
      duration: calculateDuration(
        template.baseDuration,
        weekNumber,
        template.exercises.length,
      ),
      notes: notes,
      exercises: template.exercises.map((exercise) => ({
        name: exercise.name,
        notes: getExerciseNotes(exercise.name, weekNumber),
        sets: Array(exercise.sets)
          .fill(null)
          .map((_, setIndex) => {
            const weight =
              exercise.baseWeight > 0
                ? calculateWeight(
                    exercise.baseWeight,
                    weekNumber,
                    exercise.progressionRate,
                    exercise.type,
                  )
                : null;

            const reps = calculateReps(
              exercise.baseReps,
              weekNumber,
              setIndex,
              exercise.sets,
              exercise.type,
            );

            return { reps, weight };
          }),
      })),
    };

    workouts.push(workout);
  });

  return workouts;
}

// Generate contextual workout notes based on phase and progress
function generateWorkoutNotes(
  weekNumber: number,
  phase: string,
  date: Date,
): string {
  const month = date.toLocaleDateString("en-US", { month: "long" });

  const phaseNotes = {
    foundation: [
      "First week at the gym - focusing on learning proper form",
      "Getting more comfortable with the movements",
      "Starting to feel stronger, form improving",
      "Foundation phase complete - ready for more challenge!",
    ],
    strength: [
      "Upper/lower split begins - excited for focused training",
      "Really feeling the strength gains now",
      "Weights are going up consistently",
      "Upper/lower split mastered - time for specialization",
    ],
    hypertrophy: [
      "Push/pull/legs split - targeting specific muscle groups",
      "Muscle definition starting to show",
      "Training feels intense but rewarding",
      "Hypertrophy phase crushing it - visible changes!",
    ],
    refinement: [
      "Focusing on strength and technique refinement",
      "Four months of progress - incredible transformation",
      "Fine-tuning everything learned so far",
      "Journey complete - from beginner to confident lifter!",
    ],
  };

  const weekInPhase = weekNumber % 4;
  const baseNote = phaseNotes[phase as keyof typeof phaseNotes][weekInPhase];

  return `Week ${weekNumber + 1} (${month}) - ${baseNote}`;
}

// Generate exercise-specific notes based on progression
function getExerciseNotes(exerciseName: string, weekNumber: number): string {
  const exerciseProgressNotes: Record<string, string[]> = {
    Squats: [
      "Focus on depth and knee tracking",
      "Getting stronger, confident with form",
      "Adding weight consistently",
      "Squats feeling powerful and controlled",
    ],
    "Bench Press": [
      "Learning the movement pattern",
      "Chest activation improving",
      "Pressing with more confidence",
      "Bench press strength really showing",
    ],
    Deadlifts: [
      "Hip hinge pattern practice",
      "Feeling the posterior chain engagement",
      "Deadlift form locked in",
      "Pulling heavy with perfect technique",
    ],
    "Overhead Press": [
      "Shoulder stability work",
      "Core engagement getting better",
      "Overhead strength developing",
      "Military press looking strong",
    ],
  };

  const phase = Math.floor(weekNumber / 4);
  const notes = exerciseProgressNotes[exerciseName];

  if (notes && notes[phase]) {
    return notes[phase];
  }

  return `Week ${weekNumber + 1} progression`;
}

// Main seeding function
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

    const gymJourney = generateGymJourney();
    let createdWorkoutsCount = 0;

    // Create each workout from the journey
    for (const workoutData of gymJourney) {
      // Create the workout - future dates are "planned", past dates are "completed"
      const currentDate = new Date();
      const workoutDate = workoutData.date;

      // Use date-only comparison to avoid timezone issues
      const workoutDateOnly = new Date(
        workoutDate.getFullYear(),
        workoutDate.getMonth(),
        workoutDate.getDate(),
      );
      const currentDateOnly = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
      );

      const status =
        workoutDateOnly <= currentDateOnly ? "completed" : "planned";

      const [newWorkout] = await db
        .insert(workout)
        .values({
          userId: userId,
          name: workoutData.name,
          status: status,
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
            completed: status === "completed",
            notes: null,
          });
        }
      }

      createdWorkoutsCount++;
    }

    const totalSets = gymJourney.reduce(
      (total, workout) =>
        total +
        workout.exercises.reduce(
          (exerciseTotal: number, exercise: any) =>
            exerciseTotal + exercise.sets.length,
          0,
        ),
      0,
    );

    return {
      success: true,
      message: `🎉 Successfully created ${createdWorkoutsCount} workouts with ${totalSets} total sets!
      
📅 Your Gym Journey (September - December 2025):
• September: Foundation Phase (Weeks 1-4) - Full body workouts
• October: Strength Phase (Weeks 5-8) - Upper/lower split  
• November: Hypertrophy Phase (Weeks 9-12) - Push/pull/legs
• December: Refinement Phase (Weeks 13-16) - Strength & volume focus

💪 Realistic progression with:
• Beginner gains in first month
• Plateaus and deload weeks
• Progressive overload through weight and reps
• Fatigue effects on later sets
• Different progression rates by exercise type

Perfect for testing your new statistics tiles! 🔥`,
    };
  } catch (error) {
    console.error("Error seeding workouts:", error);
    return {
      success: false,
      error: "Failed to seed workouts: " + (error as Error).message,
    };
  }
}
