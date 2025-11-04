import {
  Activity,
  TrendingUp,
  Calendar,
  Target,
  Users,
  Trophy,
  Zap,
  Award,
  TrendingDown,
  Flame,
  Clock,
  BarChart3,
  Goal,
} from "lucide-react";
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
  getExerciseProgression,
  type DateFilter,
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

  const last7DaysFilter: DateFilter = {
    type: "preset",
    label: "Last 7 Days",
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  };

  const allTimeFilter: DateFilter = {
    type: "all-time",
    label: "All Time",
  };

  const [
    progressionOverview,
    personalRecords,
    muscleGroupStats,
    weeklyMuscleStats,
    exerciseProgression,
  ] = await Promise.all([
    getProgressionOverview(userId, last30DaysFilter),
    getPersonalRecords(userId, allTimeFilter),
    getMuscleGroupStats(userId, last30DaysFilter),
    getMuscleGroupStats(userId, last7DaysFilter),
    getExerciseProgression(userId, undefined, last30DaysFilter),
  ]);

  // Calculate workout streak
  const calculateWorkoutStreak = () => {
    // Simple streak calculation - this would be better with actual workout dates
    const recentWorkouts = workoutStats.thisWeek;
    const targetPerWeek = 3; // Assume 3 workouts per week is the goal
    return Math.min(recentWorkouts, targetPerWeek);
  };

  // Calculate progress trends
  const calculateProgressTrends = () => {
    const totalVolumeThisWeek = weeklyMuscleStats.reduce(
      (sum, group) => sum + group.totalVolume,
      0,
    );
    const totalVolumeThisMonth = muscleGroupStats.reduce(
      (sum, group) => sum + group.totalVolume,
      0,
    );
    
    // Estimate weekly average from monthly data (rough calculation)
    const weeklyAverageFromMonth = totalVolumeThisMonth / 4;
    const volumeTrend = weeklyAverageFromMonth > 0 
      ? ((totalVolumeThisWeek - weeklyAverageFromMonth) / weeklyAverageFromMonth) * 100
      : 0;

    return {
      volumeTrend: Math.round(volumeTrend),
      workoutFrequencyTrend: workoutStats.thisWeek >= 3 ? "excellent" : workoutStats.thisWeek >= 2 ? "good" : "needsWork",
    };
  };

  // Get most improved exercises
  const getMostImprovedExercises = () => {
    return exerciseProgression
      .filter(ex => ex.progression.weightIncrease > 0)
      .sort((a, b) => b.progression.weightIncrease - a.progression.weightIncrease)
      .slice(0, 3);
  };

  // Calculate some interesting stats
  const recentPRs = personalRecords.filter((pr) => {
    const prDate = new Date(pr.date);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return prDate >= weekAgo;
  });

  const totalVolumeThisMonth = muscleGroupStats.reduce(
    (sum, group) => sum + group.totalVolume,
    0,
  );
  const strongestMuscleGroup = muscleGroupStats.reduce(
    (strongest, current) =>
      current.totalVolume > strongest.totalVolume ? current : strongest,
    muscleGroupStats[0] || { category: "None", totalVolume: 0 },
  );

  const workoutStreak = calculateWorkoutStreak();
  const progressTrends = calculateProgressTrends();
  const topImprovedExercises = getMostImprovedExercises();

  const stats = [
    {
      title: "Workout Streak",
      value: `${workoutStreak}/3`,
      description: "This week's progress",
      icon: Flame,
      color: workoutStreak >= 3 ? "text-orange-600" : "text-gray-500",
      badge: workoutStreak >= 3 ? "On Fire!" : undefined,
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
      title: "Monthly Volume",
      value: `${Math.round(totalVolumeThisMonth / 1000)}K`,
      description: "kg lifted this month",
      icon: Zap,
      color: "text-purple-600",
      trend: progressTrends.volumeTrend > 0 ? `+${progressTrends.volumeTrend}%` : progressTrends.volumeTrend < 0 ? `${progressTrends.volumeTrend}%` : "stable",
    },
    {
      title: "Avg Duration",
      value: `${workoutStats.avgDuration}m`,
      description: "Average workout time",
      icon: Clock,
      color: "text-blue-600",
    },
  ] as Array<{
    title: string;
    value: string;
    description: string;
    icon: any;
    color: string;
    badge?: string;
    trend?: string;
  }>;

  return (
    <div className="min-h-screen bg-gray-20">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {userName}!</h1>
          <p className="text-muted-foreground">
            {workoutStats.total > 0 
              ? `${workoutStats.total} workouts completed • ${progressionOverview.totalExercises} exercises mastered`
              : "Ready to start your fitness journey? Create your first workout below!"
            }
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                {stat.badge && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {stat.badge}
                  </Badge>
                )}
                {stat.trend && (
                  <p className={`text-xs mt-1 ${
                    stat.trend.startsWith('+') ? 'text-green-600' : 
                    stat.trend.startsWith('-') ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stat.trend !== 'stable' ? `${stat.trend} vs last week` : 'Stable'}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
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

        {/* Progress Insights */}
        {workoutStats.total > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="size-5 text-blue-600" />
                  Progress Highlights
                </CardTitle>
                <CardDescription>Your recent achievements and improvements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topImprovedExercises.length > 0 ? (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Most Improved Exercise</h4>
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium">{topImprovedExercises[0].exerciseName}</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          +{topImprovedExercises[0].progression.weightIncrease.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ) : null}
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2">Strongest Muscle Group</h4>
                    <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium">{strongestMuscleGroup.category}</span>
                      <span className="text-xs text-purple-600">
                        {Math.round(strongestMuscleGroup.totalVolume / 1000)}K kg total
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">Weekly Consistency</h4>
                    <div className={`flex items-center justify-between p-2 rounded-lg ${
                      progressTrends.workoutFrequencyTrend === 'excellent' ? 'bg-green-50' :
                      progressTrends.workoutFrequencyTrend === 'good' ? 'bg-yellow-50' : 'bg-red-50'
                    }`}>
                      <span className="text-sm font-medium">
                        {workoutStats.thisWeek}/3 workouts this week
                      </span>
                      <Badge variant="secondary" className={
                        progressTrends.workoutFrequencyTrend === 'excellent' ? 'bg-green-100 text-green-800' :
                        progressTrends.workoutFrequencyTrend === 'good' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }>
                        {progressTrends.workoutFrequencyTrend === 'excellent' ? 'Excellent' :
                         progressTrends.workoutFrequencyTrend === 'good' ? 'Good' : 'Keep Going'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Goal className="size-5 text-green-600" />
                  Next Milestones
                </CardTitle>
                <CardDescription>Goals to work towards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Weekly Goal</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            workoutStreak >= 3 ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min((workoutStreak / 3) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{workoutStreak}/3</span>
                    </div>
                  </div>

                  {totalVolumeThisMonth > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Monthly Volume Target</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min((totalVolumeThisMonth / 50000) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(totalVolumeThisMonth / 1000)}K/50K kg
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Target className="size-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Next Personal Record</p>
                    <p className="text-xs text-muted-foreground">
                      {topImprovedExercises.length > 0 
                        ? `Try increasing ${topImprovedExercises[0].exerciseName} weight by 2.5kg`
                        : "Complete more workouts to unlock PR suggestions"
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Feature Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Available Features</CardTitle>
            <CardDescription>
              Powerful tools to enhance your fitness journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-green-50">
                <TrendingUp className="size-8 text-green-600" />
                <div>
                  <h4 className="font-medium">Progress Tracking</h4>
                  <p className="text-sm text-muted-foreground">
                    Visual progress charts and analytics
                  </p>
                  <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800 text-xs">
                    Available
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-blue-50">
                <Calendar className="size-8 text-blue-600" />
                <div>
                  <h4 className="font-medium">Workout Calendar</h4>
                  <p className="text-sm text-muted-foreground">
                    View and manage your workout schedule
                  </p>
                  <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-800 text-xs">
                    Available
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <Users className="size-8 text-orange-600" />
                <div>
                  <h4 className="font-medium">Goal Setting</h4>
                  <p className="text-sm text-muted-foreground">
                    Set and track fitness goals
                  </p>
                  <Badge variant="outline" className="mt-1 text-xs">
                    Coming Soon
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
