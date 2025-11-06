"use client";

import { useState, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateOwnPassword } from "@/actions/user";
import { CheckCircle2, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

export function UpdatePasswordForm() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(_prevState: unknown, formData: FormData) {
    const result = await updateOwnPassword(formData);

    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
      // Reset form
      const form = document.getElementById("password-form") as HTMLFormElement;
      form?.reset();
    }

    return result;
  }

  const [state, action, isPending] = useActionState(handleSubmit, null);

  return (
    <form id="password-form" action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current Password</Label>
        <div className="relative">
          <Input
            id="currentPassword"
            name="currentPassword"
            type={showCurrentPassword ? "text" : "password"}
            placeholder="Enter your current password"
            disabled={isPending}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
          >
            {showCurrentPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <div className="relative">
          <Input
            id="newPassword"
            name="newPassword"
            type={showNewPassword ? "text" : "password"}
            placeholder="Enter your new password (min. 8 characters)"
            disabled={isPending}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setShowNewPassword(!showNewPassword)}
          >
            {showNewPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your new password"
            disabled={isPending}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {state && !state.success && state.error && (
        <div className="flex items-start gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 flex-shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {isSuccess && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700">
          <CheckCircle2 className="size-4" />
          Password updated successfully
        </div>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
        Update Password
      </Button>
    </form>
  );
}
