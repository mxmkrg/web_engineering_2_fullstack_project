import { NextResponse } from "next/server";
import { db } from "@/db";
import { userProfile } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-server";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Get user profile
    const profile = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, user.id))
      .limit(1);

    if (profile.length === 0) {
      // Return empty profile structure if no profile exists
      return NextResponse.json({
        success: true,
        profile: {
          userId: user.id,
          age: null,
          gender: null,
          heightCm: null,
          weightKg: null,
          trainingGoal: null,
          trainingDaysPerWeek: null,
          sessionDurationMinutes: null,
          exerciseLimitations: null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      profile: profile[0],
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}
