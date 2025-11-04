"use client";

import { useState } from "react";
import { seedExercises } from "@/actions/seed-exercises";
import { seedWorkoutData } from "@/actions/seed-workout-data";
import { updateWorkoutsToCompleted } from "@/actions/update-workouts-completed";

export default function AdminPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [message, setMessage] = useState("");

  const handleSeedExercises = async () => {
    setIsSeeding(true);
    setMessage("");

    try {
      const result = await seedExercises();
      setMessage(
        result.success ? result.message! : result.error || "Failed to seed",
      );
    } catch (error) {
      setMessage("Error: " + (error as Error).message);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSeedWorkouts = async () => {
    setIsSeeding(true);
    setMessage("");

    try {
      const result = await seedWorkoutData();
      setMessage(
        result.success
          ? result.message!
          : result.error || "Failed to seed workouts",
      );
    } catch (error) {
      setMessage("Error: " + (error as Error).message);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleUpdateWorkouts = async () => {
    setIsSeeding(true);
    setMessage("");

    try {
      const result = await updateWorkoutsToCompleted();
      setMessage(
        result.success
          ? result.message!
          : result.error || "Failed to update workouts",
      );
    } catch (error) {
      setMessage("Error: " + (error as Error).message);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-medium mb-2">Seed Exercise Database</h3>
          <p className="text-gray-600 text-sm mb-4">
            This will populate the database with sample exercises (chest, back,
            legs, shoulders, arms, cardio).
          </p>

          <button
            onClick={handleSeedExercises}
            disabled={isSeeding}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSeeding ? "Seeding..." : "Seed Exercises"}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-medium mb-2">Seed Sample Workouts</h3>
          <p className="text-gray-600 text-sm mb-4">
            Add realistic workout data with exercises and sets for progression
            testing.
          </p>

          <button
            onClick={handleSeedWorkouts}
            disabled={isSeeding}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSeeding ? "Seeding..." : "Seed Workouts"}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-medium mb-2">Mark Workouts Completed</h3>
          <p className="text-gray-600 text-sm mb-4">
            Update all existing workouts to be marked as "completed" for
            progression tracking.
          </p>

          <button
            onClick={handleUpdateWorkouts}
            disabled={isSeeding}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSeeding ? "Updating..." : "Update Workouts"}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`mt-6 p-4 rounded-lg ${
            message.includes("Error") || message.includes("Failed")
              ? "bg-red-50 text-red-600 border border-red-200"
              : "bg-green-50 text-green-600 border border-green-200"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
