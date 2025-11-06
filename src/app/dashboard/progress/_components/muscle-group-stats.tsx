import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getMuscleGroupStats,
  DateFilter,
} from "@/actions/get-progression-stats";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MuscleGroupStatsProps {
  userId: string;
  dateFilter?: DateFilter;
}

export async function MuscleGroupStats({
  userId,
  dateFilter,
}: MuscleGroupStatsProps) {
  const muscleGroupStats = await getMuscleGroupStats(userId, dateFilter);

  if (muscleGroupStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Muscle Group Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">
                No muscle group data available
              </p>
              <p className="text-sm text-muted-foreground">
                Complete some workouts to see your balance!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort by total volume for better visualization
  const sortedStats = muscleGroupStats.sort(
    (a, b) => b.totalVolume - a.totalVolume,
  );

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "decreasing":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "increasing":
        return "text-green-600";
      case "decreasing":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getBalanceStatus = (stat: any) => {
    if (stat.balance.isUnderTrained)
      return { label: "Under-trained", color: "destructive" };
    if (stat.balance.isOverTrained)
      return { label: "Over-trained", color: "secondary" };
    return { label: "Balanced", color: "default" };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Muscle Group Balance</CardTitle>
          <p className="text-sm text-muted-foreground">
            Track volume distribution and progression across muscle groups
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedStats.map((stat) => {
              const balanceStatus = getBalanceStatus(stat);

              return (
                <div
                  key={stat.category}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium capitalize">{stat.category}</h4>
                    <Badge variant={balanceStatus.color as any}>
                      {balanceStatus.label}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Total Volume:
                      </span>
                      <span className="font-medium">
                        {Math.round(stat.totalVolume / 1000)}k lbs
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Avg per Workout:
                      </span>
                      <span className="font-medium">
                        {Math.round(stat.averageVolume)} lbs
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Workouts:</span>
                      <span className="font-medium">{stat.workoutCount}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">% of Total:</span>
                      <span className="font-medium">
                        {stat.balance.percentageOfTotal.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Volume Distribution Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Volume Distribution</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(100, stat.balance.percentageOfTotal * 2.5)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Trend */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTrendIcon(stat.progression.trend)}
                      <span
                        className={`text-sm font-medium ${getTrendColor(stat.progression.trend)}`}
                      >
                        {stat.progression.trend}
                      </span>
                    </div>
                    <span
                      className={`text-sm ${getTrendColor(stat.progression.trend)}`}
                    >
                      {stat.progression.volumeChange >= 0 ? "+" : ""}
                      {stat.progression.volumeChange.toFixed(1)}%
                    </span>
                  </div>

                  {/* Exercises */}
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">
                      Exercises ({stat.exercises.length}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {stat.exercises.slice(0, 3).map((exercise) => (
                        <Badge
                          key={exercise}
                          variant="outline"
                          className="text-xs"
                        >
                          {exercise}
                        </Badge>
                      ))}
                      {stat.exercises.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{stat.exercises.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Balance Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Training Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedStats
              .filter(
                (stat) =>
                  stat.balance.isUnderTrained || stat.balance.isOverTrained,
              )
              .map((stat) => (
                <div
                  key={stat.category}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <div
                    className={`h-2 w-2 rounded-full ${
                      stat.balance.isUnderTrained
                        ? "bg-orange-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {stat.balance.isUnderTrained ? "Increase" : "Balance"}{" "}
                      {stat.category} training
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stat.balance.isUnderTrained
                        ? `Only ${stat.balance.percentageOfTotal.toFixed(1)}% of total volume - consider adding more ${stat.category} exercises`
                        : `${stat.balance.percentageOfTotal.toFixed(1)}% of total volume - consider balancing with other muscle groups`}
                    </p>
                  </div>
                </div>
              ))}

            {sortedStats.every(
              (stat) =>
                !stat.balance.isUnderTrained && !stat.balance.isOverTrained,
            ) && (
              <div className="text-center py-4">
                <div className="h-2 w-2 rounded-full bg-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-600">
                  Great muscle group balance!
                </p>
                <p className="text-xs text-muted-foreground">
                  Your training is well-distributed across muscle groups
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
