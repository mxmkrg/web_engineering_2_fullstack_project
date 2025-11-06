"use client";

import { Plus, Clock3 } from "lucide-react";
import { useRouter } from "next/navigation";

export function NewWorkoutButton() {
  const router = useRouter();

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => router.push("/dashboard/workouts/new?mode=plan" as any)}
        className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
      >
        <Clock3 className="size-4" />
        Plan Workout
      </button>
      <button
        type="button"
        onClick={() => router.push("/dashboard/workouts/new" as any)}
        className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
      >
        <Plus className="size-4" />
        Start Workout
      </button>
    </div>
  );
}
