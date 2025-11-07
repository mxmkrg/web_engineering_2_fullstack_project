import { Suspense } from "react";
import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { DevContent } from "./_components/dev-content";

export default async function DevPage() {
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Only allow access in development
  if (process.env.NODE_ENV !== "development") {
    redirect("/dashboard");
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Development Tools
          </h2>
          <p className="text-muted-foreground">
            Tools for seeding and testing data during development
          </p>
        </div>
      </div>
      <Suspense fallback={<div>Loading dev tools...</div>}>
        <DevContent userId={session.user.id} />
      </Suspense>
    </div>
  );
}
