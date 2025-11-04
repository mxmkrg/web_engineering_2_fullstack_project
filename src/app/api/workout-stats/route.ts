import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-server";
import { getWorkoutStatistics } from "@/lib/workout-stats";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getWorkoutStatistics(session.user.id);

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching workout statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch workout statistics" },
      { status: 500 },
    );
  }
}
