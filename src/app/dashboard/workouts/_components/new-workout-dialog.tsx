"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { createWorkout } from "@/actions/create-workout";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface NewWorkoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewWorkoutDialog({ isOpen, onClose }: NewWorkoutDialogProps) {
  const [state, formAction] = useActionState(createWorkout, {});

  // Close dialog on successful creation
  useEffect(() => {
    if (state.success) {
      // Small delay to show success before closing
      const timer = setTimeout(() => {
        onClose();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.success, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">New Workout</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="size-4" />
          </button>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Workout Name
            </label>
            <Input
              type="text"
              id="name"
              name="name"
              required
              placeholder="e.g., Push Day, Morning Run"
            />
          </div>
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date
            </label>
            <Input
              type="date"
              id="date"
              name="date"
              required
              defaultValue={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div>
            <label
              htmlFor="duration"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Duration (minutes)
            </label>
            <Input
              type="number"
              id="duration"
              name="duration"
              min="1"
              placeholder="60"
            />
          </div>
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Notes (optional)
            </label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="How did it go? Any observations..."
            />
          </div>
          {state.error && (
            <div className="text-red-600 text-sm">{state.error}</div>
          )}
          {state.success && (
            <div className="text-green-600 text-sm">
              Workout created successfully!
            </div>
          )}{" "}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Workout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
