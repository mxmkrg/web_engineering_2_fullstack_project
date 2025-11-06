"use client";

import { useState, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateOwnName } from "@/actions/user";
import { CheckCircle2, Loader2 } from "lucide-react";

interface UpdateNameFormProps {
  currentName: string;
}

export function UpdateNameForm({ currentName }: UpdateNameFormProps) {
  const [name, setName] = useState(currentName);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(_prevState: unknown, formData: FormData) {
    const result = await updateOwnName(formData);

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
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          disabled={isPending}
          required
        />
      </div>

      {state && !state.success && state.error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {isSuccess && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700">
          <CheckCircle2 className="size-4" />
          Name updated successfully
        </div>
      )}

      <Button type="submit" disabled={isPending || name === currentName}>
        {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
        Update Name
      </Button>
    </form>
  );
}
