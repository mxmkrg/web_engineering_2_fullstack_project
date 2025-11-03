import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { workout, workoutExercise, exercise, workoutSet } from "@/db/schema";
import { eq, desc, gte, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get workouts from last 7 days for this user
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyWorkouts = await db
      .select({
        id: workout.id,
        name: workout.name,
        date: workout.date,
        duration: workout.duration,
        status: workout.status,
        userId: workout.userId,
        createdAt: workout.createdAt,
      })
      .from(workout)
      .where(
        and(
          eq(workout.userId, session.user.id),
          gte(workout.date, oneWeekAgo)
        )
      )
      .orderBy(desc(workout.date));

    // Get exercises for weekly workouts with set data
    let weeklyExercises: any[] = [];
    if (weeklyWorkouts.length > 0) {
      weeklyExercises = await db
        .select({
          exerciseId: workoutExercise.exerciseId,
          exerciseName: exercise.name,
          category: exercise.category,
          muscleGroups: exercise.muscleGroups,
          reps: workoutSet.reps,
          weight: workoutSet.weight,
          completed: workoutSet.completed,
          workoutName: workout.name,
          workoutDate: workout.date,
          workoutStatus: workout.status,
        })
        .from(workoutExercise)
        .innerJoin(exercise, eq(workoutExercise.exerciseId, exercise.id))
        .innerJoin(workout, eq(workoutExercise.workoutId, workout.id))
        .leftJoin(workoutSet, eq(workoutExercise.id, workoutSet.workoutExerciseId))
        .where(eq(workout.userId, session.user.id))
        .orderBy(desc(workout.date));
    }

    // Calculate statistics
    const completedWorkouts = weeklyWorkouts.filter(w => w.status === 'completed');
    const pendingWorkouts = weeklyWorkouts.filter(w => w.status !== 'completed');
    const totalDuration = completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const avgDuration = completedWorkouts.length > 0 ? Math.round(totalDuration / completedWorkouts.length) : 0;

    // Most trained muscle groups
    const muscleGroupCounts: { [key: string]: number } = {};
    weeklyExercises.forEach(ex => {
      try {
        const groups = JSON.parse(ex.muscleGroups || '[]');
        if (Array.isArray(groups)) {
          groups.forEach((g: any) => {
            const groupName = typeof g === 'string' ? g : (g.name || '');
            if (groupName) {
              muscleGroupCounts[groupName] = (muscleGroupCounts[groupName] || 0) + 1;
            }
          });
        }
      } catch {}
    });

    const topMuscleGroups = Object.entries(muscleGroupCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      summary: `Weekly Progress: ${completedWorkouts.length} completed, ${pendingWorkouts.length} pending`,
      userId: session.user.id,
      weekRange: {
        start: oneWeekAgo.toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
      },
      workoutStats: {
        totalWorkouts: weeklyWorkouts.length,
        completedWorkouts: completedWorkouts.length,
        pendingWorkouts: pendingWorkouts.length,
        totalDuration,
        avgDuration,
      },
      workouts: weeklyWorkouts.map(w => ({
        id: w.id,
        name: w.name,
        date: w.date,
        duration: w.duration,
        status: w.status,
      })),
      exercises: weeklyExercises.map(ex => ({
        exerciseName: ex.exerciseName,
        category: ex.category,
        reps: ex.reps,
        weight: ex.weight,
        completed: ex.completed,
        workoutDate: ex.workoutDate,
      })),
      topMuscleGroups,
      totalExercises: weeklyExercises.length,
    });

  } catch (error) {
    console.error('Error fetching weekly progress data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly progress data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

