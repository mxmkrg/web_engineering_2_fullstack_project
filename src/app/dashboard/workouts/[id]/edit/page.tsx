import { db } from "@/db"
import { workout, workoutExercise, workoutSet, exercise } from "@/db/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { WorkoutEditForm } from "./_components/workout-edit-form"

interface PageProps {
  params: {
    id: string
  }
}

export default async function WorkoutEditPage({ params }: PageProps) {
  const workoutId = parseInt(params.id)

  if (isNaN(workoutId)) {
    notFound()
  }

  // Fetch workout with exercises and sets
  const [workoutData] = await db
    .select()
    .from(workout)
    .where(eq(workout.id, workoutId))
    .limit(1)

  if (!workoutData) {
    notFound()
  }

  // Fetch workout exercises with sets
  const workoutExercises = await db
    .select({
      id: workoutExercise.id,
      exerciseId: workoutExercise.exerciseId,
      exerciseName: exercise.name,
      order: workoutExercise.order,
    })
    .from(workoutExercise)
    .leftJoin(exercise, eq(workoutExercise.exerciseId, exercise.id))
    .where(eq(workoutExercise.workoutId, workoutId))
    .orderBy(workoutExercise.order)

  // Fetch sets for each exercise
  const exercisesWithSets = await Promise.all(
    workoutExercises.map(async (ex) => {
      const sets = await db
        .select()
        .from(workoutSet)
        .where(eq(workoutSet.workoutExerciseId, ex.id))
        .orderBy(workoutSet.setNumber)

      return {
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName || "",
        order: ex.order,
        sets: sets.map(set => ({
          setNumber: set.setNumber,
          reps: set.reps,
          weight: set.weight,
          completed: set.completed,
        })),
      }
    })
  )

  return (
    <div className="min-h-screen bg-background">
      <WorkoutEditForm
        workoutId={workoutId}
        initialData={{
          name: workoutData.name,
          notes: workoutData.notes,
          exercises: exercisesWithSets,
        }}
      />
    </div>
  )
}

