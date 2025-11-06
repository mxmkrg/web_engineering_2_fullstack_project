import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { userProfile } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getCurrentUser } from "@/lib/auth-server"

// GET: Fetch user profile
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const profile = await db.query.userProfile.findFirst({
      where: eq(userProfile.userId, user.id),
    })

    return NextResponse.json({
      success: true,
      profile: profile || null,
    })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

// POST: Create or update user profile
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Check if profile exists
    const existingProfile = await db.query.userProfile.findFirst({
      where: eq(userProfile.userId, user.id),
    })

    const profileData = {
      userId: user.id,
      age: body.age || null,
      gender: body.gender || null,
      heightCm: body.heightCm || null,
      weightKg: body.weightKg || null,
      trainingGoal: body.trainingGoal || null,
      trainingDaysPerWeek: body.trainingDaysPerWeek || null,
      sessionDurationMinutes: body.sessionDurationMinutes || null,
      exerciseLimitations: body.exerciseLimitations || null,
    }

    let result

    if (existingProfile) {
      // Update existing profile
      result = await db
        .update(userProfile)
        .set({
          ...profileData,
          updatedAt: new Date(),
        })
        .where(eq(userProfile.userId, user.id))
        .returning()
    } else {
      // Create new profile
      result = await db
        .insert(userProfile)
        .values(profileData)
        .returning()
    }

    return NextResponse.json({
      success: true,
      profile: result[0],
    })
  } catch (error) {
    console.error("Error saving profile:", error)
    return NextResponse.json(
      { success: false, error: "Failed to save profile" },
      { status: 500 }
    )
  }
}

