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
import { Clock, Calendar, Target } from "lucide-react";
import { PlanWorkoutFromRoutineDialog } from "./plan-workout-from-routine-dialog";
import { getTemplate } from "@/lib/workout-templates";

interface RoutineCardProps {
  routine: {
    id: number;
    name: string;
    description: string | null;
    templateKey: string;
    difficulty: string;
    estimatedDuration: number | null;
    isActive: boolean;
  };
}

export function RoutineCard({ routine }: RoutineCardProps) {
  const template = getTemplate(routine.templateKey);
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
            <span>
              {routine.estimatedDuration || template?.baseDuration || 60} min
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="size-4" />
            <span>{template?.exercises?.length || 0} exercises</span>
          </div>
        </div>

        <PlanWorkoutFromRoutineDialog routine={routine}>
          <Button className="w-full" variant="outline">
            <Calendar className="size-4 mr-2" />
            Plan Workout
          </Button>
        </PlanWorkoutFromRoutineDialog>
      </CardContent>
    </Card>
  );
}
