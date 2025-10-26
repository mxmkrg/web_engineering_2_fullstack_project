"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface Exercise {
  id: number;
  name: string;
  category: string;
  muscleGroups: string;
  equipment: string | null;
  description: string | null;
}

interface ExerciseSelectorProps {
  exercises: Exercise[];
  onSelect: (exerciseId: number, exerciseName: string) => void;
  onCancel: () => void;
}

export function ExerciseSelector({
  exercises,
  onSelect,
  onCancel,
}: ExerciseSelectorProps) {
  const [filteredExercises, setFilteredExercises] =
    useState<Exercise[]>(exercises);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    filterExercises();
  }, [exercises, searchTerm, selectedCategory]);

  const filterExercises = () => {
    let filtered = exercises;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (exercise) =>
          exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exercise.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exercise.muscleGroups
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (exercise) => exercise.category === selectedCategory,
      );
    }

    setFilteredExercises(filtered);
  };

  const categories = Array.from(new Set(exercises.map((ex) => ex.category)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select Exercise</h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="size-4" />
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Exercise List */}
      <div className="max-h-60 overflow-y-auto space-y-2">
        {filteredExercises.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No exercises found matching your criteria.
          </div>
        ) : (
          filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
              onClick={() => onSelect(exercise.id, exercise.name)}
            >
              <div>
                <div className="font-medium">{exercise.name}</div>
                <div className="text-sm text-muted-foreground">
                  {exercise.category} • {exercise.equipment || "No equipment"}
                </div>
                {exercise.description && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {exercise.description}
                  </div>
                )}
              </div>
              <button 
                type="button"
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Add
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
