import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { exercise, workout, workoutExercise, workoutSet } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all available exercises from database
    const allExercises = await db
      .select({
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
        muscleGroups: exercise.muscleGroups,
        equipment: exercise.equipment,
        description: exercise.description,
        instructions: exercise.instructions,
      })
      .from(exercise)
      .orderBy(desc(exercise.createdAt));

    // Get user's recent workouts (last 10)
    const userWorkouts = await db
      .select({
        id: workout.id,
        name: workout.name,
        date: workout.date,
        status: workout.status,
        duration: workout.duration,
        userId: workout.userId,
      })
      .from(workout)
      .where(eq(workout.userId, session.user.id))
      .orderBy(desc(workout.date))
      .limit(10);

    // Get exercises used in user's recent workouts with sets data
    let usedExercises: any[] = [];
    if (userWorkouts.length > 0) {
      usedExercises = await db
        .select({
          exerciseId: workoutExercise.exerciseId,
          exerciseName: exercise.name,
          category: exercise.category,
          muscleGroups: exercise.muscleGroups,
          equipment: exercise.equipment,
          workoutName: workout.name,
          workoutDate: workout.date,
          reps: workoutSet.reps,
          weight: workoutSet.weight,
          completed: workoutSet.completed,
        })
        .from(workoutExercise)
        .innerJoin(exercise, eq(workoutExercise.exerciseId, exercise.id))
        .innerJoin(workout, eq(workoutExercise.workoutId, workout.id))
        .leftJoin(
          workoutSet,
          eq(workoutExercise.id, workoutSet.workoutExerciseId),
        )
        .where(eq(workout.userId, session.user.id))
        .orderBy(desc(workout.date));
    }

    // Parse muscle groups for better recommendations
    const exercisesWithParsedGroups = allExercises.map((ex) => {
      try {
        return {
          ...ex,
          muscleGroupsArray: JSON.parse(ex.muscleGroups || "[]"),
        };
      } catch {
        return {
          ...ex,
          muscleGroupsArray: [],
        };
      }
    });

    // Categorize exercises
    const exercisesByCategory = exercisesWithParsedGroups.reduce(
      (acc: any, ex) => {
        if (!acc[ex.category]) {
          acc[ex.category] = [];
        }
        acc[ex.category].push(ex);
        return acc;
      },
      {},
    );

    // Get most used exercises by the user
    const exerciseFrequency: { [key: string]: number } = {};
    usedExercises.forEach((ex) => {
      exerciseFrequency[ex.exerciseName] =
        (exerciseFrequency[ex.exerciseName] || 0) + 1;
    });

    const mostUsedExercises = Object.entries(exerciseFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

    // Get unique muscle groups from user's exercises
    const userMuscleGroups = new Set<string>();
    usedExercises.forEach((ex) => {
      try {
        const groups = JSON.parse(ex.muscleGroups || "[]");
        if (Array.isArray(groups)) {
          groups.forEach((g: any) => {
            if (typeof g === "string") userMuscleGroups.add(g);
            else if (typeof g === "object" && g.name)
              userMuscleGroups.add(g.name);
          });
        }
      } catch {}
    });

    return NextResponse.json({
      summary: `${allExercises.length} exercises available in database. User has ${userWorkouts.length} workouts with ${usedExercises.length} exercise entries.`,
      userId: session.user.id,
      allExercises: exercisesWithParsedGroups,
      exercisesByCategory,
      userWorkouts,
      usedExercisesInRecent: usedExercises,
      mostUsedExercises,
      userMuscleGroups: Array.from(userMuscleGroups),
      totalExercises: allExercises.length,
      totalUserWorkouts: userWorkouts.length,
      categories: Object.keys(exercisesByCategory),
    });
  } catch (error) {
    console.error("Error fetching exercise suggestions data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch exercise suggestions data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
