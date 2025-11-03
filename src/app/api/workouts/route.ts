import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-server"
import { db } from "@/db"
import { workout } from "@/db/schema"
import { eq, desc } from "drizzle-orm"

export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      )
    }

    // Fetch recent workouts for the user
    const recentWorkouts = await db
      .select()
      .from(workout)
      .where(eq(workout.userId, session.user.id))
      .orderBy(desc(workout.date))
      .limit(5)

    return NextResponse.json(
      { 
        success: true, 
        workouts: recentWorkouts 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching workouts:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch workouts" },
      { status: 500 }
    )
  }
}

