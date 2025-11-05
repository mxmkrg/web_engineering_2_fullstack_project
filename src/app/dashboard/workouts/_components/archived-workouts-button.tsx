"use client";

import { Archive } from "lucide-react";
import { useRouter } from "next/navigation";

export function ArchivedWorkoutsButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/dashboard/workouts/archived" as any)}
      className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
    >
      <Archive className="size-4" />
      Archived Workouts
    </button>
  );
}
