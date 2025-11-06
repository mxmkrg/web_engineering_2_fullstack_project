"use server";

import { db } from "@/db";
import { userProfile } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-server";
import { revalidatePath } from "next/cache";

export interface ProfileData {
  age?: number;
  gender?: string;
  heightCm?: number;
  weightKg?: number;
  trainingGoal?: string;
  trainingDaysPerWeek?: number;
  sessionDurationMinutes?: number;
  exerciseLimitations?: string;
}

export async function saveUserProfile(
  data: ProfileData,
  fieldsToUpdate: (keyof ProfileData)[],
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: "Unauthorized. Please log in to save your profile.",
      };
    }

    // Validation
    const validationErrors = validateProfileData(data);
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: `Validation errors: ${validationErrors.join(", ")}`,
      };
    }

    // Check if profile exists
    const existingProfile = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, user.id))
      .limit(1);
    const profileExists =
      existingProfile.length > 0 ? existingProfile[0] : null;

    let result;

    if (profileExists) {
      // Update nur die spezifischen Felder
      const updateData: any = {};

      // Nur die angegebenen Felder aktualisieren, wenn sie definiert sind
      fieldsToUpdate.forEach((field) => {
        if (field in data && data[field] !== undefined) {
          updateData[field] = data[field];
        }
      });

      // Nur aktualisieren wenn es tatsächlich Daten zu aktualisieren gibt
      if (Object.keys(updateData).length > 0) {
        result = await db
          .update(userProfile)
          .set(updateData)
          .where(eq(userProfile.userId, user.id))
          .returning();
      } else {
        // Wenn keine Daten zu aktualisieren sind, gib das existierende Profil zurück
        result = [profileExists];
      }
    } else {
      // Create new profile mit nur den bereitgestellten Feldern
      const profileData: any = {
        userId: user.id,
      };

      // Nur definierte Felder hinzufügen
      fieldsToUpdate.forEach((field) => {
        if (field in data && data[field] !== undefined) {
          profileData[field] = data[field];
        }
      });

      result = await db.insert(userProfile).values(profileData).returning();
    }

    // Revalidate profile page
    revalidatePath("/dashboard/profile");

    return {
      success: true,
      message: profileExists
        ? "Profile updated successfully!"
        : "Profile created successfully!",
      profile: result[0],
    };
  } catch (error) {
    console.error("Error saving profile:", error);
    return {
      success: false,
      error: "Failed to save profile. Please try again.",
    };
  }
}

// Section-specific save functions for the 4 buttons/sections
export async function saveBasicInfo(age?: number, gender?: string) {
  const data: ProfileData = { age, gender };
  const fieldsToUpdate: (keyof ProfileData)[] = ["age", "gender"];
  return saveUserProfile(data, fieldsToUpdate);
}

export async function savePhysicalInfo(heightCm?: number, weightKg?: number) {
  const data: ProfileData = { heightCm, weightKg };
  const fieldsToUpdate: (keyof ProfileData)[] = ["heightCm", "weightKg"];
  return saveUserProfile(data, fieldsToUpdate);
}

export async function saveTrainingPreferences(
  trainingGoal?: string,
  trainingDaysPerWeek?: number,
  sessionDurationMinutes?: number,
) {
  const data: ProfileData = {
    trainingGoal,
    trainingDaysPerWeek,
    sessionDurationMinutes,
  };
  const fieldsToUpdate: (keyof ProfileData)[] = [
    "trainingGoal",
    "trainingDaysPerWeek",
    "sessionDurationMinutes",
  ];
  return saveUserProfile(data, fieldsToUpdate);
}

export async function saveLimitations(exerciseLimitations?: string) {
  const data: ProfileData = { exerciseLimitations };
  const fieldsToUpdate: (keyof ProfileData)[] = ["exerciseLimitations"];
  return saveUserProfile(data, fieldsToUpdate);
}

function validateProfileData(data: ProfileData): string[] {
  const errors: string[] = [];

  // Age validation - nur validieren wenn definiert und nicht leer
  if (data.age !== undefined && data.age !== null && data.age !== 0) {
    if (data.age < 1 || data.age > 120) {
      errors.push("Age must be between 1 and 120");
    }
  }

  // Gender validation - nur validieren wenn definiert und nicht leer
  if (
    data.gender &&
    data.gender.trim() !== "" &&
    !["male", "female", "other", "prefer_not_to_say"].includes(data.gender)
  ) {
    errors.push("Invalid gender selection");
  }

  // Height validation - nur validieren wenn definiert und nicht leer
  if (
    data.heightCm !== undefined &&
    data.heightCm !== null &&
    data.heightCm !== 0
  ) {
    if (data.heightCm < 50 || data.heightCm > 300) {
      errors.push("Height must be between 50 and 300 cm");
    }
  }

  // Weight validation - nur validieren wenn definiert und nicht leer
  if (
    data.weightKg !== undefined &&
    data.weightKg !== null &&
    data.weightKg !== 0
  ) {
    if (data.weightKg < 20 || data.weightKg > 500) {
      errors.push("Weight must be between 20 and 500 kg");
    }
  }

  // Training goal validation - nur validieren wenn definiert und nicht leer
  if (
    data.trainingGoal &&
    data.trainingGoal.trim() !== "" &&
    !["strength", "muscle_gain", "fat_loss", "health"].includes(
      data.trainingGoal,
    )
  ) {
    errors.push("Invalid training goal selection");
  }

  // Training days validation - nur validieren wenn definiert und nicht leer
  if (
    data.trainingDaysPerWeek !== undefined &&
    data.trainingDaysPerWeek !== null &&
    data.trainingDaysPerWeek !== 0
  ) {
    if (data.trainingDaysPerWeek < 1 || data.trainingDaysPerWeek > 7) {
      errors.push("Training days per week must be between 1 and 7");
    }
  }

  // Session duration validation - nur validieren wenn definiert und nicht leer
  if (
    data.sessionDurationMinutes !== undefined &&
    data.sessionDurationMinutes !== null &&
    data.sessionDurationMinutes !== 0
  ) {
    if (data.sessionDurationMinutes < 15 || data.sessionDurationMinutes > 300) {
      errors.push("Session duration must be between 15 and 300 minutes");
    }
  }

  return errors;
}
