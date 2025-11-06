"use client";

import { useState, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateOwnEmail } from "@/actions/user";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface UpdateEmailFormProps {
  currentEmail: string;
}

export function UpdateEmailForm({ currentEmail }: UpdateEmailFormProps) {
  const [email, setEmail] = useState(currentEmail);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(_prevState: unknown, formData: FormData) {
    const result = await updateOwnEmail(formData);

    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    }

    return result;
  }

  const [state, action, isPending] = useActionState(handleSubmit, null);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          disabled={isPending}
          required
        />
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
          Email updated successfully. Please verify your new email address.
        </div>
      )}

      <Button type="submit" disabled={isPending || email === currentEmail}>
        {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
        Update Email
      </Button>
    </form>
  );
}
