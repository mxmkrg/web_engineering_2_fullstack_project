"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { createRoutine } from "@/actions/create-routine";

export function NewRoutineDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await createRoutine(formData);
      setOpen(false);
    } catch (error) {
      console.error("Failed to create routine:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4 mr-2" />
          New Routine
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Routine</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Routine Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="My Awesome Routine"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              name="description"
              placeholder="Describe your routine..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select name="category" defaultValue="strength">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strength">Strength</SelectItem>
                <SelectItem value="hypertrophy">Hypertrophy</SelectItem>
                <SelectItem value="endurance">Endurance</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select name="difficulty" defaultValue="intermediate">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Estimated Duration (minutes)</Label>
            <Input
              id="duration"
              name="duration"
              type="number"
              placeholder="60"
              min="15"
              max="180"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Routine"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
