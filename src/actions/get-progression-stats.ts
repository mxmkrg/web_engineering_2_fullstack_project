"use server";

import "server-only";
import { db } from "@/db";
import { workout, workoutExercise, workoutSet, exercise } from "@/db/schema";
import { eq, desc, and, sql, gte, lte, inArray } from "drizzle-orm";

export interface DateFilter {
  type: "all-time" | "preset" | "month" | "custom";
  startDate?: Date;
  endDate?: Date;
  label: string;
}

function buildDateFilterConditions(
  userId: string,
  dateFilter?: DateFilter,
  includePlanned: boolean = false,
) {
  const statuses = includePlanned ? ["completed", "planned"] : ["completed"];
  const baseConditions = [
    eq(workout.userId, userId),
    inArray(workout.status, statuses),
  ];

  if (
    dateFilter &&
    dateFilter.type !== "all-time" &&
    dateFilter.startDate &&
    dateFilter.endDate
  ) {
    baseConditions.push(
      gte(workout.date, dateFilter.startDate),
      lte(workout.date, dateFilter.endDate),
    );
  }

  return baseConditions;
}

export interface ExerciseProgression {
  exerciseId: number;
  exerciseName: string;
  category: string;
  muscleGroups: string[];
  dataPoints: {
    date: Date;
    maxWeight: number;
    volume: number; // sets * reps * weight
    sets: number;
    totalReps: number;
    averageReps: number;
  }[];
  personalRecords: {
    maxWeight: number;
    maxVolume: number;
    bestSet: {
      weight: number;
      reps: number;
      date: Date;
    };
  };
  progression: {
    weightIncrease: number; // percentage
    volumeIncrease: number; // percentage
    consistency: number; // how often this exercise is performed
  };
}

export interface MuscleGroupStats {
  category: string;
  totalVolume: number;
  averageVolume: number;
  workoutCount: number;
  exercises: string[];
  progression: {
    volumeChange: number; // percentage change over time
    trend: "increasing" | "decreasing" | "stable";
  };
  balance: {
    percentageOfTotal: number;
    isUnderTrained: boolean;
    isOverTrained: boolean;
  };
}

export interface PersonalRecord {
  id: number;
  exerciseName: string;
  category: string;
  type: "weight" | "volume" | "reps";
  value: number;
  previousValue?: number;
  improvement: number; // percentage
  date: Date;
  workoutId: number;
}

export interface ProgressionOverview {
  totalWorkouts: number;
  completedWorkouts: number;
  totalExercises: number;
  thisWeekWorkouts: number;
  totalVolume?: number;
  averageWorkoutDuration?: number;
  mostImprovedExercise?: {
    name: string;
    improvement: number;
  };
  consistencyScore?: number; // percentage based on workout frequency
  strengthBalance?: {
    pushPullRatio: number;
    upperLowerRatio: number;
  };
  recentTrend?: "improving" | "plateauing" | "declining";
}

export async function getExerciseProgression(
  userId: string,
  exerciseId?: number,
  dateFilter?: DateFilter,
): Promise<ExerciseProgression[]> {
  const baseConditions = [
    eq(workout.userId, userId),
    eq(workout.status, "completed"),
    eq(workoutSet.completed, true),
    exerciseId ? eq(exercise.id, exerciseId) : sql`1=1`,
  ];

  // Add date filter conditions
  if (
    dateFilter &&
    dateFilter.type !== "all-time" &&
    dateFilter.startDate &&
    dateFilter.endDate
  ) {
    baseConditions.push(
      gte(workout.date, dateFilter.startDate),
      lte(workout.date, dateFilter.endDate),
    );
  }

  const query = db
    .select({
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      category: exercise.category,
      muscleGroups: exercise.muscleGroups,
      workoutDate: workout.date,
      workoutId: workout.id,
      setId: workoutSet.id,
      weight: workoutSet.weight,
      reps: workoutSet.reps,
      completed: workoutSet.completed,
    })
    .from(workout)
    .innerJoin(workoutExercise, eq(workout.id, workoutExercise.workoutId))
    .innerJoin(exercise, eq(workoutExercise.exerciseId, exercise.id))
    .innerJoin(workoutSet, eq(workoutExercise.id, workoutSet.workoutExerciseId))
    .where(and(...baseConditions))
    .orderBy(desc(workout.date));

  const results = await query;

  // Group by exercise
  const exerciseGroups = results.reduce(
    (acc, row) => {
      const key = row.exerciseId;
      if (!acc[key]) {
        acc[key] = {
          exerciseId: row.exerciseId,
          exerciseName: row.exerciseName,
          category: row.category,
          muscleGroups: row.muscleGroups.split(","),
          workouts: new Map(),
        };
      }

      const workoutKey = row.workoutId;
      if (!acc[key].workouts.has(workoutKey)) {
        acc[key].workouts.set(workoutKey, {
          date: new Date(row.workoutDate),
          sets: [],
        });
      }

      acc[key].workouts.get(workoutKey).sets.push({
        weight: row.weight || 0,
        reps: row.reps || 0,
      });

      return acc;
    },
    {} as Record<number, any>,
  );

  // Process each exercise's progression
  return Object.values(exerciseGroups).map((group: any) => {
    const workouts = Array.from(group.workouts.values()).sort(
      (a: any, b: any) => a.date.getTime() - b.date.getTime(),
    );

    const dataPoints = workouts.map((workout: any) => {
      const maxWeight = Math.max(...workout.sets.map((s: any) => s.weight));
      const totalVolume = workout.sets.reduce(
        (sum: number, set: any) => sum + set.weight * set.reps,
        0,
      );
      const totalReps = workout.sets.reduce(
        (sum: number, set: any) => sum + set.reps,
        0,
      );

      return {
        date: workout.date,
        maxWeight,
        volume: totalVolume,
        sets: workout.sets.length,
        totalReps,
        averageReps: totalReps / workout.sets.length,
      };
    });

    // Calculate personal records
    const maxWeight = Math.max(...dataPoints.map((d) => d.maxWeight));
    const maxVolume = Math.max(...dataPoints.map((d) => d.volume));
    const allSets = workouts.flatMap((w: any) => w.sets);
    const bestSet =
      allSets.length > 0
        ? allSets.reduce((best: any, set: any) => {
            const score = set.weight * set.reps;
            const bestScore = best.weight * best.reps;
            return score > bestScore ? set : best;
          })
        : { weight: 0, reps: 0 };

    // Calculate progression
    const firstData = dataPoints[0];
    const lastData = dataPoints[dataPoints.length - 1];
    const weightIncrease =
      firstData && lastData
        ? ((lastData.maxWeight - firstData.maxWeight) / firstData.maxWeight) *
          100
        : 0;
    const volumeIncrease =
      firstData && lastData
        ? ((lastData.volume - firstData.volume) / firstData.volume) * 100
        : 0;

    return {
      exerciseId: group.exerciseId,
      exerciseName: group.exerciseName,
      category: group.category,
      muscleGroups: group.muscleGroups,
      dataPoints,
      personalRecords: {
        maxWeight,
        maxVolume,
        bestSet: {
          weight: bestSet.weight,
          reps: bestSet.reps,
          date:
            dataPoints.length > 0
              ? dataPoints[dataPoints.length - 1].date
              : new Date(),
        },
      },
      progression: {
        weightIncrease: Math.round(weightIncrease * 100) / 100,
        volumeIncrease: Math.round(volumeIncrease * 100) / 100,
        consistency: (dataPoints.length / 12) * 100, // Assuming 12 weeks of data
      },
    };
  });
}

export async function getMuscleGroupStats(
  userId: string,
  dateFilter?: DateFilter,
): Promise<MuscleGroupStats[]> {
  const exerciseProgression = await getExerciseProgression(
    userId,
    undefined,
    dateFilter,
  );

  // Group by muscle group/category
  const muscleGroups = exerciseProgression.reduce(
    (acc, exercise) => {
      const category = exercise.category;

      if (!acc[category]) {
        acc[category] = {
          category,
          exercises: [],
          totalVolume: 0,
          workoutCount: 0,
          dataPoints: [],
        };
      }

      acc[category].exercises.push(exercise.exerciseName);
      acc[category].totalVolume += exercise.dataPoints.reduce(
        (sum, point) => sum + point.volume,
        0,
      );
      acc[category].workoutCount += exercise.dataPoints.length;
      acc[category].dataPoints.push(...exercise.dataPoints);

      return acc;
    },
    {} as Record<string, any>,
  );

  const totalVolumeAcrossAll = Object.values(muscleGroups).reduce(
    (sum: number, group: any) => sum + group.totalVolume,
    0,
  );

  return Object.values(muscleGroups).map((group: any) => {
    const averageVolume = group.totalVolume / (group.workoutCount || 1);
    const percentageOfTotal = (group.totalVolume / totalVolumeAcrossAll) * 100;

    // Calculate trend (simple: compare first half vs second half)
    const sortedData = group.dataPoints.sort(
      (a: any, b: any) => a.date.getTime() - b.date.getTime(),
    );
    const midPoint = Math.floor(sortedData.length / 2);
    const firstHalf = sortedData.slice(0, midPoint);
    const secondHalf = sortedData.slice(midPoint);

    const firstHalfAvg =
      firstHalf.reduce((sum: number, d: any) => sum + d.volume, 0) /
        firstHalf.length || 0;
    const secondHalfAvg =
      secondHalf.reduce((sum: number, d: any) => sum + d.volume, 0) /
        secondHalf.length || 0;

    const volumeChange =
      firstHalfAvg > 0
        ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100
        : 0;

    let trend: "increasing" | "decreasing" | "stable" = "stable";
    if (volumeChange > 5) trend = "increasing";
    else if (volumeChange < -5) trend = "decreasing";

    return {
      category: group.category,
      totalVolume: group.totalVolume,
      averageVolume: Math.round(averageVolume),
      workoutCount: group.workoutCount,
      exercises: group.exercises,
      progression: {
        volumeChange: Math.round(volumeChange * 100) / 100,
        trend,
      },
      balance: {
        percentageOfTotal: Math.round(percentageOfTotal * 100) / 100,
        isUnderTrained: percentageOfTotal < 10, // Less than 10% might be undertrained
        isOverTrained: percentageOfTotal > 40, // More than 40% might be overtrained
      },
    };
  });
}

export async function getPersonalRecords(
  userId: string,
  dateFilter?: DateFilter,
): Promise<PersonalRecord[]> {
  // This would require a more complex query to track PRs over time
  // For now, we'll derive from the exercise progression data
  const exerciseProgression = await getExerciseProgression(
    userId,
    undefined,
    dateFilter,
  );

  const records: PersonalRecord[] = [];

  exerciseProgression.forEach((exercise) => {
    // Weight PR
    const weightRecord = {
      id: exercise.exerciseId * 1000 + 1,
      exerciseName: exercise.exerciseName,
      category: exercise.category,
      type: "weight" as const,
      value: exercise.personalRecords.maxWeight,
      improvement: exercise.progression.weightIncrease,
      date: exercise.personalRecords.bestSet.date,
      workoutId: 0, // Would need to track this properly
    };

    // Volume PR
    const volumeRecord = {
      id: exercise.exerciseId * 1000 + 2,
      exerciseName: exercise.exerciseName,
      category: exercise.category,
      type: "volume" as const,
      value: exercise.personalRecords.maxVolume,
      improvement: exercise.progression.volumeIncrease,
      date: exercise.personalRecords.bestSet.date,
      workoutId: 0,
    };

    records.push(weightRecord, volumeRecord);
  });

  return records.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function getProgressionOverview(
  userId: string,
  dateFilter?: DateFilter,
): Promise<ProgressionOverview> {
  try {
    const dateConditions = buildDateFilterConditions(userId, dateFilter);

    // Get total workouts for the filtered period
    const totalWorkouts = await db
      .select({ count: sql<number>`count(*)` })
      .from(workout)
      .where(and(...dateConditions));

    // Get completed workouts (should be same as total since we filter by completed)
    const completedWorkouts = await db
      .select({ count: sql<number>`count(*)` })
      .from(workout)
      .where(and(...dateConditions));

    // Get total exercises (from filtered workouts)
    const totalExercises = await db
      .select({
        count: sql<number>`count(distinct ${workoutExercise.exerciseId})`,
      })
      .from(workoutExercise)
      .leftJoin(workout, eq(workoutExercise.workoutId, workout.id))
      .where(and(...dateConditions));

    // Get current week workouts (or filtered period workouts)
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // For this week, ignore date filter and always show this week
    const thisWeekWorkouts = await db
      .select({ count: sql<number>`count(*)` })
      .from(workout)
      .where(
        and(
          eq(workout.userId, userId),
          eq(workout.status, "completed"),
          gte(workout.date, new Date(startOfWeek.getTime())),
        ),
      );

    return {
      totalWorkouts: Number(totalWorkouts[0]?.count || 0),
      completedWorkouts: Number(completedWorkouts[0]?.count || 0),
      totalExercises: Number(totalExercises[0]?.count || 0),
      thisWeekWorkouts: Number(thisWeekWorkouts[0]?.count || 0),
    };
  } catch (error) {
    console.error("Error getting progression overview:", error);
    return {
      totalWorkouts: 0,
      completedWorkouts: 0,
      totalExercises: 0,
      thisWeekWorkouts: 0,
    };
  }
}
