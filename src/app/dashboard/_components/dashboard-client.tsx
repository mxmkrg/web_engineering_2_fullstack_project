"use client";

import { useRouter } from "next/navigation";
import { Activity, LogOut } from "lucide-react";
import { logout } from "@/actions/logout";
import { useActionState } from "react";

interface DashboardClientProps {
  userName: string;
}

export function DashboardClient({ userName }: DashboardClientProps) {
  const router = useRouter();
  const [logoutState, logoutAction] = useActionState(logout, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {userName}!
          </h1>
          <p className="text-gray-600">
            Track your workouts and monitor your fitness progress
          </p>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <LogOut className="size-4 mr-2" />
            Sign Out
          </button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 max-w-2xl">
        <button
          onClick={() => router.push("/dashboard/workouts" as any)}
          className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-blue-500">
              <Activity className="size-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Workouts</h3>
              <p className="text-gray-600">Track your fitness journey</p>
            </div>
          </div>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
        <div className="text-center py-6">
          <Activity className="size-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Welcome to your fitness journey!
          </h3>
          <p className="text-gray-600 mb-6">
            Start by creating your first workout to begin tracking your
            progress.
          </p>
          <button
            onClick={() => router.push("/dashboard/workouts" as any)}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Activity className="size-5 mr-2" />
            Create Your First Workout
          </button>
        </div>
      </div>
    </div>
  );
}
