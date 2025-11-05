"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Dumbbell,
  Edit,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { getWorkoutDetails } from "@/actions/get-workout-details";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type BasicWorkout = {
  id: number;
  name: string;
  status: string;
  date: Date;
  duration: number | null;
  notes: string | null;
};

type DetailedWorkout = {
  id: number;
  name: string;
  status: string;
  date: Date;
  duration: number | null;
  notes: string | null;
  exercises: Array<{
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
};

type WorkoutCalendarProps = {
  workouts: BasicWorkout[];
};

export function WorkoutCalendar({ workouts }: WorkoutCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedWorkout, setSelectedWorkout] =
    useState<DetailedWorkout | null>(null);
  const [isLoadingWorkout, setIsLoadingWorkout] = useState(false);

  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get first day of the month and last day of the month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay(); // 0 = Sunday

  // Adjust for Monday start (0 = Sunday, 1 = Monday, etc.)
  const mondayAdjustedFirstDay =
    firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;

  // Generate calendar days
  const daysInMonth = lastDayOfMonth.getDate();
  const calendarDays: (number | null)[] = [];

  // Add empty cells for days before the first day of the month (Monday start)
  for (let i = 0; i < mondayAdjustedFirstDay; i++) {
    calendarDays.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Create a map of workout dates for quick lookup
  const workoutDateMap = new Map<string, BasicWorkout[]>();
  workouts.forEach((workout) => {
    const dateKey = workout.date.toDateString();
    if (!workoutDateMap.has(dateKey)) {
      workoutDateMap.set(dateKey, []);
    }
    workoutDateMap.get(dateKey)!.push(workout);
  });

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Check if a day has workouts
  const getDayWorkouts = (day: number): BasicWorkout[] => {
    const date = new Date(currentYear, currentMonth, day);
    const dateKey = date.toDateString();
    return workoutDateMap.get(dateKey) || [];
  };

  // Handle day click
  const handleDayClick = async (day: number) => {
    const dayWorkouts = getDayWorkouts(day);
    if (dayWorkouts.length === 0) {
      setSelectedWorkout(null);
      return;
    }

    // For now, get details for the first workout if multiple workouts on same day
    const workoutToShow = dayWorkouts[0];

    setIsLoadingWorkout(true);
    try {
      const result = await getWorkoutDetails(workoutToShow.id);
      if (result.success && result.workout) {
        setSelectedWorkout(result.workout as DetailedWorkout);
      } else {
        console.error("Failed to load workout details:", result.error);
        // Fallback: show basic workout data
        setSelectedWorkout({
          ...workoutToShow,
          exercises: [],
        });
      }
    } catch (error) {
      console.error("Error loading workout details:", error);
      // Fallback: show basic workout data
      setSelectedWorkout({
        ...workoutToShow,
        exercises: [],
      });
    } finally {
      setIsLoadingWorkout(false);
    }
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Day names starting with Monday
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Count workouts in current month
  const currentMonthWorkouts = workouts.filter((workout) => {
    const workoutMonth = workout.date.getMonth();
    const workoutYear = workout.date.getFullYear();
    return workoutMonth === currentMonth && workoutYear === currentYear;
  }).length;

  return (
    <div className="flex gap-6">
      {/* Calendar Section - Made smaller */}
      <div
        className="bg-white rounded-lg shadow p-4 flex-shrink-0"
        style={{ width: "400px" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="size-4 text-blue-600" />
            Workout Calendar
          </h2>
          <button
            onClick={goToToday}
            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Today
          </button>
        </div>

        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={goToPreviousMonth}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="size-4" />
          </button>

          <h3 className="text-base font-medium">
            {monthNames[currentMonth]} {currentYear}
            {currentMonthWorkouts > 0 && (
              <span className="ml-1 text-xs font-normal text-gray-500">
                ({currentMonthWorkouts})
              </span>
            )}
          </h3>

          <button
            onClick={goToNextMonth}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Day names header - Monday start */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((dayName) => (
            <div
              key={dayName}
              className="h-6 flex items-center justify-center text-xs font-medium text-gray-500"
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Calendar grid - smaller cells */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={index} className="h-8" />;
            }

            const dayWorkouts = getDayWorkouts(day);
            const hasWorkouts = dayWorkouts.length > 0;
            const isToday =
              new Date().toDateString() ===
              new Date(currentYear, currentMonth, day).toDateString();
            const isSelected =
              selectedWorkout &&
              selectedWorkout.date.toDateString() ===
                new Date(currentYear, currentMonth, day).toDateString();

            return (
              <button
                key={index}
                onClick={() => handleDayClick(day)}
                disabled={isLoadingWorkout}
                title={
                  hasWorkouts ? dayWorkouts.map((w) => w.name).join(", ") : ""
                }
                className={`
                  h-8 flex items-center justify-center text-xs rounded transition-colors relative
                  ${
                    hasWorkouts
                      ? `bg-blue-600 text-white hover:bg-blue-700 cursor-pointer ${isLoadingWorkout ? "opacity-50" : ""}`
                      : "hover:bg-gray-100 cursor-pointer"
                  }
                  ${isToday && !hasWorkouts ? "bg-gray-200 font-semibold" : ""}
                  ${isToday && hasWorkouts ? "ring-2 ring-blue-300" : ""}
                  ${isSelected ? "ring-2 ring-purple-400" : ""}
                `}
              >
                {day}
                {hasWorkouts && dayWorkouts.length > 1 && (
                  <div className="absolute -top-0.5 -right-0.5 bg-yellow-400 text-yellow-900 text-xs rounded-full w-3 h-3 flex items-center justify-center font-bold text-[10px]">
                    {dayWorkouts.length}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend - smaller */}
        <div className="mt-3 flex items-center gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-600 rounded"></div>
            <span>Workout</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-200 rounded"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 border-2 border-purple-400 rounded"></div>
            <span>Selected</span>
          </div>
        </div>
      </div>

      {/* Workout Details Panel */}
      <div className="flex-1 bg-white rounded-lg shadow p-6">
        {selectedWorkout ? (
          <WorkoutDetailsPanel
            workout={selectedWorkout}
            onEdit={(workoutId) => {
              // Handle edit - could navigate to edit page
              console.log("Edit workout:", workoutId);
            }}
            onDelete={(workoutId) => {
              // Handle delete - could show confirmation and delete workout
              console.log("Delete workout:", workoutId);
              setSelectedWorkout(null);
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Calendar className="size-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium">No workout selected</p>
            <p className="text-sm">
              Click on a workout day in the calendar to view details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Separate component for workout details panel
function WorkoutDetailsPanel({
  workout,
  onEdit,
  onDelete,
}: {
  workout: DetailedWorkout;
  onEdit: (workoutId: number) => void;
  onDelete: (workoutId: number) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {workout.name}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
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
            <Badge variant="secondary" className="capitalize">
              {workout.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(workout.id)}
          >
            <Edit className="size-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(workout.id)}
          >
            <Trash2 className="size-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      {/* Notes */}
      {workout.notes && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
            {workout.notes}
          </p>
        </div>
      )}

      {/* Exercises */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Dumbbell className="size-4" />
          Exercises ({workout.exercises?.length || 0})
        </h4>

        {workout.exercises && workout.exercises.length > 0 ? (
          <div className="space-y-4">
            {workout.exercises.map((exercise) => (
              <div key={exercise.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900">{exercise.name}</h5>
                  <Badge variant="outline">
                    {exercise.sets?.length || 0} sets
                  </Badge>
                </div>

                {exercise.notes && (
                  <p className="text-sm text-gray-600 mb-3 italic">
                    {exercise.notes}
                  </p>
                )}

                {exercise.sets && exercise.sets.length > 0 && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-500 border-b pb-1">
                      <span>Set</span>
                      <span>Reps</span>
                      <span>Weight</span>
                      <span>Status</span>
                    </div>
                    {exercise.sets.map((set) => (
                      <div
                        key={set.id}
                        className="grid grid-cols-4 gap-2 text-sm"
                      >
                        <span>{set.setNumber}</span>
                        <span>{set.reps}</span>
                        <span>{set.weight ? `${set.weight} kg` : "-"}</span>
                        <span>
                          <Badge
                            variant={set.completed ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {set.completed ? "Done" : "Pending"}
                          </Badge>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No exercises recorded</p>
        )}
      </div>
    </div>
  );
}
