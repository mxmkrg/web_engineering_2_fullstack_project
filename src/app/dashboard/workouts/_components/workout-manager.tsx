"use client";

import { useState, useEffect } from "react";
import { WorkoutStats } from "./workout-stats";
import { WorkoutList } from "./workout-list";
import { WorkoutCalendar } from "@/components/workout-calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Calendar, List } from "lucide-react";
import { useRouter } from "next/navigation";

interface WorkoutManagerProps {
  userId: string;
}

const filterLabels = {
  all: "All Workouts",
  week: "This Week",
  month: "This Month",
  duration: "By Duration",
};

export function WorkoutManager({ userId }: WorkoutManagerProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [workoutData, setWorkoutData] = useState<any>(null);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"list" | "calendar">("list");
  const router = useRouter();

  useEffect(() => {
    loadWorkoutStats();
    loadWorkouts();
  }, [userId]);

  const loadWorkoutStats = async () => {
    try {
      // Fetch from the API instead of direct function call
      const response = await fetch("/api/workout-stats");
      const stats = await response.json();
      setWorkoutData(stats);
    } catch (error) {
      console.error("Error loading workout stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWorkouts = async () => {
    try {
      const response = await fetch("/api/workouts?limit=100"); // Increase limit for calendar view
      if (response.ok) {
        const data = await response.json();
        // Handle both response formats for backward compatibility
        const workoutsData = data.workouts || data;
        setWorkouts(Array.isArray(workoutsData) ? workoutsData : []);
      } else {
        console.error("Failed to fetch workouts:", response.statusText);
        setWorkouts([]);
      }
    } catch (error) {
      console.error("Error loading workouts:", error);
      setWorkouts([]);
    }
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const clearFilter = () => {
    setActiveFilter("all");
  };

  const handleWorkoutSelect = (workout: any) => {
    router.push(`/dashboard/workouts/${workout.id}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stats Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>

        {/* List Skeleton */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 rounded animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Toggle and Stats Grid */}
      <div className="space-y-4">
        {/* View Toggle Buttons */}
        <div className="flex items-center justify-end">
          <div className="flex items-center space-x-2">
            <Button
              variant={view === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("list")}
            >
              <List className="size-4 mr-2" />
              List
            </Button>
            <Button
              variant={view === "calendar" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("calendar")}
            >
              <Calendar className="size-4 mr-2" />
              Calendar
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <WorkoutStats
            userId={userId}
            workoutData={workoutData}
            onFilterChange={handleFilterChange}
            activeFilter={activeFilter}
          />
        </div>
      </div>

      {/* Calendar or List View */}
      {view === "calendar" ? (
        <WorkoutCalendar
          workouts={Array.isArray(workouts) ? workouts : []}
          onWorkoutSelect={handleWorkoutSelect}
          onViewChange={setView}
          currentView={view}
        />
      ) : (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">
                Recent Workouts
              </h3>
              <div className="flex items-center gap-2">
                {activeFilter !== "all" && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {filterLabels[activeFilter as keyof typeof filterLabels]}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilter}
                      className="h-4 w-4 p-0 hover:bg-transparent"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="p-6 pt-0">
            <WorkoutList filter={activeFilter} />
          </div>
        </div>
      )}
    </div>
  );
}
