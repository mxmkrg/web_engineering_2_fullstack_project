"use client";

import { useState } from "react";
import { seedExercises } from "@/actions/seed-exercises";
import { seedWorkouts } from "@/actions/seed-workouts";
import { clearWorkouts } from "@/actions/clear-workouts";

export default function DebugPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeedingWorkouts, setIsSeedingWorkouts] = useState(false);
  const [isClearingWorkouts, setIsClearingWorkouts] = useState(false);
  const [message, setMessage] = useState("");
  const [workoutMessage, setWorkoutMessage] = useState("");
  const [clearMessage, setClearMessage] = useState("");

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
    setIsSeedingWorkouts(true);
    setWorkoutMessage("");

    try {
      const result = await seedWorkouts();
      setWorkoutMessage(
        result.success
          ? result.message!
          : result.error || "Failed to seed workouts",
      );
    } catch (error) {
      setWorkoutMessage("Error: " + (error as Error).message);
    } finally {
      setIsSeedingWorkouts(false);
    }
  };

  const handleClearWorkouts = async () => {
    setIsClearingWorkouts(true);
    setClearMessage("");

    try {
      const result = await clearWorkouts();
      setClearMessage(
        result.success
          ? result.message!
          : result.error || "Failed to clear workouts",
      );
    } catch (error) {
      setClearMessage("Error: " + (error as Error).message);
    } finally {
      setIsClearingWorkouts(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Debug Panel</h1>

      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-2">Seed Exercise Database</h3>
          <p className="text-gray-600 text-sm mb-4">
            This will populate the database with a comprehensive exercise
            library (66 exercises total):
            <br />• Chest (8), Back (10), Legs (10), Shoulders (8) - major
            muscle groups
            <br />• Arms (6), Core (5), Cardio (6), Functional (3) - supporting
            exercises
            <br />
            Each exercise includes detailed instructions and muscle group
            targeting.
          </p>

          <button
            onClick={handleSeedExercises}
            disabled={isSeeding}
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSeeding ? "Seeding..." : "Seed Exercise Library"}
          </button>

          {message && (
            <div
              className={`mt-3 p-3 rounded ${
                message.includes("Error") || message.includes("Failed")
                  ? "bg-red-50 text-red-600"
                  : "bg-green-50 text-green-600"
              }`}
            >
              {message}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-medium mb-2">Seed Progressive Workout Journey</h3>
          <p className="text-gray-600 text-sm mb-4">
            This creates a complete 3-month beginner gym journey (36 workouts
            total):
            <br />• <strong>Weeks 1-4:</strong> Full body workouts building
            foundation strength
            <br />• <strong>Weeks 5-8:</strong> Upper/lower split for increased
            training volume
            <br />• <strong>Weeks 9-12:</strong> Push/pull/legs split for muscle
            specialization
            <br />• Realistic progressive overload with varying muscle group
            development
            <br />• Perfect for testing progression statistics and filtering
            features
          </p>

          <button
            onClick={handleSeedWorkouts}
            disabled={isSeedingWorkouts}
            type="button"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSeedingWorkouts
              ? "Creating Journey..."
              : "Seed 3-Month Workout Journey"}
          </button>

          {workoutMessage && (
            <div
              className={`mt-3 p-3 rounded ${
                workoutMessage.includes("Error") ||
                workoutMessage.includes("Failed")
                  ? "bg-red-50 text-red-600"
                  : "bg-green-50 text-green-600"
              }`}
            >
              {workoutMessage}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-medium mb-2">Clear All Workouts</h3>
          <p className="text-gray-600 text-sm mb-4">
            This will permanently delete all workouts, exercises, and sets for
            the current user.
            <span className="text-red-600 font-medium">
              {" "}
              This action cannot be undone!
            </span>
          </p>

          <button
            onClick={handleClearWorkouts}
            disabled={isClearingWorkouts}
            type="button"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClearingWorkouts ? "Clearing..." : "Clear All Workouts"}
          </button>

          {clearMessage && (
            <div
              className={`mt-3 p-3 rounded ${
                clearMessage.includes("Error") ||
                clearMessage.includes("Failed")
                  ? "bg-red-50 text-red-600"
                  : "bg-green-50 text-green-600"
              }`}
            >
              {clearMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
