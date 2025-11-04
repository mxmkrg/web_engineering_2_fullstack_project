"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { WorkoutDetailDialog } from "./workout-detail-dialog";
import { getWorkoutDetails } from "@/actions/get-workout-details";

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

  // Generate calendar days
  const daysInMonth = lastDayOfMonth.getDate();
  const calendarDays: (number | null)[] = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayWeekday; i++) {
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
    if (dayWorkouts.length === 0) return;

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

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Count workouts in current month
  const currentMonthWorkouts = workouts.filter((workout) => {
    const workoutMonth = workout.date.getMonth();
    const workoutYear = workout.date.getFullYear();
    return workoutMonth === currentMonth && workoutYear === currentYear;
  }).length;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="size-5 text-blue-600" />
          Workout Calendar
        </h2>
        <button
          onClick={goToToday}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Today
        </button>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft className="size-4" />
        </button>

        <h3 className="text-lg font-medium">
          {monthNames[currentMonth]} {currentYear}
          {currentMonthWorkouts > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({currentMonthWorkouts} workout
              {currentMonthWorkouts !== 1 ? "s" : ""})
            </span>
          )}
        </h3>

        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Day names header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((dayName) => (
          <div
            key={dayName}
            className="h-8 flex items-center justify-center text-sm font-medium text-gray-500"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={index} className="h-10" />;
          }

          const dayWorkouts = getDayWorkouts(day);
          const hasWorkouts = dayWorkouts.length > 0;
          const isToday =
            new Date().toDateString() ===
            new Date(currentYear, currentMonth, day).toDateString();

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              disabled={!hasWorkouts || isLoadingWorkout}
              title={
                hasWorkouts ? dayWorkouts.map((w) => w.name).join(", ") : ""
              }
              className={`
                h-10 flex items-center justify-center text-sm rounded-lg transition-colors relative
                ${
                  hasWorkouts
                    ? `bg-blue-600 text-white hover:bg-blue-700 cursor-pointer ${isLoadingWorkout ? "opacity-50" : ""}`
                    : "hover:bg-gray-100 cursor-default"
                }
                ${isToday && !hasWorkouts ? "bg-gray-200 font-semibold" : ""}
                ${isToday && hasWorkouts ? "ring-2 ring-blue-300" : ""}
              `}
            >
              {day}
              {hasWorkouts && dayWorkouts.length > 1 && (
                <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {dayWorkouts.length}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-600 rounded"></div>
          <span>Workout day</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-200 rounded"></div>
          <span>Today</span>
        </div>
      </div>

      {/* Workout Detail Dialog */}
      {selectedWorkout && (
        <WorkoutDetailDialog
          workout={selectedWorkout}
          isOpen={!!selectedWorkout}
          onClose={() => setSelectedWorkout(null)}
          onEdit={(workoutId) => {
            // Handle edit - could navigate to edit page or show edit modal
            console.log("Edit workout:", workoutId);
            setSelectedWorkout(null);
          }}
          onDelete={(workoutId) => {
            // Handle delete - could show confirmation and delete workout
            console.log("Delete workout:", workoutId);
            setSelectedWorkout(null);
          }}
        />
      )}
    </div>
  );
}
