"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar, Clock, Edit, Trash2, X, Dumbbell } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WorkoutDetailDialogProps {
  workout: {
    id: number;
    name: string;
    status: string;
    date: Date;
    duration: number | null;
    notes: string | null;
    exercises?: Array<{
      id: number;
      name: string;
      order: number;
      notes: string | null;
      sets: Array<{
        id: number;
        setNumber: number;
        reps: number;
        weight: number | null;
        completed: boolean;
        notes: string | null;
      }>;
    }>;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (workoutId: number) => void;
  onDelete: (workoutId: number) => void;
}

export function WorkoutDetailDialog({
  workout,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: WorkoutDetailDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!workout) return null;

  const handleDelete = async () => {
    if (
      confirm(
        "Are you sure you want to delete this workout? This action cannot be undone.",
      )
    ) {
      setIsDeleting(true);
      try {
        await onDelete(workout.id);
        onClose();
      } catch (error) {
        console.error("Error deleting workout:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleEdit = () => {
    onEdit(workout.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Dumbbell className="size-5" />
              {workout.name}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="flex items-center gap-2"
              >
                <Edit className="size-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2"
              >
                <Trash2 className="size-4" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Workout Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4" />
              {format(new Date(workout.date), "PPP")}
            </div>
            {workout.duration && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4" />
                {workout.duration} minutes
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {workout.status === "archived" ? "Saved" : workout.status}
            </Badge>
          </div>

          {workout.notes && (
            <div>
              <h4 className="font-medium mb-2">Notes</h4>
              <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                {workout.notes}
              </p>
            </div>
          )}

          {/* Exercises */}
          {workout.exercises && workout.exercises.length > 0 && (
            <div>
              <h4 className="font-medium mb-4">
                Exercises ({workout.exercises.length})
              </h4>
              <div className="space-y-4">
                {workout.exercises
                  .sort((a, b) => a.order - b.order)
                  .map((exercise, index) => (
                    <div
                      key={exercise.id}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-medium text-gray-500">
                          #{index + 1}
                        </span>
                        <h5 className="font-medium">{exercise.name}</h5>
                      </div>

                      {exercise.notes && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {exercise.notes}
                        </p>
                      )}

                      {exercise.sets && exercise.sets.length > 0 && (
                        <div className="space-y-2">
                          <h6 className="text-sm font-medium text-gray-700">
                            Sets ({exercise.sets.length})
                          </h6>
                          <div className="grid gap-2">
                            {exercise.sets
                              .sort((a, b) => a.setNumber - b.setNumber)
                              .map((set) => (
                                <div
                                  key={set.id}
                                  className="flex items-center justify-between bg-white p-2 rounded border text-sm"
                                >
                                  <span className="font-medium">
                                    Set {set.setNumber}
                                  </span>
                                  <div className="flex items-center gap-4">
                                    <span>{set.reps} reps</span>
                                    {set.weight && <span>{set.weight} kg</span>}
                                    <Badge
                                      variant={
                                        set.completed ? "default" : "secondary"
                                      }
                                      className={
                                        set.completed
                                          ? "bg-green-100 text-green-700"
                                          : "bg-gray-100 text-gray-600"
                                      }
                                    >
                                      {set.completed ? "✓" : "○"}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {(!workout.exercises || workout.exercises.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <Dumbbell className="size-12 mx-auto mb-2 opacity-50" />
              <p>No exercises recorded for this workout</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
