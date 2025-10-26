import { db } from "@/db";
import { workout } from "@/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import { Activity, Calendar, Target, TrendingUp } from "lucide-react";

interface WorkoutStatsProps {
  userId: string;
}

export async function WorkoutStats({ userId }: WorkoutStatsProps) {
  // Get total workouts
  const totalWorkouts = await db
    .select({ count: count() })
    .from(workout)
    .where(eq(workout.userId, userId));

  // Get workouts this month
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  
  const monthlyWorkouts = await db
    .select({ count: count() })
    .from(workout)
    .where(
      sql`${workout.userId} = ${userId} AND ${workout.date} >= ${thisMonth.getTime()}`
    );

  // Get workouts this week
  const thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay());
  thisWeek.setHours(0, 0, 0, 0);
  
  const weeklyWorkouts = await db
    .select({ count: count() })
    .from(workout)
    .where(
      sql`${workout.userId} = ${userId} AND ${workout.date} >= ${thisWeek.getTime()}`
    );

  // Calculate average duration
  const avgDuration = await db
    .select({ avg: sql<number>`AVG(${workout.duration})` })
    .from(workout)
    .where(eq(workout.userId, userId));

  const stats = [
    {
      title: "Total Workouts",
      value: totalWorkouts[0]?.count || 0,
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "This Month",
      value: monthlyWorkouts[0]?.count || 0,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "This Week",
      value: weeklyWorkouts[0]?.count || 0,
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Avg Duration",
      value: `${Math.round(avgDuration[0]?.avg || 0)}m`,
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