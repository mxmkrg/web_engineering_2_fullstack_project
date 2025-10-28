import { db } from "@/db";
import { workout, workoutSet, workoutExercise, exercise } from "@/db/schema";
import { desc, and, gte, inArray, eq } from "drizzle-orm";

export async function GET() {
    try {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // Get all workouts this week
        const weekWorkouts = await db
            .select()
            .from(workout)
            .where(gte(workout.date, oneWeekAgo))
            .orderBy(desc(workout.date));

        if (weekWorkouts.length === 0) {
            return Response.json({
                summary: "No workouts this week",
                weekData: null,
            });
        }

        // Analyze muscle groups
        let muscleGroupsTraining = new Map();
        let totalSets = 0;
        let completedSets = 0;

        for (const wk of weekWorkouts) {
            const wkExercises = await db
                .select()
                .from(workoutExercise)
                .where(eq(workoutExercise.workoutId, wk.id))
                .leftJoin(exercise, eq(workoutExercise.exerciseId, exercise.id));

            for (const we of wkExercises) {
                if (we.exercise?.muscleGroups) {
                    const groups = JSON.parse(we.exercise.muscleGroups);
                    groups.forEach((g: string) => {
                        muscleGroupsTraining.set(g, (muscleGroupsTraining.get(g) || 0) + 1);
                    });
                }

                const sets = await db
                    .select()
                    .from(workoutSet)
                    .where(eq(workoutSet.workoutExerciseId, we.workout_exercise.id));

                totalSets += sets.length;
                completedSets += sets.filter(s => s.completed).length;
            }
        }

        return Response.json({
            summary: `${weekWorkouts.length} workouts this week`,
            weeklyStats: {
                workoutDays: weekWorkouts.length,
                totalWorkouts: weekWorkouts.length,
                completionRate: ((completedSets / totalSets) * 100).toFixed(1),
                totalSets,
                completedSets,
            },
            muscleGroups: Object.fromEntries(muscleGroupsTraining),
            workouts: weekWorkouts.map(w => ({
                date: new Date(w.date).toLocaleDateString(),
                name: w.name,
                duration: w.duration,
            })),
        });
    } catch (err) {
        console.error("Error:", err);
        return Response.json({ error: "Failed to fetch progress data" }, { status: 500 });
    }
}
