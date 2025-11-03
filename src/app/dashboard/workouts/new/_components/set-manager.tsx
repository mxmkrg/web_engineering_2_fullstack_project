"use client";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";

interface WorkoutSet {
  id: string;
  setNumber: number;
  reps: number | null;
  weight: number | null;
  completed: boolean;
}

interface SetManagerProps {
  sets: WorkoutSet[];
  onSetsChange: (sets: WorkoutSet[]) => void;
  disabled?: boolean;
}

export function SetManager({
  sets,
  onSetsChange,
  disabled = false,
}: SetManagerProps) {
  const addSet = () => {
    const newSet: WorkoutSet = {
      id: Math.random().toString(36).substr(2, 9),
      setNumber: sets.length + 1,
      reps: null,
      weight: null,
      completed: false,
    };
    onSetsChange([...sets, newSet]);
  };

  const removeSet = (setId: string) => {
    const updatedSets = sets
      .filter((set) => set.id !== setId)
      .map((set, index) => ({ ...set, setNumber: index + 1 }));
    onSetsChange(updatedSets);
  };

  const updateSet = (setId: string, updates: Partial<WorkoutSet>) => {
    const updatedSets = sets.map((set) =>
      set.id === setId ? { ...set, ...updates } : set,
    );
    onSetsChange(updatedSets);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Sets</h4>
        <button
          type="button"
          onClick={addSet}
          disabled={disabled}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="size-4" />
          Add Set
        </button>
      </div>

      {/* Sets Table */}
      {sets.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground border rounded-lg">
          <p>No sets added yet.</p>
          <p className="text-sm">Click "Add Set" to get started!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Table Header */}
          <div className="grid grid-cols-5 gap-2 px-3 py-2 text-sm font-medium text-muted-foreground border-b">
            <div>Set</div>
            <div>Reps</div>
            <div>Weight (kg)</div>
            <div>Done</div>
            <div></div>
          </div>

          {/* Sets */}
          {sets.map((set) => (
            <div
              key={set.id}
              className="grid grid-cols-5 gap-2 px-3 py-2 items-center border rounded-lg"
            >
              {/* Set Number */}
              <div className="font-medium text-sm">{set.setNumber}</div>

              {/* Reps Input */}
              <div>
                <Input
                  type="number"
                  placeholder="0"
                  value={set.reps || ""}
                  onChange={(e) =>
                    updateSet(set.id, {
                      reps: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  className="h-8 text-center"
                  min="0"
                  disabled={disabled}
                />
              </div>

              {/* Weight Input */}
              <div>
                <Input
                  type="number"
                  step="0.5"
                  placeholder="0"
                  value={set.weight || ""}
                  onChange={(e) =>
                    updateSet(set.id, {
                      weight: e.target.value
                        ? parseFloat(e.target.value)
                        : null,
                    })
                  }
                  className="h-8 text-center"
                  min="0"
                  disabled={disabled}
                />
              </div>

              {/* Completed Checkbox */}
              <div className="flex justify-center">
                <Checkbox
                  checked={set.completed}
                  onCheckedChange={(checked: boolean) =>
                    updateSet(set.id, {
                      completed: checked,
                    })
                  }
                  disabled={disabled}
                />
              </div>

              {/* Delete Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => removeSet(set.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors flex items-center justify-center"
                  disabled={disabled}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Set Summary */}
      {sets.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {sets.filter((s) => s.completed).length} of {sets.length} sets
          completed
        </div>
      )}
    </div>
  );
}
