"use server";

import "server-only";
import { z } from "zod";
import { db } from "@/db";
import { workout } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";

const workoutSchema = z.object({
  name: z.string().min(1, "Workout name is required"),
  date: z.string().transform((str) => new Date(str)),
  duration: z.number().min(1, "Duration must be at least 1 minute").optional(),
  notes: z.string().optional(),
});

export type WorkoutSchema = z.infer<typeof workoutSchema>;

export const createWorkout = async (
  _prevState: { error?: string },
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> => {
  console.debug("Calling create workout server action!");

  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const rawData = {
    name: formData.get("name"),
    date: formData.get("date"),
    duration: formData.get("duration") ? Number(formData.get("duration")) : undefined,
    notes: formData.get("notes") || undefined,
  };

  const { success, data, error } = workoutSchema.safeParse(rawData);

  if (!success) {
    return { error: z.prettifyError(error) };
  }

  try {
    await db.insert(workout).values({
      name: data.name,
      date: data.date,
      duration: data.duration,
      notes: data.notes,
      userId: session.user.id,
    });
  } catch (err) {
    console.error(err);
    return {
      error: (err as Error).message ?? "Something went wrong",
    };
  }

  console.debug("Workout created successfully");

  revalidatePath("/", "layout");

  return { success: true };
};