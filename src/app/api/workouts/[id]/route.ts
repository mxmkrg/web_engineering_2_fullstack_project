import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-server"
import { db } from "@/db"
import { workout } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      )
    }

    const workoutId = parseInt(params.id)

    if (isNaN(workoutId)) {
      return NextResponse.json(
        { success: false, error: "Invalid workout ID" },
        { status: 400 }
      )
    }

    // Delete the workout (cascade will delete related records)
    await db.delete(workout).where(eq(workout.id, workoutId))

    return NextResponse.json(
      { success: true, message: "Workout deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting workout:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete workout" },
      { status: 500 }
    )
  }
}

