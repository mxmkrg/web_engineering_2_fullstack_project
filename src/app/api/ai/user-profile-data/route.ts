import { NextResponse } from "next/server"
import { db } from "@/db"
import { userProfile } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getCurrentUser } from "@/lib/auth-server"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user profile data
    const profile = await db.select().from(userProfile).where(eq(userProfile.userId, user.id)).limit(1)

    // Format the data for AI context
    const profileData = profile.length > 0 ? profile[0] : null

    const formattedData = {
      hasProfile: !!profileData,
      profile: profileData ? {
        age: profileData.age,
        gender: profileData.gender,
        heightCm: profileData.heightCm,
        weightKg: profileData.weightKg,
        trainingGoal: profileData.trainingGoal,
        trainingDaysPerWeek: profileData.trainingDaysPerWeek,
        sessionDurationMinutes: profileData.sessionDurationMinutes,
        exerciseLimitations: profileData.exerciseLimitations ? 
          (typeof profileData.exerciseLimitations === 'string' ? 
            JSON.parse(profileData.exerciseLimitations) : 
            profileData.exerciseLimitations) : [],
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt
      } : null,
      user: {
        name: user.name,
        email: user.email
      }
    }

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("Error fetching user profile data:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch user profile data" },
      { status: 500 }
    )
  }
}
