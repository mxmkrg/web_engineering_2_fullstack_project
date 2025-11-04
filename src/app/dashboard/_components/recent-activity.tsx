"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle, Activity } from "lucide-react";

interface Workout {
  id: number;
  name: string;
  date: Date;
  duration: number | null;
  status: string;
}

export function RecentActivity() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load workouts from API
  useEffect(() => {
    loadRecentWorkouts();
  }, []);

  const loadRecentWorkouts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/workouts?limit=3'); // Only get last 3 workouts
      const result = await response.json();

      if (result.success) {
        setWorkouts(result.workouts || []);
      } else {
        console.error(result.error || "Failed to load workouts");
      }
    } catch (error) {
      console.error("Error loading workouts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3 animate-pulse">
            <div className="h-8 w-8 bg-muted rounded"></div>
            <div className="space-y-1 flex-1">
              <div className="h-3 bg-muted rounded w-24"></div>
              <div className="h-2 bg-muted rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!workouts || workouts.length === 0) {
    return (
      <div className="text-center py-6">
        <Activity className="size-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          No workouts yet. Create your first workout to see your activity here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {workouts.map((workout) => (
        <div
          key={workout.id}
          className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className={`p-1.5 rounded ${workout.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'}`}>
              {workout.status === 'completed' ? (
                <CheckCircle className="size-3 text-green-600" />
              ) : (
                <Calendar className="size-3 text-blue-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{workout.name}</p>
              <p className="text-xs text-gray-500">
                {new Date(workout.date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="size-3 mr-1" />
            {workout.duration || 0}m
          </div>
        </div>
      ))}
      {workouts.length === 3 && (
        <div className="text-center pt-2">
          <a 
            href="/dashboard/workouts" 
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            View all workouts →
          </a>
        </div>
      )}
    </div>
  );
}
