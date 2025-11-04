import "server-only";
import { db } from "@/db";
import { workout } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

export async function archiveWorkout(workoutId: number) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  try {
    await db
      .update(workout)
      .set({
        status: "archived",
        updatedAt: new Date(),
      })
      .where(
        and(eq(workout.id, workoutId), eq(workout.userId, session.user.id)),
      );

    revalidatePath("/dashboard/workouts");
    revalidatePath("/dashboard/workouts/archived");
    return { success: true };
  } catch (error) {
    console.error("Error archiving workout:", error);
    return { success: false, error: "Failed to archive workout" };
  }
}

export async function unarchiveWorkout(workoutId: number) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  try {
    await db
      .update(workout)
      .set({
        status: "completed",
        updatedAt: new Date(),
      })
      .where(
        and(eq(workout.id, workoutId), eq(workout.userId, session.user.id)),
      );

    revalidatePath("/dashboard/workouts");
    revalidatePath("/dashboard/workouts/archived");
    return { success: true };
  } catch (error) {
    console.error("Error unarchiving workout:", error);
    return { success: false, error: "Failed to unarchive workout" };
  }
}
