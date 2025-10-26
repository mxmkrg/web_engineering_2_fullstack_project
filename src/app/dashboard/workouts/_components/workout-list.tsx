import { db } from "@/db";
import { workout } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Calendar, Clock } from "lucide-react";

interface WorkoutListProps {
  userId: string;
}

export async function WorkoutList({ userId }: WorkoutListProps) {
  const recentWorkouts = await db
    .select()
    .from(workout)
    .where(eq(workout.userId, userId))
    .orderBy(desc(workout.date))
    .limit(5);

  if (recentWorkouts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No workouts yet. Start your fitness journey!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentWorkouts.map((workoutItem) => (
        <div
          key={workoutItem.id}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Calendar className="size-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{workoutItem.name}</h3>
              <p className="text-sm text-gray-500">
                {new Date(workoutItem.date).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="size-4 mr-1" />
            {workoutItem.duration || 0}m
          </div>
        </div>
      ))}
    </div>
  );
}