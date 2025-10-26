"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function NewWorkoutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/dashboard/workouts/new" as any)}
      className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
    >
      <Plus className="size-4" />
      New Workout
    </button>
  );
}
