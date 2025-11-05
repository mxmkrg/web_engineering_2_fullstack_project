import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-server";
import { db } from "@/db";
import { workout } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
    }

    // Get limit from URL search params
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "10");

    // Fetch recent workouts for the user
    const recentWorkouts = await db
      .select()
      .from(workout)
      .where(eq(workout.userId, session.user.id))
      .orderBy(desc(workout.date))
      .limit(limit);

    return NextResponse.json(
      {
        success: true,
        workouts: recentWorkouts,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching workouts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch workouts" },
      { status: 500 },
    );
  }
}
