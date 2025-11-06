"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { seedRoutines } from "@/actions/seed-routines";

export function SeedRoutinesButton() {
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedRoutines = async () => {
    setIsSeeding(true);
    try {
      await seedRoutines();
    } catch (error) {
      console.error("Failed to seed routines:", error);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleSeedRoutines} disabled={isSeeding}>
      <Sparkles className="size-4 mr-2" />
      {isSeeding ? "Seeding..." : "Seed Routines"}
    </Button>
  );
}
