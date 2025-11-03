import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { workout } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all workouts for the user
    const allWorkouts = await db
      .select({
        id: workout.id,
        name: workout.name,
        date: workout.date,
        duration: workout.duration,
        status: workout.status,
        createdAt: workout.createdAt
      })
      .from(workout)
      .where(eq(workout.userId, session.user.id))
      .orderBy(desc(workout.createdAt));

    // Separate pending and completed workouts
    const pendingWorkouts = allWorkouts.filter(w => w.status !== 'completed');
    const completedWorkouts = allWorkouts.filter(w => w.status === 'completed');
    const lastCompletedWorkout = completedWorkouts[0] || null;

    // Case 1: No workouts at all
    if (allWorkouts.length === 0) {
      return NextResponse.json({
        summary: "No workouts yet",
        workoutStatus: "empty",
        message: "Start with a new workout ! Get moving and begin your fitness journey today",
        pendingWorkouts: [],
        completedWorkouts: [],
        lastCompletedWorkout: null,
        pendingCount: 0
      });
    }

    // Case 2: Has pending workouts
    if (pendingWorkouts.length > 0) {
      const nextPending = pendingWorkouts[0];
      return NextResponse.json({
        summary: `You have ${pendingWorkouts.length} pending workout(s)`,
        workoutStatus: "pending",
        message: `Let's go! You have a planned workout: ${nextPending.name}`,
        nextPendingWorkout: {
          id: nextPending.id,
          name: nextPending.name,
          date: nextPending.date
        },
        pendingWorkouts: pendingWorkouts.map(w => ({
          id: w.id,
          name: w.name,
          date: w.date,
          status: w.status
        })),
        completedCount: completedWorkouts.length,
        pendingCount: pendingWorkouts.length,
        lastCompletedWorkout: lastCompletedWorkout ? {
          name: lastCompletedWorkout.name,
          date: lastCompletedWorkout.date
        } : null
      });
    }

    // Case 3: All workouts completed, suggest new one
    return NextResponse.json({
      summary: `All ${completedWorkouts.length} workouts completed`,
      workoutStatus: "completed",
      message: "Well done ! Start a new workout",
      completedCount: completedWorkouts.length,
      completedWorkouts: completedWorkouts.slice(0, 3).map(w => ({
        name: w.name,
        date: w.date
      })),
      lastCompletedWorkout: lastCompletedWorkout ? {
        name: lastCompletedWorkout.name,
        date: lastCompletedWorkout.date
      } : null
    });

  } catch (error) {
    console.error('Error fetching motivation data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch motivation data' },
      { status: 500 }
    );
  }
}
