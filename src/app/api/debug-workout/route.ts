import { debugWorkoutData } from "@/actions/debug-workout-data";
import { checkDatabaseStructure } from "@/actions/check-database-structure";
import { updateWorkoutsToCompleted } from "@/actions/update-workouts-completed";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // First update all workouts to completed
    const updateResult = await updateWorkoutsToCompleted();

    // Then check database structure
    const dbStructure = await checkDatabaseStructure();

    // Test with a known user ID - we'll use "1" as it's likely in the seeded data
    const userId = "Z4Sy0hWJkkUDr17Q8493RSQQAGxyDjUE"; // Use the actual user ID from the debug output
    const debugData = await debugWorkoutData(userId);

    return NextResponse.json({
      success: true,
      userId,
      updateResult,
      dbStructure,
      debugData,
    });
  } catch (error) {
    console.error("Debug API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
