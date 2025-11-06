"use client";

import { useState } from "react";
import { makeFirstUserAdmin } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2 } from "lucide-react";

/**
 * TEMPORARY PAGE: Use this to make the first user an admin.
 * Access this page at /setup-admin
 * Delete this page after initial setup!
 */
export default function SetupAdminPage() {
  const [result, setResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleMakeAdmin = async () => {
    setIsLoading(true);
    setResult("");
    setSuccess(false);

    try {
      const response = await makeFirstUserAdmin();
      if (response.success) {
        setResult(response.message || "Success!");
        setSuccess(true);
      } else {
        setResult(response.error || "Unknown error");
        setSuccess(false);
      }
    } catch (error) {
      setResult(`Error: ${(error as Error).message}`);
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="max-w-md space-y-6 rounded-lg border p-8">
        <div>
          <h1 className="text-2xl font-bold">Admin Setup</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This page will make the first user in the database an admin.
            <br />
            <strong className="text-destructive">
              Delete this page after setup!
            </strong>
          </p>
        </div>

        <Button
          onClick={handleMakeAdmin}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Processing..." : "Make First User Admin"}
        </Button>

        {result && (
          <div
            className={`flex items-start gap-2 rounded-md p-4 text-sm ${
              success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            }`}
          >
            {success ? (
              <CheckCircle2 className="mt-0.5 size-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 size-4 flex-shrink-0" />
            )}
            <div className="flex-1">{result}</div>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800">
            <p className="font-semibold mb-2">Next Steps:</p>
            <ol className="list-inside list-decimal space-y-1">
              <li>Log out and log back in</li>
              <li>Go to /admin to access the admin dashboard</li>
              <li>
                Delete this setup page:{" "}
                <code className="bg-blue-100 px-1 rounded">
                  src/app/setup-admin/page.tsx
                </code>
              </li>
            </ol>
          </div>
        )}

        <div className="rounded-md bg-muted p-4 text-xs">
          <p className="font-semibold">Instructions:</p>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>Make sure at least one user is registered</li>
            <li>Click the button above</li>
            <li>Log out and log back in for changes to take effect</li>
            <li>Verify the admin user can access /admin</li>
            <li>
              <strong>Delete this file:</strong>{" "}
              <code>src/app/setup-admin/page.tsx</code>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
