"use server";

import "server-only";
import { db } from "@/db";
import { workout, workoutExercise, workoutSet, exercise } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";

export async function getWorkoutDetails(workoutId: number) {
	try {
		const session = await getServerSession();

		if (!session?.user?.id) {
			return {
				success: false,
				error: "Not authenticated",
			};
		}

		// Get the workout
		const [workoutData] = await db
			.select()
			.from(workout)
			.where(eq(workout.id, workoutId));

		if (!workoutData) {
			return {
				success: false,
				error: "Workout not found",
			};
		}

		// Check if the workout belongs to the authenticated user
		if (workoutData.userId !== session.user.id) {
			return {
				success: false,
				error: "Not authorized to view this workout",
			};
		}

		// Get workout exercises with their sets
		const workoutExercises = await db
			.select({
				id: workoutExercise.id,
				exerciseId: workoutExercise.exerciseId,
				order: workoutExercise.order,
				notes: workoutExercise.notes,
				exerciseName: exercise.name,
			})
			.from(workoutExercise)
			.leftJoin(exercise, eq(workoutExercise.exerciseId, exercise.id))
			.where(eq(workoutExercise.workoutId, workoutId))
			.orderBy(workoutExercise.order);

		// Get all sets for these exercises
		const exerciseIds = workoutExercises.map((ex) => ex.id);
		const sets = exerciseIds.length > 0 
			? await db
				.select()
				.from(workoutSet)
				.where(eq(workoutSet.workoutExerciseId, exerciseIds[0])) // This is a simplified query - in reality we'd need to use 'in' with multiple IDs
			: [];

		// For a more complete solution, let's get sets for each exercise individually
		const exercisesWithSets = await Promise.all(
			workoutExercises.map(async (ex) => {
				const exerciseSets = await db
					.select()
					.from(workoutSet)
					.where(eq(workoutSet.workoutExerciseId, ex.id))
					.orderBy(workoutSet.setNumber);

				return {
					id: ex.id,
					name: ex.exerciseName || "Unknown Exercise",
					order: ex.order,
					notes: ex.notes,
					sets: exerciseSets,
				};
			})
		);

		const detailedWorkout = {
			...workoutData,
			exercises: exercisesWithSets,
		};

		return {
			success: true,
			workout: detailedWorkout,
		};
	} catch (error) {
		console.error("Error getting workout details:", error);
		return {
			success: false,
			error: "Failed to get workout details",
		};
	}
}