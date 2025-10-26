"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { NewWorkoutDialog } from "./new-workout-dialog";

export function NewWorkoutButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsDialogOpen(true)}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="size-4 mr-2" />
        New Workout
      </button>
      
      <NewWorkoutDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
      />
    </>
  );
}