import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-server"
import { db } from "@/db"
import { workout, workoutExercise, workoutSet } from "@/db/schema"
import { eq } from "drizzle-orm"

interface WorkoutSetData {
  setNumber: number
  reps: number | null
  weight: number | null
  completed: boolean
}

interface WorkoutExerciseData {
  exerciseId: number
  sets: WorkoutSetData[]
  order: number
}

interface UpdateWorkoutData {
  name?: string
  notes?: string
  exercises?: WorkoutExerciseData[]
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      )
    }

    const { id } = await params
    const workoutId = parseInt(id)

    if (isNaN(workoutId)) {
      return NextResponse.json(
        { success: false, error: "Invalid workout ID" },
        { status: 400 }
      )
    }

    const body: UpdateWorkoutData = await request.json()

    // Start transaction
    await db.transaction(async (tx) => {
      // Update workout name and/or notes if provided
      const updateData: any = { updatedAt: new Date() }
      if (body.name !== undefined) {
        updateData.name = body.name
      }
      if (body.notes !== undefined) {
        updateData.notes = body.notes
      }

      if (Object.keys(updateData).length > 1) { // More than just updatedAt
        await tx
          .update(workout)
          .set(updateData)
          .where(eq(workout.id, workoutId))
      }

      // If exercises are provided, update them
      if (body.exercises) {
        // Delete existing exercises and sets (cascade will handle sets)
        await tx
          .delete(workoutExercise)
          .where(eq(workoutExercise.workoutId, workoutId))

        // Insert new exercises and sets
        for (const exercise of body.exercises) {
          const [workoutExerciseRecord] = await tx
            .insert(workoutExercise)
            .values({
              workoutId: workoutId,
              exerciseId: exercise.exerciseId,
              order: exercise.order,
            })
            .returning()

          // Insert sets for this exercise
          for (const set of exercise.sets) {
            await tx.insert(workoutSet).values({
              workoutExerciseId: workoutExerciseRecord.id,
              setNumber: set.setNumber,
              reps: set.reps,
              weight: set.weight,
              completed: set.completed,
            })
          }
        }
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: "Workout updated successfully"
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating workout:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update workout" },
      { status: 500 }
    )
  }
}