"use server";

import "server-only";
import { getServerSession, changePassword } from "@/lib/auth-server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { headers } from "next/headers";

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
});

export async function updateOwnPassword(formData: FormData) {
  try {
    const session = await getServerSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const rawData = {
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    };

    const validatedData = updatePasswordSchema.parse(rawData);

    // Check if new passwords match
    if (validatedData.newPassword !== validatedData.confirmPassword) {
      return { success: false, error: "New passwords do not match" };
    }

    // Use better-auth's changePassword method
    await changePassword({
      body: {
        newPassword: validatedData.newPassword,
        currentPassword: validatedData.currentPassword,
        revokeOtherSessions: false,
      },
      headers: await headers(),
    });

    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Password updated successfully",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return {
      success: false,
      error: "Failed to update password. Please check your current password.",
    };
  }
}
