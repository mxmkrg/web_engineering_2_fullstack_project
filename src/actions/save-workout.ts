"use server"

import { db } from "@/db"
import { workout, workoutExercise, workoutSet, exercise } from "@/db/schema"
import { getServerSession } from "@/lib/auth-server"
import { eq } from "drizzle-orm"

interface ExerciseData {
    name: string
    reps: number
    weight?: number
}

interface SaveWorkoutData {
    workoutTitle: string
    workoutNotes: string | null
    exercises: ExerciseData[]
}

export async function saveWorkout(data: SaveWorkoutData) {
    try {
        // Get authenticated user
        const session = await getServerSession()

        if (!session?.user?.id) {
            return {
                success: false,
                error: "Not authenticated"
            }
        }

        const userId = session.user.id

        // Validate input
        if (!data.workoutTitle || data.workoutTitle.trim() === "") {
            return {
                success: false,
                error: "Workout title is required"
            }
        }

        if (!data.exercises || data.exercises.length === 0) {
            return {
                success: false,
                error: "At least one exercise is required"
            }
        }

        // Start transaction-like operations
        // 1. Create the workout
        const [newWorkout] = await db.insert(workout).values({
            userId: userId,
            name: data.workoutTitle,
            status: "active",
            date: new Date(),
            duration: null,
            notes: data.workoutNotes,
        }).returning()

        // 2. For each exercise, create workoutExercise and workoutSet entries
        for (let i = 0; i < data.exercises.length; i++) {
            const exerciseData = data.exercises[i]

            // Find the exercise by name
            const [existingExercise] = await db
                .select()
                .from(exercise)
                .where(eq(exercise.name, exerciseData.name))
                .limit(1)

            if (!existingExercise) {
                console.warn(`Exercise "${exerciseData.name}" not found in database`)
                continue
            }

            // Create workoutExercise entry
            const [newWorkoutExercise] = await db.insert(workoutExercise).values({
                workoutId: newWorkout.id,
                exerciseId: existingExercise.id,
                order: i,
                notes: null,
            }).returning()

            // Create workoutSet entry (one set per exercise for now)
            await db.insert(workoutSet).values({
                workoutExerciseId: newWorkoutExercise.id,
                setNumber: 1,
                reps: exerciseData.reps,
                weight: exerciseData.weight || null,
                completed: false,
                notes: null,
            })
        }

        return {
            success: true,
            workoutId: newWorkout.id,
            message: "Workout saved successfully"
        }

    } catch (error) {
        console.error("Error saving workout:", error)
        return {
            success: false,
            error: "Failed to save workout"
        }
    }
}

