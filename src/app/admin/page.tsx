"use client";

import { useState } from "react";
import { seedExercises } from "@/actions/seed-exercises";

export default function AdminPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [message, setMessage] = useState("");

  const handleSeedExercises = async () => {
    setIsSeeding(true);
    setMessage("");
    
    try {
      const result = await seedExercises();
      setMessage(result.success ? result.message! : result.error || "Failed to seed");
    } catch (error) {
      setMessage("Error: " + (error as Error).message);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Database Setup</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Seed Exercise Database</h3>
            <p className="text-gray-600 text-sm mb-4">
              This will populate the database with sample exercises (chest, back, legs, shoulders, arms, cardio).
            </p>
            
            <button
              onClick={handleSeedExercises}
              disabled={isSeeding}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSeeding ? "Seeding..." : "Seed Exercises"}
            </button>
            
            {message && (
              <div className={`mt-3 p-3 rounded ${
                message.includes("Error") || message.includes("Failed") 
                  ? "bg-red-50 text-red-600" 
                  : "bg-green-50 text-green-600"
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}