import { db } from "@/db";
import { workout, workoutSet, workoutExercise, exercise } from "@/db/schema";
import {desc, and, gte, inArray, eq} from "drizzle-orm";


export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const muscleGroup = searchParams.get("muscleGroup");

        // Get user's favorite exercises
        const userExercises = await db
            .select({ exerciseId: workoutExercise.exerciseId })
            .from(workoutExercise)
            .groupBy(workoutExercise.exerciseId)
            .limit(5);

        const userExerciseIds = userExercises.map(ue => ue.exerciseId);

        // Get available exercises
        const allExercises = await db.select().from(exercise).limit(20);

        // Get exercises for target muscle group
        const targetExercises = allExercises.filter(ex => {
            if (!muscleGroup) return true;
            try {
                const groups = JSON.parse(ex.muscleGroups);
                return groups.includes(muscleGroup);
            } catch {
                return false;
            }
        });

        // Get user's favorites
        const favorites = await db
            .select()
            .from(exercise)
            .where(inArray(exercise.id, userExerciseIds));

        return Response.json({
            summary: `Suggestions for ${muscleGroup || "full body"} training`,
            targetMuscleGroup: muscleGroup,
            userFavorites: favorites.map(f => ({
                name: f.name,
                muscleGroups: f.muscleGroups,
                equipment: f.equipment,
            })),
            availableExercises: targetExercises.map(ex => ({
                name: ex.name,
                muscleGroups: ex.muscleGroups,
                equipment: ex.equipment,
                description: ex.description,
                category: ex.category,
            })),
            equipment: ["dumbbell", "barbell", "machine", "bodyweight"],
        });
    } catch (err) {
        console.error("Error:", err);
        return Response.json({ error: "Failed to fetch suggestions" }, { status: 500 });
    }
}

