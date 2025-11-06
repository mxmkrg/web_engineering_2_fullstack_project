import { db } from "@/db";
import { routine } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { RoutineCard } from "./routine-card";

export async function RoutineList() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const routines = await db
    .select()
    .from(routine)
    .where(eq(routine.userId, session.user.id))
    .orderBy(routine.createdAt);

  if (routines.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-muted-foreground">
          No routines found
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          Create your first routine or click "Seed Routines" to get started with
          pre-built workouts.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {routines.map((routine) => (
        <RoutineCard key={routine.id} routine={routine} />
      ))}
    </div>
  );
}
