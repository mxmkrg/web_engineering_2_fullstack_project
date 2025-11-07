"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Dumbbell,
  Activity,
  CheckCircle2,
  Clock,
  TrendingUp,
  Calendar,
  UserCog,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { getAppStats, type AppStats } from "@/actions/admin";

function formatUptime(minutes: number): string {
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${mins}m`;
  }
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: string;
}

function StatCard({ title, value, icon, description, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-muted-foreground text-xs mt-1">{description}</p>
        )}
        {trend && (
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <TrendingUp className="size-3" />
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function StatsCards() {
  const [stats, setStats] = useState<AppStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await getAppStats();
      if (!result.success) {
        throw new Error(result.error);
      }
      setStats(result.stats || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading && !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="size-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-md bg-destructive/15 p-4 text-sm text-destructive">
        <AlertCircle className="mt-0.5 size-5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-semibold">Error loading statistics</p>
          <p className="mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Application Statistics
          </h2>
          <p className="text-muted-foreground text-sm">
            Real-time overview of your fitness tracking application
          </p>
        </div>
        <button
          onClick={loadStats}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Refresh statistics"
        >
          <RefreshCw className={`size-5 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users className="size-4" />}
          description={`${stats.totalAdmins} admin${stats.totalAdmins !== 1 ? "s" : ""}`}
          trend={
            stats.recentUsersCount > 0
              ? `+${stats.recentUsersCount} in last 30 days`
              : undefined
          }
        />

        <StatCard
          title="Active Sessions"
          value={stats.activeSessions}
          icon={<Activity className="size-4" />}
          description="Currently logged in users"
        />

        <StatCard
          title="Total Workouts"
          value={stats.totalWorkouts}
          icon={<Dumbbell className="size-4" />}
          description={`${stats.completedWorkouts} completed`}
        />

        <StatCard
          title="Workouts This Month"
          value={stats.workoutsThisMonth}
          icon={<Calendar className="size-4" />}
          description={`${stats.workoutsThisWeek} this week`}
        />

        <StatCard
          title="Total Exercises"
          value={stats.totalExercises}
          icon={<Activity className="size-4" />}
          description="Available exercises"
        />

        <StatCard
          title="Total Routines"
          value={stats.totalRoutines}
          icon={<UserCog className="size-4" />}
          description="Created routines"
        />

        <StatCard
          title="Total Sets Logged"
          value={stats.totalSets.toLocaleString()}
          icon={<CheckCircle2 className="size-4" />}
          description="Across all workouts"
        />

        <StatCard
          title="App Uptime"
          value={formatUptime(stats.uptimeMinutes)}
          icon={<Clock className="size-4" />}
          description="Since last restart"
        />
      </div>
    </div>
  );
}
