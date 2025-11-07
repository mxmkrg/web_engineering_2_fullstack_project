"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  Calendar,
  Target,
  TrendingUp,
  Clock,
  BarChart3,
  Hash,
  Archive,
  Clock3,
  Play,
  CheckCircle,
} from "lucide-react";
import { WorkoutList } from "./workout-list";
import {
  getFilteredWorkouts,
  type WorkoutFilterType,
} from "@/actions/get-filtered-workouts";
import {
  getWorkoutsAction,
  refreshWorkoutsAction,
} from "@/actions/workout-client-actions";
import { archiveOldWorkouts } from "@/actions/archive-old-workouts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

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
  const [includeArchived, setIncludeArchived] = useState(false);
  const [includePlannedInStats, setIncludePlannedInStats] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [currentAvgDuration, setCurrentAvgDuration] = useState(
    initialStats.avgDuration,
  );
  const [currentTotalDuration, setCurrentTotalDuration] = useState(0);
  const [currentAvgSets, setCurrentAvgSets] = useState(0);
  const [currentTotalSets, setCurrentTotalSets] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStatusTab, setActiveStatusTab] = useState("saved");

  // Filter workouts by status for tabs and sort appropriately
  const plannedWorkouts = workouts
    .filter((w) => w.status === "planned")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Upcoming first

  const activeWorkouts = workouts
    .filter((w) => w.status === "active")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Most recent first

  const savedWorkouts = workouts
    .filter((w) => w.status === "completed")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Most recent first

  // Initialize statistics when component mounts or when includePlannedInStats changes
  useEffect(() => {
    const initializeStats = async () => {
      try {
        const result = await getFilteredWorkouts(userId, {
          filter: activeFilter,
          limit: 50,
          includePlanned: includePlannedInStats,
          forStatistics: true,
        });
        setCurrentTotalDuration(result.totalDuration);
        setCurrentAvgSets(result.avgSets);
        setCurrentTotalSets(result.totalSets);
        if (activeFilter === "total") {
          setCurrentAvgDuration(result.avgDuration);
        }
      } catch (error) {
        console.error("Error initializing statistics:", error);
      }
    };

    initializeStats();
  }, [userId, includePlannedInStats, activeFilter]);

  // Reset to initial stats when returning to "total" filter
  useEffect(() => {
    if (activeFilter === "total") {
      setWorkouts(initialWorkouts);
      // Note: Stats are handled by the main statistics effect above
    }
  }, [activeFilter, initialWorkouts]);

  const filterOptions: FilterOption[] = [
    {
      key: "total",
      title: "Saved Workouts",
      value: initialStats.total,
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      key: "thisMonth",
      title: "Saved This Month",
      value: initialStats.thisMonth,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      key: "thisWeek",
      title: "Saved This Week",
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
      // Get all workouts for display (no status filter for time-based filters)
      const displayResult = await getFilteredWorkouts(userId, {
        filter: filter,
        limit: 50,
      });

      // Get statistics data (respecting includePlannedInStats)
      const statsResult = await getFilteredWorkouts(userId, {
        filter: filter,
        limit: 50,
        includePlanned: includePlannedInStats,
        forStatistics: true,
      });

      setWorkouts(displayResult.workouts);
      setCurrentAvgDuration(statsResult.avgDuration);
      setCurrentTotalDuration(statsResult.totalDuration);
      setCurrentAvgSets(statsResult.avgSets);
      setCurrentTotalSets(statsResult.totalSets);
    } catch (error) {
      console.error("Error filtering workouts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchiveOldWorkouts = async () => {
    setIsArchiving(true);
    try {
      const result = await archiveOldWorkouts();
      if (result.success) {
        toast.success(result.message);
        // Refresh workouts list
        await refreshWorkouts();
      } else {
        toast.error(result.error || "Failed to archive old workouts");
      }
    } catch (error) {
      toast.error("Error archiving old workouts");
    } finally {
      setIsArchiving(false);
    }
  };

  const handleIncludeArchivedChange = async (checked: boolean) => {
    setIncludeArchived(checked);
    setIsLoading(true);

    try {
      // Refresh workouts with or without archived ones
      const result = await getWorkoutsAction(userId, {
        includeArchived: checked,
        limit: 50,
      });

      if (result.success) {
        setWorkouts(result.workouts);
      } else {
        toast.error(result.error || "Failed to refresh workouts");
      }

      // Reset to total filter when toggling archive inclusion
      setActiveFilter("total");
    } catch (error) {
      console.error("Error refreshing workouts:", error);
      toast.error("Failed to refresh workouts");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshWorkouts = async () => {
    try {
      const result = await refreshWorkoutsAction(userId, includeArchived);

      if (result.success) {
        setWorkouts(result.workouts);
      } else {
        toast.error(result.error || "Failed to refresh workouts");
      }

      // Refresh filter statistics
      if (activeFilter !== "total") {
        const filterResult = await getFilteredWorkouts(userId, {
          filter: activeFilter,
          limit: 50,
          includePlanned: includePlannedInStats,
          forStatistics: true,
        });
        setCurrentAvgDuration(filterResult.avgDuration);
        setCurrentTotalDuration(filterResult.totalDuration);
        setCurrentAvgSets(filterResult.avgSets);
        setCurrentTotalSets(filterResult.totalSets);
      }
    } catch (error) {
      console.error("Error refreshing workouts:", error);
      toast.error("Failed to refresh workouts");
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
            <div key={index} className="bg-gray-50 rounded-lg p-4">
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

      {/* Workouts List Section with Status Tabs */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">
              Workouts
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-planned-stats"
                  checked={includePlannedInStats}
                  onCheckedChange={(checked) =>
                    setIncludePlannedInStats(checked === true)
                  }
                />
                <label
                  htmlFor="include-planned-stats"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Include planned workouts in statistics
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-archived"
                  checked={includeArchived}
                  onCheckedChange={handleIncludeArchivedChange}
                />
                <label
                  htmlFor="include-archived"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Include archived workouts
                </label>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleArchiveOldWorkouts}
                disabled={isArchiving}
                className="flex items-center gap-2"
              >
                <Archive className="size-4" />
                {isArchiving ? "Archiving..." : "Archive Old Workouts"}
              </Button>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <Tabs
            value={activeStatusTab}
            onValueChange={setActiveStatusTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="planned" className="flex items-center gap-2">
                <Clock3 className="size-4" />
                Planned ({plannedWorkouts.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="flex items-center gap-2">
                <Play className="size-4" />
                Active ({activeWorkouts.length})
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex items-center gap-2">
                <CheckCircle className="size-4" />
                Saved ({savedWorkouts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="planned" className="mt-6">
              <div className="text-sm text-muted-foreground mb-4">
                Workouts scheduled for future dates
                {isLoading && " (Loading...)"}
              </div>
              {isLoading ? (
                <WorkoutListSkeleton />
              ) : (
                <WorkoutList
                  userId={userId}
                  initialWorkouts={plannedWorkouts}
                  activeFilter="all"
                />
              )}
            </TabsContent>

            <TabsContent value="active" className="mt-6">
              <div className="text-sm text-muted-foreground mb-4">
                Currently active workout sessions
                {isLoading && " (Loading...)"}
              </div>
              {isLoading ? (
                <WorkoutListSkeleton />
              ) : (
                <WorkoutList
                  userId={userId}
                  initialWorkouts={activeWorkouts}
                  activeFilter="all"
                />
              )}
            </TabsContent>

            <TabsContent value="saved" className="mt-6">
              <div className="text-sm text-muted-foreground mb-4">
                Completed workout history
                {activeFilter === "total" && " - All workouts"}
                {activeFilter === "thisWeek" && " - This week"}
                {activeFilter === "thisMonth" && " - This month"}
                {isLoading && " (Loading...)"}
                {includeArchived && " • Including archived workouts"}
              </div>
              {isLoading ? (
                <WorkoutListSkeleton />
              ) : (
                <WorkoutList
                  userId={userId}
                  initialWorkouts={savedWorkouts}
                  activeFilter="all"
                />
              )}
            </TabsContent>
          </Tabs>
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
