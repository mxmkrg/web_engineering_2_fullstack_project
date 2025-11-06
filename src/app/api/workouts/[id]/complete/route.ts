import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-server";
import { db } from "@/db";
import { workout } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const workoutId = parseInt(id);

    if (isNaN(workoutId)) {
      return NextResponse.json(
        { success: false, error: "Invalid workout ID" },
        { status: 400 },
      );
    }

    // Fetch workout to get createdAt time
    const [workoutData] = await db
      .select()
      .from(workout)
      .where(eq(workout.id, workoutId))
      .limit(1);

    if (!workoutData) {
      return NextResponse.json(
        { success: false, error: "Workout not found" },
        { status: 404 },
      );
    }

    // Calculate duration in minutes
    const now = new Date();
    const createdAt = new Date(workoutData.createdAt);
    const durationMinutes = Math.floor(
      (now.getTime() - createdAt.getTime()) / 60000,
    );

    // Update workout status to completed
    await db
      .update(workout)
      .set({
        status: "completed",
        duration: durationMinutes,
        updatedAt: now,
      })
      .where(eq(workout.id, workoutId));

    return NextResponse.json(
      {
        success: true,
        duration: durationMinutes,
        message: `Workout completed! Duration: ${durationMinutes} minutes`,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error completing workout:", error);
    return NextResponse.json(
      { success: false, error: "Failed to complete workout" },
      { status: 500 },
    );
  }
}
