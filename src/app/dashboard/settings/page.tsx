import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UpdateNameForm } from "@/app/dashboard/settings/_components/update-name-form";
import { UpdateEmailForm } from "@/app/dashboard/settings/_components/update-email-form";
import { UpdatePasswordForm } from "@/app/dashboard/settings/_components/update-password-form";
import { DeleteAccountSection } from "@/app/dashboard/settings/_components/delete-account-section";

export default async function AccountSettingsPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  // Fetch user data
  const userData = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!userData[0]) {
    redirect("/login");
  }

  const currentUser = userData[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your name and how it appears across the app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UpdateNameForm currentName={currentUser.name} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Address</CardTitle>
            <CardDescription>
              Update your email address for login and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UpdateEmailForm currentEmail={currentUser.email} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UpdatePasswordForm />
          </CardContent>
        </Card>

        <DeleteAccountSection userName={currentUser.name} />
      </div>
    </div>
  );
}
