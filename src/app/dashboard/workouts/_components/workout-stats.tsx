"use client";

import { Activity, Calendar, Target, TrendingUp } from "lucide-react";

interface WorkoutStatsProps {
  userId: string;
  onFilterChange?: (filter: string) => void;
  activeFilter?: string;
  workoutData?: any;
}

export function WorkoutStats({
  userId,
  workoutData,
  onFilterChange,
  activeFilter,
}: WorkoutStatsProps) {
  const stats = [
    {
      title: "Total Workouts",
      value: workoutData?.total || 0,
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      filter: "all",
    },
    {
      title: "This Month",
      value: workoutData?.thisMonth || 0,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      filter: "month",
    },
    {
      title: "This Week",
      value: workoutData?.thisWeek || 0,
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      filter: "week",
    },
    {
      title: "Avg Duration",
      value: `${workoutData?.avgDuration || 0}m`,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      filter: "duration",
    },
  ];

  return (
    <>
      {stats.map((stat) => (
        <div
          key={stat.title}
          className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${
            activeFilter === stat.filter
              ? "ring-2 ring-blue-500 bg-blue-50"
              : "hover:bg-gray-50"
          }`}
          onClick={() => onFilterChange?.(stat.filter)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`size-4 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
