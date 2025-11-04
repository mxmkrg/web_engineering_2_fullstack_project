"use client";

import { useState } from "react";
import { List, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterableWorkoutSection } from "./filterable-workout-section";
import { WorkoutCalendar } from "./workout-calendar";

type WorkoutViewTabsProps = {
  userId: string;
  initialStats: {
    total: number;
    thisWeek: number;
    thisMonth: number;
    avgDuration: number;
  };
  initialWorkouts: Array<{
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
  }>;
};

export function WorkoutViewTabs({ userId, initialStats, initialWorkouts }: WorkoutViewTabsProps) {
  return (
    <Tabs defaultValue="list" className="space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="list" className="flex items-center gap-2">
          <List className="size-4" />
          List View
        </TabsTrigger>
        <TabsTrigger value="calendar" className="flex items-center gap-2">
          <Calendar className="size-4" />
          Calendar View
        </TabsTrigger>
      </TabsList>

      <TabsContent value="list" className="space-y-6">
        <FilterableWorkoutSection 
          userId={userId}
          initialStats={initialStats}
          initialWorkouts={initialWorkouts}
        />
      </TabsContent>

      <TabsContent value="calendar" className="space-y-6">
        <WorkoutCalendar workouts={initialWorkouts} />
      </TabsContent>
    </Tabs>
  );
}