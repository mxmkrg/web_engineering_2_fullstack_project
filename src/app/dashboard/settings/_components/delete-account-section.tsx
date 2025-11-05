"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteOwnAccount } from "@/actions/user";
import { logout } from "@/actions/logout";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface DeleteAccountSectionProps {
  userName: string;
}

export function DeleteAccountSection({ userName }: DeleteAccountSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const _router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");

    try {
      const result = await deleteOwnAccount();

      if (!result.success) {
        throw new Error(result.error);
      }

      // Account deleted successfully, logout will redirect
      await logout({ error: undefined });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => setIsDialogOpen(true)}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            <AlertTriangle className="mr-2 size-4" />
            Delete Account
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and all associated data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-md border-2 border-destructive/50 p-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold">
                  You are about to delete:
                </p>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  <li>Your account: {userName}</li>
                  <li>All your workout history</li>
                  <li>All your progress data</li>
                  <li>All your personal settings</li>
                </ul>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <p className="text-sm font-medium text-destructive">
              Are you absolutely sure? This action is permanent and cannot be
              reversed.
            </p>
          </div>

          <div className="mt-6 flex flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Yes, Delete My Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
