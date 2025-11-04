import { Activity, TrendingUp, Calendar, Target, Users, Trophy, Zap, Award, TrendingDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getWorkoutStatistics } from "@/lib/workout-stats";
import { 
  getPersonalRecords, 
  getProgressionOverview, 
  getMuscleGroupStats,
  type DateFilter 
} from "@/actions/get-progression-stats";
import { QuickStartButton } from "./quick-start-button";
import { RecentActivity } from "./recent-activity";

interface DashboardContentProps {
  userName: string;
  userId: string;
}

export async function DashboardContent({
  userName,
  userId,
}: DashboardContentProps) {
  const workoutStats = await getWorkoutStatistics(userId);
  
  // Get progression data for dashboard insights
  const last30DaysFilter: DateFilter = {
    type: "preset",
    label: "Last 30 Days",
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  };
  
  const allTimeFilter: DateFilter = {
    type: "all-time",
    label: "All Time",
  };

  const [progressionOverview, personalRecords, muscleGroupStats] = await Promise.all([
    getProgressionOverview(userId, last30DaysFilter),
    getPersonalRecords(userId, allTimeFilter),
    getMuscleGroupStats(userId, last30DaysFilter),
  ]);

  // Calculate some interesting stats
  const recentPRs = personalRecords.filter(pr => {
    const prDate = new Date(pr.date);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return prDate >= weekAgo;
  });

  const totalVolumeThisMonth = muscleGroupStats.reduce((sum, group) => sum + group.totalVolume, 0);
  const strongestMuscleGroup = muscleGroupStats.reduce((strongest, current) => 
    current.totalVolume > strongest.totalVolume ? current : strongest, 
    muscleGroupStats[0] || { category: "None", totalVolume: 0 }
  );

  const stats = [
    {
      title: "Total Workouts",
      value: workoutStats.total.toString(),
      description: "Workouts completed",
      icon: Activity,
      color: "text-blue-600",
    },
    {
      title: "Recent PRs",
      value: recentPRs.length.toString(),
      description: "Personal records this week",
      icon: Trophy,
      color: "text-yellow-600",
      badge: recentPRs.length > 0 ? "New!" : undefined,
    },
    {
      title: "Total Volume",
      value: `${Math.round(totalVolumeThisMonth / 1000)}K`,
      description: "kg lifted this month",
      icon: Zap,
      color: "text-purple-600",
    },
    {
      title: "Strongest Group",
      value: strongestMuscleGroup.category,
      description: `${Math.round(strongestMuscleGroup.totalVolume / 1000)}K kg this month`,
      icon: Award,
      color: "text-green-600",
    },
  ] as Array<{
    title: string;
    value: string;
    description: string;
    icon: any;
    color: string;
    badge?: string;
  }>;

  // Additional insights for the enhanced cards
  const progressInsights = {
    workoutFrequency: workoutStats.thisWeek >= 3 ? "Great" : workoutStats.thisWeek >= 1 ? "Good" : "Low",
    totalPRs: personalRecords.length,
    improvementTrend: progressionOverview.mostImprovedExercise?.improvement ? "up" : "stable",
  };

  return (
    <div className="min-h-screen bg-gray-20">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {userName}!</h1>
          <p className="text-muted-foreground">
            Track your workouts and monitor your fitness progress
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {stat.title}
                  {stat.badge && (
                    <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                      {stat.badge}
                    </Badge>
                  )}
                </CardTitle>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Progress Insights */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="size-4 text-green-600" />
                Recent Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total PRs Set</span>
                  <span className="font-medium">{progressInsights.totalPRs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">This Week</span>
                  <span className="font-medium">{recentPRs.length} new PRs</span>
                </div>
                {progressionOverview.mostImprovedExercise && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground">Most Improved</p>
                    <p className="font-medium text-sm">{progressionOverview.mostImprovedExercise.name}</p>
                    <p className="text-xs text-green-600">+{progressionOverview.mostImprovedExercise.improvement.toFixed(1)}%</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="size-4 text-blue-600" />
                Consistency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">This Week</span>
                  <Badge 
                    variant={progressInsights.workoutFrequency === "Great" ? "default" : 
                            progressInsights.workoutFrequency === "Good" ? "secondary" : "outline"}
                    className={progressInsights.workoutFrequency === "Great" ? "bg-green-600" : ""}
                  >
                    {progressInsights.workoutFrequency}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Workouts</span>
                  <span className="font-medium">{workoutStats.thisWeek} of 7 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">This Month</span>
                  <span className="font-medium">{workoutStats.thisMonth} workouts</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="size-4 text-purple-600" />
                Strength Focus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Strongest</span>
                  <span className="font-medium">{strongestMuscleGroup.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Volume</span>
                  <span className="font-medium">{Math.round(strongestMuscleGroup.totalVolume / 1000)}K kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Trend</span>
                  <div className="flex items-center gap-1">
                    {progressInsights.improvementTrend === "up" ? (
                      <>
                        <TrendingUp className="size-3 text-green-600" />
                        <span className="text-xs text-green-600">Improving</span>
                      </>
                    ) : progressInsights.improvementTrend === "down" ? (
                      <>
                        <TrendingDown className="size-3 text-red-600" />
                        <span className="text-xs text-red-600">Declining</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xs text-muted-foreground">Stable</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Action Card */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
              <CardDescription>
                Ready to begin your fitness journey?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center space-y-4 min-h-[100px]">
                <QuickStartButton />
                <p className="text-sm text-muted-foreground text-center">
                  Track exercises, sets, reps, and weights to monitor your
                  progress over time.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest workout sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivity />
            </CardContent>
          </Card>
        </div>

        {/* Feature Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Your Progress Journey</CardTitle>
            <CardDescription>
              Track your fitness evolution with detailed analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-green-50">
                <TrendingUp className="size-8 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-800">Progress Tracking</h4>
                  <p className="text-sm text-green-600">
                    ✓ Available now - View detailed charts
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <Calendar className="size-8 text-purple-600" />
                <div>
                  <h4 className="font-medium">Workout Scheduling</h4>
                  <p className="text-sm text-muted-foreground">
                    Plan and schedule your workouts
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <Users className="size-8 text-orange-600" />
                <div>
                  <h4 className="font-medium">Goal Setting</h4>
                  <p className="text-sm text-muted-foreground">
                    Set and track fitness goals
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Ready to dive deeper into your progress?
                </p>
                <Badge className="bg-blue-600 hover:bg-blue-700">
                  <a href="/dashboard/progress" className="text-white">
                    View Progress →
                  </a>
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
