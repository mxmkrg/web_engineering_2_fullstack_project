"use client";

import { useRouter } from "next/navigation";
import { Activity } from "lucide-react";

export function QuickStartButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/dashboard/workouts")}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
    >
      <Activity className="size-5" />
      Start Your Workout
    </button>
  );
}
