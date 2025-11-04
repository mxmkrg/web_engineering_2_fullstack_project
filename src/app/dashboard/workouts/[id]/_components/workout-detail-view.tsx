"use client";

import {
  Calendar,
  Clock,
  CheckCircle,
  Edit,
  ArrowLeft,
  Play,
  Hash,
  Weight,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface WorkoutSet {
  setNumber: number;
  reps: number | null;
  weight: number | null;
  completed: boolean;
}

interface WorkoutExercise {
  exerciseId: number;
  exerciseName: string;
  category: string;
  order: number;
  sets: WorkoutSet[];
}

interface WorkoutData {
  id: number;
  name: string;
  date: Date;
  duration: number | null;
  status: string;
  notes: string | null;
  exercises: WorkoutExercise[];
}

interface WorkoutDetailViewProps {
  workoutData: WorkoutData;
}

export function WorkoutDetailView({ workoutData }: WorkoutDetailViewProps) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/dashboard/workouts/${workoutData.id}/edit`);
  };

  const handleBack = () => {
    router.push("/dashboard/workouts");
  };

  const totalSets = workoutData.exercises.reduce(
    (sum, ex) => sum + ex.sets.length,
    0,
  );
  const completedSets = workoutData.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((set) => set.completed).length,
    0,
  );
  const totalVolume = workoutData.exercises.reduce(
    (sum, ex) =>
      sum + ex.sets.reduce((setSum, set) => setSum + (set.weight || 0) * (set.reps || 0), 0),
    0,
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="size-4 mr-2" />
            Back to Workouts
          </Button>
        </div>
        <Button onClick={handleEdit} className="gap-2">
          <Edit className="size-4" />
          Edit Workout
        </Button>
      </div>

      {/* Workout Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{workoutData.name}</CardTitle>
              <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="size-4" />
                  {new Date(workoutData.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="size-4" />
                  {workoutData.duration || 0} minutes
                </div>
              </div>
            </div>
            <Badge
              variant={
                workoutData.status === "completed" ? "default" : "secondary"
              }
              className={
                workoutData.status === "completed" ? "bg-blue-600" : ""
              }
            >
              {workoutData.status === "completed" ? (
                <>
                  <CheckCircle className="size-3 mr-1" />
                  Completed
                </>
              ) : (
                <>
                  <Play className="size-3 mr-1" />
                  Active
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Workout Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {workoutData.exercises.length}
              </div>
              <div className="text-sm text-blue-700">Exercises</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {totalSets}
              </div>
              <div className="text-sm text-blue-700">Total Sets</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {completedSets}
              </div>
              <div className="text-sm text-blue-700">Completed Sets</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(totalVolume)}kg
              </div>
              <div className="text-sm text-blue-700">Total Volume</div>
            </div>
          </div>

          {/* Notes */}
          {workoutData.notes && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Notes</h4>
              <p className="text-muted-foreground">{workoutData.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exercises */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Exercises</h2>
        {workoutData.exercises.map((exercise, index) => (
          <Card key={exercise.exerciseId}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {exercise.exerciseName}
                  </CardTitle>
                  <Badge variant="outline" className="mt-1">
                    {exercise.category}
                  </Badge>
                </div>
                <Badge variant="secondary">Exercise {index + 1}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {exercise.sets.length > 0 ? (
                <div className="space-y-2">
                  {/* Headers */}
                  <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
                    <div className="flex items-center gap-1">
                      <Hash className="size-3" />
                      Set
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="size-3" />
                      Reps
                    </div>
                    <div className="flex items-center gap-1">
                      <Weight className="size-3" />
                      Weight
                    </div>
                    <div>Status</div>
                  </div>

                  {/* Sets */}
                  {exercise.sets.map((set) => (
                    <div
                      key={set.setNumber}
                      className="grid grid-cols-4 gap-4 py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium">{set.setNumber}</div>
                      <div>{set.reps}</div>
                      <div>{set.weight}kg</div>
                      <div>
                        {set.completed ? (
                          <Badge variant="default" className="bg-blue-600">
                            <CheckCircle className="size-3 mr-1" />
                            Done
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Exercise Summary */}
                  <div className="mt-3 pt-3 border-t bg-blue-50 p-3 rounded">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Sets: </span>
                        {exercise.sets.length}
                      </div>
                      <div>
                        <span className="font-medium">Total Reps: </span>
                        {exercise.sets.reduce((sum, set) => sum + (set.reps || 0), 0)}
                      </div>
                      <div>
                        <span className="font-medium">Volume: </span>
                        {Math.round(
                          exercise.sets.reduce(
                            (sum, set) => sum + (set.weight || 0) * (set.reps || 0),
                            0,
                          ),
                        )}
                        kg
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  No sets recorded for this exercise
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {workoutData.exercises.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No exercises added to this workout yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
