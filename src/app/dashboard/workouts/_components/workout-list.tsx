"use client";

import { useState, useEffect } from "react";
import { getWorkouts } from "@/actions/get-workouts";
import { getWorkoutDetails } from "@/actions/get-workout-details";
import { deleteWorkout } from "@/actions/delete-workout";
import { format } from "date-fns";
import { Calendar, Clock, Archive, Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { WorkoutDetailDialog } from "./workout-detail-dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface WorkoutListProps {
  userId: string;
  initialWorkouts: Workout[];
  activeFilter?: string;
}

type Workout = {
  id: number;
  name: string;
  status: string;
  date: Date;
  duration: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

export function WorkoutList({
  userId,
  initialWorkouts,
  activeFilter = "all",
}: WorkoutListProps) {
  const [workouts, setWorkouts] = useState<Workout[]>(initialWorkouts || []);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Update workouts state when initialWorkouts prop changes
  useEffect(() => {
    setWorkouts(initialWorkouts || []);
  }, [initialWorkouts]);

  // Filter workouts based on activeFilter
  const filteredWorkouts = workouts.filter((workout) => {
    if (activeFilter === "all") return true;

    const workoutDate = new Date(workout.date);
    const now = new Date();

    switch (activeFilter) {
      case "week":
        // Fix timezone issue by using date strings instead of modifying date objects
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
        const currentDay = today.getDay();
        const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
        const startOfWeek = new Date(
          today.getTime() - daysFromMonday * 24 * 60 * 60 * 1000,
        );

        const workoutDateOnly = new Date(
          workoutDate.getFullYear(),
          workoutDate.getMonth(),
          workoutDate.getDate(),
        );
        return workoutDateOnly >= startOfWeek;

      case "month":
        // Fix timezone issue for month comparison
        const workoutMonth = workoutDate.getMonth();
        const workoutYear = workoutDate.getFullYear();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return (
          workoutYear > currentYear ||
          (workoutYear === currentYear && workoutMonth >= currentMonth)
        );

      case "duration":
        // For duration filter, show workouts with above-average duration
        const avgDuration =
          workouts.reduce((sum, w) => sum + (w.duration || 0), 0) /
          workouts.length;
        return (workout.duration || 0) >= avgDuration;

      default:
        return true;
    }
  });

  const handleWorkoutClick = async (workout: Workout) => {
    setIsLoading(true);
    try {
      const result = await getWorkoutDetails(workout.id);
      if (result.success && result.workout) {
        setSelectedWorkout(result.workout);
        setIsDetailOpen(true);
      } else {
        toast.error(result.error || "Failed to load workout details");
      }
    } catch (error) {
      toast.error("Error loading workout details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (workoutId: number) => {
    router.push(`/dashboard/workouts/${workoutId}/edit`);
  };

  const handleDelete = async (workoutId: number) => {
    try {
      const result = await deleteWorkout(workoutId);
      if (result.success) {
        setWorkouts(workouts.filter((w) => w.id !== workoutId));
        toast.success("Workout deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete workout");
      }
    } catch (error) {
      toast.error("Error deleting workout");
    }
  };

  const handleEditClick = (e: React.MouseEvent, workoutId: number) => {
    e.stopPropagation();
    router.push(`/dashboard/workouts/${workoutId}/edit`);
  };

  const handleDeleteClick = async (e: React.MouseEvent, workout: Workout) => {
    e.stopPropagation();
    if (
      confirm(
        `Are you sure you want to delete "${workout.name}"? This action cannot be undone.`,
      )
    ) {
      try {
        const result = await deleteWorkout(workout.id);
        if (result.success) {
          setWorkouts(workouts.filter((w) => w.id !== workout.id));
          toast.success("Workout deleted successfully");
        } else {
          toast.error(result.error || "Failed to delete workout");
        }
      } catch (error) {
        toast.error("Error deleting workout");
      }
    }
  };

  if (filteredWorkouts.length === 0) {
    return (
      <div className="text-center py-8">
        <Archive className="size-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {activeFilter === "all" ? "No Workouts Yet" : "No Workouts Found"}
        </h3>
        <p className="text-muted-foreground">
          {activeFilter === "all"
            ? "Start your fitness journey! Create your first workout."
            : "No workouts found for the selected time period."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {filteredWorkouts.map((workout: Workout) => (
          <Card
            key={workout.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleWorkoutClick(workout)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Archive className="size-4 text-green-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">
                        {workout.name}
                      </h3>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Saved
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-4" />
                        {format(new Date(workout.date), "PPP")}
                      </div>
                      {workout.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="size-4" />
                          {workout.duration} minutes
                        </div>
                      )}
                    </div>
                    {workout.notes && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {workout.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleEditClick(e, workout.id)}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                    title="Edit Workout"
                    type="button"
                  >
                    <Edit className="size-4" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, workout)}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                    title="Delete Workout"
                    type="button"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <WorkoutDetailDialog
        workout={selectedWorkout}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </>
  );
}
