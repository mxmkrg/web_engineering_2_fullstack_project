"use server"

import { db } from "@/db"
import { userProfile } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getCurrentUser } from "@/lib/auth-server"
import { revalidatePath } from "next/cache"

export interface ProfileData {
  age?: number
  gender?: string
  heightCm?: number
  weightKg?: number
  trainingGoal?: string
  trainingDaysPerWeek?: number
  sessionDurationMinutes?: number
  exerciseLimitations?: string
}

export async function saveUserProfile(data: ProfileData, fieldsToUpdate: (keyof ProfileData)[]) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return {
        success: false,
        error: "Unauthorized. Please log in to save your profile.",
      }
    }

    // Validation
    const validationErrors = validateProfileData(data)
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: `Validation errors: ${validationErrors.join(", ")}`,
      }
    }

    // Check if profile exists
    const existingProfile = await db.select().from(userProfile).where(eq(userProfile.userId, user.id)).limit(1)
    const profileExists = existingProfile.length > 0 ? existingProfile[0] : null

    let result

    if (profileExists) {
      // Update nur die spezifischen Felder
      const updateData: Partial<typeof userProfile.$inferInsert> = {
        updatedAt: new Date(),
      }

      // Nur die angegebenen Felder aktualisieren
      fieldsToUpdate.forEach(field => {
        if (field in data) {
          (updateData as any)[field] = data[field] ?? null
        }
      })

      result = await db
          .update(userProfile)
          .set(updateData)
          .where(eq(userProfile.userId, user.id))
          .returning()
    } else {
      // Create new profile mit allen Feldern
      const profileData = {
        userId: user.id,
        age: data.age ?? null,
        gender: data.gender ?? null,
        heightCm: data.heightCm ?? null,
        weightKg: data.weightKg ?? null,
        trainingGoal: data.trainingGoal ?? null,
        trainingDaysPerWeek: data.trainingDaysPerWeek ?? null,
        sessionDurationMinutes: data.sessionDurationMinutes ?? null,
        exerciseLimitations: data.exerciseLimitations ?? null,
      }

      result = await db
          .insert(userProfile)
          .values(profileData)
          .returning()
    }

    // Revalidate profile page
    revalidatePath("/dashboard/profile")

    return {
      success: true,
      message: profileExists ? "Profile updated successfully!" : "Profile created successfully!",
      profile: result[0],
    }
  } catch (error) {
    console.error("Error saving profile:", error)
    return {
      success: false,
      error: "Failed to save profile. Please try again.",
    }
  }
}

function validateProfileData(data: ProfileData): string[] {
  const errors: string[] = []

  // Age validation
  if (data.age !== undefined && data.age !== null) {
    if (data.age < 1 || data.age > 120) {
      errors.push("Age must be between 1 and 120")
    }
  }

  // Gender validation
  if (data.gender && !["male", "female", "other", "prefer_not_to_say"].includes(data.gender)) {
    errors.push("Invalid gender selection")
  }

  // Height validation
  if (data.heightCm !== undefined && data.heightCm !== null) {
    if (data.heightCm < 50 || data.heightCm > 300) {
      errors.push("Height must be between 50 and 300 cm")
    }
  }

  // Weight validation
  if (data.weightKg !== undefined && data.weightKg !== null) {
    if (data.weightKg < 20 || data.weightKg > 500) {
      errors.push("Weight must be between 20 and 500 kg")
    }
  }

  // Training goal validation
  if (data.trainingGoal && !["strength", "muscle_gain", "fat_loss", "health"].includes(data.trainingGoal)) {
    errors.push("Invalid training goal selection")
  }

  // Training days validation
  if (data.trainingDaysPerWeek !== undefined && data.trainingDaysPerWeek !== null) {
    if (data.trainingDaysPerWeek < 1 || data.trainingDaysPerWeek > 7) {
      errors.push("Training days per week must be between 1 and 7")
    }
  }

  // Session duration validation
  if (data.sessionDurationMinutes !== undefined && data.sessionDurationMinutes !== null) {
    if (data.sessionDurationMinutes < 15 || data.sessionDurationMinutes > 300) {
      errors.push("Session duration must be between 15 and 300 minutes")
    }
  }

  return errors
}

// Specialized save functions for each section
export async function saveBasicInfo(age?: number, gender?: string) {
  return await saveUserProfile({ age, gender }, ['age', 'gender'])
}

export async function savePhysicalInfo(heightCm?: number, weightKg?: number) {
  return await saveUserProfile({ heightCm, weightKg }, ['heightCm', 'weightKg'])
}

export async function saveTrainingPreferences(
    trainingGoal?: string,
    trainingDaysPerWeek?: number,
    sessionDurationMinutes?: number
) {
  return await saveUserProfile({
    trainingGoal,
    trainingDaysPerWeek,
    sessionDurationMinutes,
  }, ['trainingGoal', 'trainingDaysPerWeek', 'sessionDurationMinutes'])
}

export async function saveLimitations(exerciseLimitations?: string) {
  return await saveUserProfile({ exerciseLimitations }, ['exerciseLimitations'])
}
