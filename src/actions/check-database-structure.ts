"use server";

import "server-only";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function checkDatabaseStructure() {
  try {
    // Get all tables
    const tables = await db.all(
      sql`SELECT name FROM sqlite_master WHERE type='table';`,
    );
    console.log("🗄️ Tables:", tables);

    // Check workout table structure
    const workoutTableInfo = await db.all(sql`PRAGMA table_info(workout);`);
    console.log("🏋️ Workout table structure:", workoutTableInfo);

    // Check if we have any data at all
    const userCount = await db.all(sql`SELECT COUNT(*) as count FROM user;`);
    console.log("👥 Users count:", userCount);

    const workoutCount = await db.all(
      sql`SELECT COUNT(*) as count FROM workout;`,
    );
    console.log("🏋️ Workouts count:", workoutCount);

    const exerciseCount = await db.all(
      sql`SELECT COUNT(*) as count FROM exercise;`,
    );
    console.log("💪 Exercises count:", exerciseCount);

    // Let's see a few workouts if any
    const sampleWorkouts = await db.all(sql`SELECT * FROM workout LIMIT 5;`);
    console.log("🏋️ Sample workouts:", sampleWorkouts);

    return {
      success: true,
      tables,
      workoutTableInfo,
      userCount,
      workoutCount,
      exerciseCount,
      sampleWorkouts,
    };
  } catch (error) {
    console.error("Database check error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
