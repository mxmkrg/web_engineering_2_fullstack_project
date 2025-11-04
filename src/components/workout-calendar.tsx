"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
} from "lucide-react";
import { format, isSameDay, startOfMonth, endOfMonth } from "date-fns";

interface Workout {
  id: string;
  name: string;
  date: number;
  duration?: number;
  notes?: string;
}

interface WorkoutCalendarProps {
  workouts: Workout[];
  onWorkoutSelect?: (workout: Workout) => void;
  onViewChange?: (view: "calendar" | "list") => void;
  currentView?: "calendar" | "list";
}

export function WorkoutCalendar({
  workouts,
  onWorkoutSelect,
  onViewChange,
  currentView = "calendar",
}: WorkoutCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedWorkouts, setSelectedWorkouts] = useState<Workout[]>([]);

  // Get workouts for specific dates
  const getWorkoutsForDate = (date: Date): Workout[] => {
    if (!Array.isArray(workouts)) return [];
    return workouts.filter((workout) =>
      isSameDay(new Date(workout.date), date),
    );
  };

  // Get all workout dates in current month
  const getWorkoutDatesInMonth = (month: Date): Date[] => {
    if (!Array.isArray(workouts)) return [];

    const start = startOfMonth(month);
    const end = endOfMonth(month);

    return workouts
      .map((workout) => new Date(workout.date))
      .filter((date) => date >= start && date <= end)
      .filter(
        (date, index, self) =>
          self.findIndex((d) => isSameDay(d, date)) === index,
      );
  };
  const workoutDates = getWorkoutDatesInMonth(currentMonth);

  // Debug log to see what data we have
  console.log("WorkoutCalendar Debug:", {
    workouts: workouts.length,
    currentMonth: currentMonth.toDateString(),
    workoutDates: workoutDates.length,
    sampleWorkout: workouts[0],
  });

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    setSelectedDate(date);
    const workoutsForDate = getWorkoutsForDate(date);
    setSelectedWorkouts(workoutsForDate);

    // Don't automatically navigate to workout details anymore
    // Just update the selected date and workouts in sidebar
  }; // Handle month navigation
  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(
      currentMonth.getMonth() + (direction === "next" ? 1 : -1),
    );
    setCurrentMonth(newMonth);
  };

  // Update selected workouts when date changes
  useEffect(() => {
    const workoutsForDate = getWorkoutsForDate(selectedDate);
    setSelectedWorkouts(workoutsForDate);
  }, [workouts, selectedDate]);

  const formatMonth = (date: Date) => format(date, "MMMM yyyy");

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">Workout Calendar</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant={currentView === "calendar" ? "default" : "outline"}
              size="sm"
              onClick={() => onViewChange?.("calendar")}
            >
              <CalendarIcon className="size-4 mr-2" />
              Calendar
            </Button>
            <Button
              variant={currentView === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => onViewChange?.("list")}
            >
              <List className="size-4 mr-2" />
              List
            </Button>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth("prev")}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-lg font-medium min-w-[150px] text-center">
            {formatMonth(currentMonth)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth("next")}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="[&_button]:!w-full [&_button]:!h-full [&_button]:!block [&_td]:p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  className="w-full"
                  weekStartsOn={1}
                  showOutsideDays={false}
                  modifiers={{
                    workout: workoutDates,
                  }}
                  modifiersStyles={{
                    workout: {
                      backgroundColor: "#3b82f6",
                      color: "white",
                      fontWeight: "bold",
                      borderRadius: "6px",
                    },
                  }}
                  modifiersClassNames={{
                    workout:
                      "bg-blue-600 text-white hover:bg-blue-700 font-bold",
                  }}
                  classNames={{
                    day_selected:
                      "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700",
                    day_today:
                      "bg-blue-100 text-blue-900 font-bold border border-blue-300",
                    head_cell:
                      "text-gray-500 font-medium text-sm w-9 text-center",
                    cell: "h-9 w-9 text-center text-sm p-0 relative cursor-pointer",
                    day: "h-9 w-9 p-0 font-normal hover:bg-gray-100 rounded-md text-center leading-9",
                  }}
                />
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center space-x-4 mt-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-600 rounded"></div>
                  <span className="text-sm text-gray-600">Workout Day</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                  <span className="text-sm text-gray-600">Today</span>
                </div>
                <div className="text-xs text-gray-500">
                  Click any day to view workouts
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Details */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Click on calendar days to see workouts for that date
              </p>
            </CardHeader>
            <CardContent>
              {selectedWorkouts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No workouts on this day
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedWorkouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-all duration-200 group"
                      onClick={() => onWorkoutSelect?.(workout)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 group-hover:text-blue-700">
                          {workout.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          {workout.duration && (
                            <Badge variant="secondary">
                              {workout.duration}m
                            </Badge>
                          )}
                          <div className="text-xs text-gray-400 group-hover:text-blue-500">
                            Click for details →
                          </div>
                        </div>
                      </div>
                      {workout.notes && (
                        <p
                          className="text-sm text-gray-600 overflow-hidden text-ellipsis"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {workout.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Month Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {formatMonth(currentMonth)} Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Workouts:</span>
                  <span className="font-medium">
                    {getWorkoutDatesInMonth(currentMonth).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Duration:</span>
                  <span className="font-medium">
                    {Array.isArray(workouts)
                      ? workouts
                          .filter((w) => {
                            const workoutDate = new Date(w.date);
                            const start = startOfMonth(currentMonth);
                            const end = endOfMonth(currentMonth);
                            return workoutDate >= start && workoutDate <= end;
                          })
                          .reduce((sum, w) => sum + (w.duration || 0), 0)
                      : 0}
                    m
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
