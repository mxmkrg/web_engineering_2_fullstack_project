import { Suspense } from "react";
import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { DashboardContent } from "./_components/dashboard-content";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return <DashboardContent userName={session.user.name || "User"} />;
}
