import { Activity, Calendar, Target, TrendingUp } from "lucide-react";
import { getWorkoutStatistics } from "@/lib/workout-stats";

interface WorkoutStatsProps {
  userId: string;
}

export async function WorkoutStats({ userId }: WorkoutStatsProps) {
  const workoutData = await getWorkoutStatistics(userId);

  const stats = [
    {
      title: "Total Workouts",
      value: workoutData.total,
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "This Month",
      value: workoutData.thisMonth,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "This Week",
      value: workoutData.thisWeek,
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Avg Duration",
      value: `${workoutData.avgDuration}m`,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <>
      {stats.map((stat) => (
        <div key={stat.title} className="bg-white rounded-lg shadow p-6">
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
