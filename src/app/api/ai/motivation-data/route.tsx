import { db } from "@/db";
import { workout, workoutSet, workoutExercise, exercise } from "@/db/schema";
import { desc, and, eq } from "drizzle-orm";

export async function GET() {
    try {
        // Get last completed workout
        const lastWorkout = await db
            .select()
            .from(workout)
            .where(and(eq(workout.status, "completed")))
            .orderBy(desc(workout.date))
            .limit(1);

        if (lastWorkout.length === 0) {
            return Response.json({
                summary: "No workouts yet",
                lastWorkout: null,
                streak: 0,
            });
        }

        const wk = lastWorkout[0];

        // Get exercises from last workout
        const exercises = await db
            .select()
            .from(workoutExercise)
            .where(eq(workoutExercise.workoutId, wk.id))
            .leftJoin(exercise, eq(workoutExercise.exerciseId, exercise.id));

        // Get completed sets count
        const completedSets = await db
            .select()
            .from(workoutSet)
            .where(and(
                eq(workoutSet.workoutExerciseId, workoutExercise.id),
                eq(workoutSet.completed, true)
            ));

        return Response.json({
            summary: `Last workout: ${wk.name} on ${new Date(wk.date).toLocaleDateString()}`,
            lastWorkout: {
                id: wk.id,
                name: wk.name,
                date: new Date(wk.date).toLocaleDateString(),
                duration: wk.duration,
                exerciseCount: exercises.length,
                completionStatus: "completed",
            },
            streak: await calculateStreak(wk.userId),
            motivation: {
                isConsistent: true,
                lastTrainingDaysAgo: Math.floor(
                    (Date.now() - new Date(wk.date).getTime()) / (1000 * 60 * 60 * 24)
                ),
            },
        });
    } catch (err) {
        console.error("Error:", err);
        return Response.json({ error: "Failed to fetch motivation data" }, { status: 500 });
    }
}
// Helper function
async function calculateStreak(userId: string): Promise<number> {
    const workouts = await db
        .select()
        .from(workout)
        .where(eq(workout.userId, userId))
        .orderBy(desc(workout.date))
        .limit(10);

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const w of workouts) {
        const wDate = new Date(w.date);
        wDate.setHours(0, 0, 0, 0);

        if (wDate.getTime() === today.getTime() - streak * 24 * 60 * 60 * 1000) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}


