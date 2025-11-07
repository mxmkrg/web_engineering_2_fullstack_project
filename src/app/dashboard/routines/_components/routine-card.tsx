"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Target, Play } from "lucide-react";
import { PlanWorkoutFromRoutineDialog } from "./plan-workout-from-routine-dialog";
import { startWorkoutFromRoutine } from "@/actions/start-workout-from-routine";

interface RoutineCardProps {
  routine: {
    id: number;
    name: string;
    description: string | null;
    category: string;
    difficulty: string;
    duration: number | null;
    isPublic: boolean;
    isTemplate: boolean;
    tags: string | null;
    exerciseCount?: number; // We'll pass this from the server
  };
}

export function RoutineCard({ routine }: RoutineCardProps) {
  const difficultyColors = {
    beginner:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    intermediate:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-1">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-tight">
            {routine.name}
          </CardTitle>
          <Badge
            variant="secondary"
            className={
              difficultyColors[
                routine.difficulty as keyof typeof difficultyColors
              ] || difficultyColors.intermediate
            }
          >
            {routine.difficulty}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {routine.description || "No description available"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="size-4" />
            <span>{routine.duration || 60} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="size-4" />
            <span>{routine.exerciseCount || 0} exercises</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <PlanWorkoutFromRoutineDialog routine={routine}>
            <Button className="flex-1">
              <Calendar className="size-4 mr-2" />
              Plan Workout
            </Button>
          </PlanWorkoutFromRoutineDialog>
          <form action={startWorkoutFromRoutine}>
            <input type="hidden" name="routineId" value={routine.id} />
            <Button type="submit" className="flex-1" variant="outline">
              <Play className="size-4 mr-2" />
              Start Workout
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
