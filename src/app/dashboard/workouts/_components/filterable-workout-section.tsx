"use client";

import { useState, useEffect } from "react";
import { Activity, Calendar, Target, TrendingUp, Clock, BarChart3, Hash } from "lucide-react";
import { WorkoutList } from "./workout-list";
import {
  getFilteredWorkouts,
  type WorkoutFilterType,
} from "@/actions/get-filtered-workouts";
import { cn } from "@/lib/utils";

interface FilterableWorkoutSectionProps {
  userId: string;
  initialStats: {
    total: number;
    thisMonth: number;
    thisWeek: number;
    avgDuration: number;
  };
  initialWorkouts: any[];
}

type FilterOption = {
  key: WorkoutFilterType;
  title: string;
  value: number;
  icon: any;
  color: string;
  bgColor: string;
};

type StatisticTile = {
  title: string;
  value: string;
  icon: any;
  color: string;
  bgColor: string;
};

export function FilterableWorkoutSection({
  userId,
  initialStats,
  initialWorkouts,
}: FilterableWorkoutSectionProps) {
  const [activeFilter, setActiveFilter] = useState<WorkoutFilterType>("total");
  const [workouts, setWorkouts] = useState(initialWorkouts);
  const [currentAvgDuration, setCurrentAvgDuration] = useState(
    initialStats.avgDuration,
  );
  const [currentTotalDuration, setCurrentTotalDuration] = useState(0);
  const [currentAvgSets, setCurrentAvgSets] = useState(0);
  const [currentTotalSets, setCurrentTotalSets] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize statistics when component mounts
  useEffect(() => {
    const initializeStats = async () => {
      try {
        const result = await getFilteredWorkouts(userId, {
          filter: "total",
          limit: 50,
        });
        setCurrentTotalDuration(result.totalDuration);
        setCurrentAvgSets(result.avgSets);
        setCurrentTotalSets(result.totalSets);
      } catch (error) {
        console.error("Error initializing statistics:", error);
      }
    };

    initializeStats();
  }, [userId]);

  // Reset to initial stats when returning to "total" filter
  useEffect(() => {
    if (activeFilter === "total") {
      setWorkouts(initialWorkouts);
      setCurrentAvgDuration(initialStats.avgDuration);
      // Reinitialize other stats
      const initializeStats = async () => {
        try {
          const result = await getFilteredWorkouts(userId, {
            filter: "total",
            limit: 50,
          });
          setCurrentTotalDuration(result.totalDuration);
          setCurrentAvgSets(result.avgSets);
          setCurrentTotalSets(result.totalSets);
        } catch (error) {
          console.error("Error reinitializing statistics:", error);
        }
      };
      initializeStats();
    }
  }, [activeFilter, initialWorkouts, initialStats.avgDuration, userId]);

  const filterOptions: FilterOption[] = [
    {
      key: "total",
      title: "Total Workouts",
      value: initialStats.total,
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      key: "thisMonth",
      title: "This Month",
      value: initialStats.thisMonth,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      key: "thisWeek",
      title: "This Week",
      value: initialStats.thisWeek,
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const statisticTiles: StatisticTile[] = [
    {
      title: "Avg Duration",
      value: `${currentAvgDuration}m`,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Total Duration",
      value: `${currentTotalDuration}m`,
      icon: Clock,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Avg Sets",
      value: currentAvgSets.toString(),
      icon: BarChart3,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Total Sets",
      value: currentTotalSets.toString(),
      icon: Hash,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
  ];

  const handleFilterClick = async (filter: WorkoutFilterType) => {
    if (filter === activeFilter) return;

    setActiveFilter(filter);
    setIsLoading(true);

    try {
      const result = await getFilteredWorkouts(userId, {
        filter: filter,
        limit: 50,
      });
      setWorkouts(result.workouts);
      setCurrentAvgDuration(result.avgDuration);
      setCurrentTotalDuration(result.totalDuration);
      setCurrentAvgSets(result.avgSets);
      setCurrentTotalSets(result.totalSets);
    } catch (error) {
      console.error("Error filtering workouts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Filter Section */}
      <div className="grid gap-4 md:grid-cols-3">
        {filterOptions.map((stat) => (
          <div
            key={stat.key}
            className={cn(
              "bg-white rounded-lg shadow p-6 cursor-pointer transition-all duration-200 hover:shadow-md transform hover:scale-[1.02]",
              activeFilter === stat.key &&
                "ring-2 ring-blue-500 ring-opacity-50 shadow-lg",
            )}
            onClick={() => handleFilterClick(stat.key)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                {activeFilter === stat.key && (
                  <p className="text-xs text-blue-600 font-medium mt-1">
                    Active Filter
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`size-4 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Statistics Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Workout Statistics
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statisticTiles.map((stat, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`size-4 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workouts List Section */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">
              Saved Workouts
            </h3>
            <div className="text-sm text-muted-foreground">
              {activeFilter === "total" && "All workouts"}
              {activeFilter === "thisWeek" && "This week"}
              {activeFilter === "thisMonth" && "This month"}
              {isLoading && " (Loading...)"}
            </div>
          </div>
        </div>
        <div className="p-6 pt-0">
          {isLoading ? (
            <WorkoutListSkeleton />
          ) : (
            <WorkoutList
              userId={userId}
              initialWorkouts={workouts}
              activeFilter="all" // Always "all" since server-side filtering is handled here
            />
          )}
        </div>
      </div>
    </>
  );
}

function WorkoutListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 animate-pulse">
          <div className="h-12 w-12 bg-muted rounded-lg"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded w-32"></div>
            <div className="h-3 bg-muted rounded w-24"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
