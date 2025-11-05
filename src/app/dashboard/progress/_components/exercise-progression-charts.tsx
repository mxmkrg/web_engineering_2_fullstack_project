import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getExerciseProgression,
  type ExerciseProgression,
  DateFilter,
} from "@/actions/get-progression-stats";

interface ExerciseProgressionChartsProps {
  userId: string;
  dateFilter?: DateFilter;
}

export async function ExerciseProgressionCharts({
  userId,
  dateFilter,
}: ExerciseProgressionChartsProps) {
  const exerciseData = await getExerciseProgression(
    userId,
    undefined,
    dateFilter,
  );

  if (exerciseData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Exercise Progression</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">
                No progression data available
              </p>
              <p className="text-sm text-muted-foreground">
                Complete some workouts to see your progress!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get unique categories - show first category by default
  const categories = Array.from(new Set(exerciseData.map((e) => e.category)));
  const firstCategory = categories[0] || "all";

  const filteredExercises = exerciseData.filter(
    (e) => e.category === firstCategory,
  );

  return (
    <div className="space-y-6">
      {/* Exercise Progression Summary */}
      <Card>
        <CardHeader>
          <CardTitle>
            Exercise Progression -{" "}
            {firstCategory.charAt(0).toUpperCase() + firstCategory.slice(1)}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Showing {filteredExercises.length} exercises in {firstCategory}{" "}
            category
          </p>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {filteredExercises.slice(0, 5).map((exercise) => (
              <div key={exercise.exerciseId} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{exercise.exerciseName}</h4>
                  <span className="text-xs px-2 py-1 bg-muted rounded">
                    {exercise.category}
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">
                      Max Weight
                    </div>
                    <div className="text-lg font-bold">
                      {exercise.personalRecords.maxWeight} lbs
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">
                      Weight Progress
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        exercise.progression.weightIncrease >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {exercise.progression.weightIncrease >= 0 ? "+" : ""}
                      {exercise.progression.weightIncrease.toFixed(1)}%
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">
                      Consistency
                    </div>
                    <div className="text-lg font-bold">
                      {Math.round(exercise.progression.consistency)}%
                    </div>
                  </div>
                </div>

                {/* Data Points Summary */}
                {exercise.dataPoints.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-xs text-muted-foreground mb-2">
                      Recent Sessions:
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {exercise.dataPoints.slice(-5).map((point, index) => (
                        <div
                          key={index}
                          className="text-xs bg-muted px-2 py-1 rounded"
                        >
                          {point.date.toLocaleDateString()}: {point.maxWeight}
                          lbs
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Exercises Summary */}
      <Card>
        <CardHeader>
          <CardTitle>All Exercises Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {exerciseData.slice(0, 6).map((exercise) => (
              <div key={exercise.exerciseId} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium">
                    {exercise.exerciseName}
                  </h5>
                  <span className="text-xs px-2 py-1 bg-muted rounded">
                    {exercise.category}
                  </span>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Weight:</span>
                    <span className="font-medium">
                      {exercise.personalRecords.maxWeight} lbs
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Progress:</span>
                    <span
                      className={`font-medium ${
                        exercise.progression.weightIncrease >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {exercise.progression.weightIncrease >= 0 ? "+" : ""}
                      {exercise.progression.weightIncrease.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
