import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getPersonalRecords,
  type DateFilter,
} from "@/actions/get-progression-stats";
import { Trophy, TrendingUp, Target, Calendar } from "lucide-react";

interface PersonalRecordsTimelineProps {
  userId: string;
  dateFilter?: DateFilter;
}

export async function PersonalRecordsTimeline({
  userId,
  dateFilter,
}: PersonalRecordsTimelineProps) {
  const records = await getPersonalRecords(userId, dateFilter);

  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Personal Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground mb-2">
                No personal records yet
              </p>
              <p className="text-sm text-muted-foreground">
                Keep training to unlock your first PRs!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group records by exercise for better organization
  const recordsByExercise = records.reduce(
    (acc, record) => {
      if (!acc[record.exerciseName]) {
        acc[record.exerciseName] = {
          exerciseName: record.exerciseName,
          category: record.category,
          records: [],
        };
      }
      acc[record.exerciseName].records.push(record);
      return acc;
    },
    {} as Record<string, any>,
  );

  // Get recent records (last 30 days) and best improvements
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentRecords = records.filter(
    (record) => record.date >= thirtyDaysAgo,
  );
  const bestImprovements = records
    .filter((record) => record.improvement > 0)
    .sort((a, b) => b.improvement - a.improvement)
    .slice(0, 5);

  const getRecordIcon = (type: string) => {
    switch (type) {
      case "weight":
        return <Trophy className="h-4 w-4 text-yellow-600" />;
      case "volume":
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case "reps":
        return <Target className="h-4 w-4 text-green-600" />;
      default:
        return <Trophy className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case "weight":
        return "bg-yellow-100 text-yellow-800";
      case "volume":
        return "bg-blue-100 text-blue-800";
      case "reps":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatValue = (value: number, type: string) => {
    switch (type) {
      case "weight":
        return `${value} lbs`;
      case "volume":
        return `${Math.round(value)} lbs`;
      case "reps":
        return `${value} reps`;
      default:
        return value.toString();
    }
  };

  return (
    <div className="space-y-6">
      {/* Recent Records */}
      {recentRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Personal Records
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              New records achieved in the last 30 days
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRecords.slice(0, 5).map((record) => (
                <div
                  key={record.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  {getRecordIcon(record.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{record.exerciseName}</span>
                      <Badge className={getRecordTypeColor(record.type)}>
                        {record.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-muted-foreground">
                        {formatValue(record.value, record.type)}
                      </span>
                      {record.improvement > 0 && (
                        <span className="text-sm text-green-600">
                          +{record.improvement.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {record.date.toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Best Improvements */}
      {bestImprovements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Biggest Improvements
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Your most impressive strength gains
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bestImprovements.map((record, index) => (
                <div
                  key={record.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{record.exerciseName}</span>
                      <Badge className={getRecordTypeColor(record.type)}>
                        {record.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-muted-foreground">
                        {formatValue(record.value, record.type)}
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        +{record.improvement.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {record.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Records by Exercise */}
      <Card>
        <CardHeader>
          <CardTitle>All Personal Records</CardTitle>
          <p className="text-sm text-muted-foreground">
            Complete history of your strength achievements
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.values(recordsByExercise).map((exerciseGroup: any) => (
              <div
                key={exerciseGroup.exerciseName}
                className="border rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{exerciseGroup.exerciseName}</h4>
                  <Badge variant="outline">{exerciseGroup.category}</Badge>
                </div>

                <div className="space-y-2">
                  {exerciseGroup.records.map((record: any) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {getRecordIcon(record.type)}
                        <span className="text-sm capitalize">
                          {record.type}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {formatValue(record.value, record.type)}
                        </div>
                        {record.improvement > 0 && (
                          <div className="text-xs text-green-600">
                            +{record.improvement.toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Milestones & Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Strength Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Common strength milestones */}
            {["Bench Press", "Squats", "Deadlift"].map((exercise) => {
              const exerciseRecords = records.filter(
                (r) =>
                  r.exerciseName
                    .toLowerCase()
                    .includes(exercise.toLowerCase()) && r.type === "weight",
              );
              const maxWeight = Math.max(
                ...exerciseRecords.map((r) => r.value),
                0,
              );

              const milestones = [
                { weight: 135, label: "First Plate" },
                { weight: 225, label: "Two Plates" },
                { weight: 315, label: "Three Plates" },
                { weight: 405, label: "Four Plates" },
              ];

              const nextMilestone = milestones.find(
                (m) => m.weight > maxWeight,
              );
              const achievedMilestones = milestones.filter(
                (m) => m.weight <= maxWeight,
              );

              return (
                <div key={exercise} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{exercise}</h4>
                    <span className="text-sm text-muted-foreground">
                      Current max: {maxWeight || 0} lbs
                    </span>
                  </div>

                  <div className="flex gap-2 mb-2">
                    {milestones.map((milestone) => (
                      <div
                        key={milestone.weight}
                        className={`px-2 py-1 rounded text-xs ${
                          milestone.weight <= maxWeight
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {milestone.label}
                      </div>
                    ))}
                  </div>

                  {nextMilestone && (
                    <div className="text-sm text-muted-foreground">
                      Next goal: {nextMilestone.label} ({nextMilestone.weight}{" "}
                      lbs) - {nextMilestone.weight - maxWeight} lbs to go
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
