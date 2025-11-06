import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-server";
import { db } from "@/db";
import { routine, routineExercise, exercise } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        { error: "This endpoint is only available in development" },
        { status: 403 }
      );
    }

    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { userId } = await request.json();
    
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: "User ID mismatch" },
        { status: 403 }
      );
    }

    // Get some exercises from the database to use in routines
    const allExercises = await db.select().from(exercise).limit(20);
    
    if (allExercises.length === 0) {
      return NextResponse.json(
        { error: "No exercises found in database. Please seed exercises first." },
        { status: 400 }
      );
    }

    // Helper function to get exercises by name pattern
    const getExercisesByPattern = (patterns: string[]) => {
      return allExercises.filter(ex => 
        patterns.some(pattern => 
          ex.name.toLowerCase().includes(pattern.toLowerCase())
        )
      );
    };

    // Define sample routines with exercises
    const sampleRoutines = [
      {
        name: "Push Day",
        description: "Upper body pushing movements focusing on chest, shoulders, and triceps",
        category: "strength" as const,
        difficulty: "intermediate" as const,
        duration: 75,
        tags: ["push", "upper body", "strength"],
        exercises: [
          { pattern: ["bench", "press", "chest"], sets: 4, reps: "8-10", weight: 135, rest: 120 },
          { pattern: ["shoulder", "overhead", "military"], sets: 3, reps: "10-12", weight: 95, rest: 90 },
          { pattern: ["tricep", "dip"], sets: 3, reps: "12-15", weight: null, rest: 60 },
          { pattern: ["lateral", "side"], sets: 3, reps: "12-15", weight: 25, rest: 60 },
        ]
      },
      {
        name: "Pull Day",
        description: "Upper body pulling movements targeting back and biceps",
        category: "strength" as const,
        difficulty: "intermediate" as const,
        duration: 70,
        tags: ["pull", "upper body", "back"],
        exercises: [
          { pattern: ["pull", "lat"], sets: 4, reps: "8-10", weight: 150, rest: 120 },
          { pattern: ["row", "cable"], sets: 3, reps: "10-12", weight: 120, rest: 90 },
          { pattern: ["bicep", "curl"], sets: 3, reps: "12-15", weight: 35, rest: 60 },
          { pattern: ["face", "rear"], sets: 3, reps: "15-20", weight: 20, rest: 60 },
        ]
      },
      {
        name: "Leg Day",
        description: "Lower body strength and power workout",
        category: "strength" as const,
        difficulty: "advanced" as const,
        duration: 90,
        tags: ["legs", "lower body", "strength"],
        exercises: [
          { pattern: ["squat", "back"], sets: 4, reps: "6-8", weight: 185, rest: 180 },
          { pattern: ["deadlift", "romanian"], sets: 3, reps: "8-10", weight: 155, rest: 150 },
          { pattern: ["lunge", "split"], sets: 3, reps: "12-15", weight: 50, rest: 90 },
          { pattern: ["calf", "raise"], sets: 4, reps: "15-20", weight: 100, rest: 60 },
        ]
      },
      {
        name: "Full Body Beginner",
        description: "Complete body workout perfect for beginners",
        category: "mixed" as const,
        difficulty: "beginner" as const,
        duration: 45,
        tags: ["beginner", "full body", "compound"],
        exercises: [
          { pattern: ["squat", "goblet"], sets: 3, reps: "10-12", weight: 35, rest: 90 },
          { pattern: ["push", "up"], sets: 3, reps: "8-12", weight: null, rest: 60 },
          { pattern: ["row", "bent"], sets: 3, reps: "10-12", weight: 25, rest: 90 },
          { pattern: ["plank"], sets: 3, reps: "30-60s", weight: null, rest: 60 },
        ]
      },
      {
        name: "HIIT Cardio",
        description: "High-intensity interval training for cardiovascular fitness",
        category: "endurance" as const,
        difficulty: "intermediate" as const,
        duration: 30,
        tags: ["cardio", "hiit", "endurance"],
        exercises: [
          { pattern: ["burpee"], sets: 4, reps: "10", weight: null, rest: 30 },
          { pattern: ["jump", "squat"], sets: 4, reps: "15", weight: null, rest: 30 },
          { pattern: ["mountain", "climber"], sets: 4, reps: "20", weight: null, rest: 30 },
          { pattern: ["jump", "jack"], sets: 4, reps: "30", weight: null, rest: 60 },
        ]
      }
    ];

    let routinesCreated = 0;

    // Create routines in a transaction
    await db.transaction(async (tx) => {
      for (const routineData of sampleRoutines) {
        // Check if routine with this name already exists for user
        const existingRoutine = await tx
          .select()
          .from(routine)
          .where(eq(routine.userId, userId))
          .limit(1);

        const routineExists = existingRoutine.some(r => r.name === routineData.name);
        
        if (routineExists) {
          console.log(`Routine "${routineData.name}" already exists, skipping...`);
          continue;
        }

        // Create the routine
        const [newRoutine] = await tx.insert(routine).values({
          userId: userId,
          name: routineData.name,
          description: routineData.description,
          category: routineData.category,
          difficulty: routineData.difficulty,
          duration: routineData.duration,
          tags: JSON.stringify(routineData.tags),
          isPublic: false,
          isTemplate: true,
        }).returning();

        // Add exercises to the routine
        for (let i = 0; i < routineData.exercises.length; i++) {
          const exerciseConfig = routineData.exercises[i];
          const matchingExercises = getExercisesByPattern(exerciseConfig.pattern);
          
          if (matchingExercises.length > 0) {
            const selectedExercise = matchingExercises[0]; // Use first match
            
            await tx.insert(routineExercise).values({
              routineId: newRoutine.id,
              exerciseId: selectedExercise.id,
              order: i,
              targetSets: exerciseConfig.sets,
              targetReps: exerciseConfig.reps,
              targetWeight: exerciseConfig.weight,
              restPeriod: exerciseConfig.rest,
              notes: null,
            });
          }
        }

        routinesCreated++;
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${routinesCreated} sample routines!`,
      routinesCreated,
    });

  } catch (error) {
    console.error("Error seeding routines:", error);
    return NextResponse.json(
      { error: "Failed to seed routines" },
      { status: 500 }
    );
  }
}