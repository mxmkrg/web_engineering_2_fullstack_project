import { Suspense } from "react";
import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { routine, routineExercise, exercise } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { RoutinesContent } from "./_components/routines-content";

// Server functions for routines
async function getUserRoutines(userId: string) {
  try {
    const userRoutines = await db
      .select()
      .from(routine)
      .where(eq(routine.userId, userId))
      .orderBy(routine.createdAt);

    // Get exercise counts for each routine
    const routinesWithCounts = await Promise.all(
      userRoutines.map(async (r) => {
        const exerciseCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(routineExercise)
          .where(eq(routineExercise.routineId, r.id));
        
        return {
          ...r,
          exerciseCount: Number(exerciseCount[0]?.count) || 0,
          tags: Array.isArray(r.tags)
            ? r.tags
            : typeof r.tags === "string"
              ? JSON.parse(r.tags)
              : [],
        };
      })
    );

    return routinesWithCounts;
  } catch (error) {
    console.error("Error fetching user routines:", error);
    return [];
  }
}

async function getRoutineWithExercises(routineId: number) {
  try {
    const routineData = await db
      .select()
      .from(routine)
      .where(eq(routine.id, routineId))
      .limit(1);

    if (routineData.length === 0) {
      return null;
    }

    const routineExercises = await db
      .select({
        id: routineExercise.id,
        exerciseId: routineExercise.exerciseId,
        exerciseName: exercise.name,
        order: routineExercise.order,
        targetSets: routineExercise.targetSets,
        targetReps: routineExercise.targetReps,
        targetWeight: routineExercise.targetWeight,
        restPeriod: routineExercise.restPeriod,
        notes: routineExercise.notes,
      })
      .from(routineExercise)
      .innerJoin(exercise, eq(routineExercise.exerciseId, exercise.id))
      .where(eq(routineExercise.routineId, routineId))
      .orderBy(routineExercise.order);

    return {
      ...routineData[0],
      exercises: routineExercises,
      tags: Array.isArray(routineData[0].tags)
        ? routineData[0].tags
        : typeof routineData[0].tags === "string"
          ? JSON.parse(routineData[0].tags)
          : [],
    };
  } catch (error) {
    console.error("Error fetching routine with exercises:", error);
    return null;
  }
}

async function getAllExercises() {
  try {
    return await db.select().from(exercise).orderBy(exercise.name);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return [];
  }
}

const createRoutineSchema = z.object({
  userId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.enum(["strength", "hypertrophy", "endurance", "mixed", "custom"]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  duration: z.coerce.number().optional(),
  tags: z.string().optional(),
  exercises: z.string().optional(), // JSON string of exercise array
});

const routineExerciseSchema = z.object({
  exerciseId: z.number(),
  targetSets: z.number().min(1),
  targetReps: z.string(),
  targetWeight: z.number().optional(),
  restPeriod: z.number().optional(),
  notes: z.string().optional(),
});

async function createRoutine(formData: FormData) {
  try {
    const rawData = {
      userId: formData.get("userId") as string,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      difficulty: formData.get("difficulty") as string,
      duration: formData.get("duration") as string,
      tags: formData.get("tags") as string,
      exercises: formData.get("exercises") as string,
    };

    const validatedData = createRoutineSchema.parse(rawData);

    const tags = validatedData.tags ? JSON.parse(validatedData.tags) : [];
    const exercises = validatedData.exercises ? JSON.parse(validatedData.exercises) : [];

    // Validate exercises if provided
    if (exercises.length > 0) {
      for (const ex of exercises) {
        routineExerciseSchema.parse(ex);
      }
    }

    // Create routine in a transaction
    const result = await db.transaction(async (tx) => {
      // Insert routine
      const [newRoutine] = await tx.insert(routine).values({
        userId: validatedData.userId,
        name: validatedData.name,
        description: validatedData.description || null,
        category: validatedData.category,
        difficulty: validatedData.difficulty,
        duration: validatedData.duration || null,
        tags: JSON.stringify(tags),
        isPublic: false,
        isTemplate: true, // Mark as template since we're building it
      }).returning();

      // Insert routine exercises if any
      if (exercises.length > 0) {
        const routineExercisesToInsert = exercises.map((ex: any, index: number) => ({
          routineId: newRoutine.id,
          exerciseId: ex.exerciseId,
          order: index,
          targetSets: ex.targetSets,
          targetReps: ex.targetReps,
          targetWeight: ex.targetWeight || null,
          restPeriod: ex.restPeriod || null,
          notes: ex.notes || null,
        }));

        await tx.insert(routineExercise).values(routineExercisesToInsert);
      }

      return newRoutine;
    });

    revalidatePath("/dashboard/routines");
    return { success: true, routineId: result.id };
  } catch (error) {
    console.error("Error creating routine:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create routine",
    };
  }
}

async function RoutinesWrapper({ userId }: { userId: string }) {
  const initialRoutines = await getUserRoutines(userId);
  const exercises = await getAllExercises();

  const handleGetRoutines = async () => {
    "use server";
    return await getUserRoutines(userId);
  };

  const handleCreateRoutine = async (formData: FormData) => {
    "use server";
    return await createRoutine(formData);
  };

  const handleGetExercises = async () => {
    "use server";
    return await getAllExercises();
  };

  const handleGetRoutineWithExercises = async (routineId: number) => {
    "use server";
    return await getRoutineWithExercises(routineId);
  };

  return (
    <RoutinesContent
      userId={userId}
      initialRoutines={initialRoutines}
      exercises={exercises}
      onGetRoutines={handleGetRoutines}
      onCreateRoutine={handleCreateRoutine}
      onGetExercises={handleGetExercises}
      onGetRoutineWithExercises={handleGetRoutineWithExercises}
    />
  );
}

export default async function RoutinesPage() {
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Routines</h2>
      </div>
      <Suspense fallback={<div>Loading routines...</div>}>
        <RoutinesWrapper userId={session.user.id} />
      </Suspense>
    </div>
  );
}
