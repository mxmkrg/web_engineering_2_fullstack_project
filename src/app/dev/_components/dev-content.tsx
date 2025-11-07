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
import { Database, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface DevContentProps {
  userId: string;
}

export function DevContent({ userId }: DevContentProps) {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSeedRoutines = async () => {
    setIsSeeding(true);
    setSeedResult(null);

    try {
      const response = await fetch("/api/dev/seed-routines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (response.ok) {
        setSeedResult({
          success: true,
          message: result.message || "Sample routines seeded successfully!",
        });
      } else {
        setSeedResult({
          success: false,
          message: result.error || "Failed to seed routines",
        });
      }
    } catch (error) {
      setSeedResult({
        success: false,
        message: "Network error while seeding routines",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Seeding Tools */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="size-5" />
              Seed Sample Routines
            </CardTitle>
            <CardDescription>
              Add sample workout routines with exercises for testing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              This will create the following sample routines:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>
                  <strong>Push Day</strong> - Chest, shoulders, triceps workout
                </li>
                <li>
                  <strong>Pull Day</strong> - Back and biceps workout
                </li>
                <li>
                  <strong>Leg Day</strong> - Lower body strength workout
                </li>
                <li>
                  <strong>Full Body Beginner</strong> - Complete body workout
                </li>
                <li>
                  <strong>HIIT Cardio</strong> - High-intensity cardio routine
                </li>
              </ul>
            </div>

            {seedResult && (
              <div
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  seedResult.success
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {seedResult.success ? (
                  <CheckCircle className="size-4" />
                ) : (
                  <AlertCircle className="size-4" />
                )}
                <span className="text-sm">{seedResult.message}</span>
              </div>
            )}

            <Button
              onClick={handleSeedRoutines}
              disabled={isSeeding}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Seeding Routines...
                </>
              ) : (
                <>
                  <Database className="size-4 mr-2" />
                  Seed Sample Routines
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Development Notes</CardTitle>
            <CardDescription>
              Important information for development
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Environment:</strong> Development only
              </p>
              <p>
                <strong>User ID:</strong> {userId}
              </p>
              <p>
                <strong>Note:</strong> This page is only accessible in
                development mode and will redirect to dashboard in production.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
