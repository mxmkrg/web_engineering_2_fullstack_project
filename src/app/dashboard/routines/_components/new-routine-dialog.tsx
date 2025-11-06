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
import { getAllTemplates } from "@/lib/workout-templates";

export function NewRoutineDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const templates = getAllTemplates();

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await createRoutine(formData);
      setOpen(false);
      setSelectedTemplate("");
    } catch (error) {
      console.error("Failed to create routine:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTemplateData = selectedTemplate
    ? templates[selectedTemplate]
    : null;

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
            <Label htmlFor="templateKey">Workout Template</Label>
            <Select
              name="templateKey"
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a workout template" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(templates).map(([key, template]) => (
                  <SelectItem key={key} value={key}>
                    {template.name} ({template.difficulty || "intermediate"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplateData && (
            <div className="space-y-2">
              <Label>Template Details</Label>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{selectedTemplateData.description}</p>
                <div className="flex items-center gap-4">
                  <span>Duration: {selectedTemplateData.baseDuration} min</span>
                  <span>
                    Exercises: {selectedTemplateData.exercises.length}
                  </span>
                  <span>Phase: {selectedTemplateData.phase}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              name="description"
              placeholder="Describe your routine..."
            />
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
