"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories = [
    "all",
    ...Array.from(new Set(exercises.map((ex) => ex.category))),
  ];

  const formatCategory = (cat: string) => {
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  useEffect(() => {
    filterExercises();
  }, [exercises, searchTerm, selectedCategory]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filterExercises = () => {
    let filtered = exercises;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (exercise) =>
          exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const handleSelectExercise = (exerciseId: number, exerciseName: string) => {
    onSelect(exerciseId, exerciseName);
    setSearchTerm("");
    setSelectedCategory("all");
    setIsDropdownOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(e.target.value.length > 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Übung hinzufügen</h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="size-4" />
        </Button>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <Label>Kategorie wählen</Label>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-md scale-105"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {formatCategory(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Search and Dropdown Container */}
      <div className="space-y-2 relative" ref={dropdownRef}>
        <Label htmlFor="search">Übungen durchsuchen</Label>
        <div className="relative">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Nach Übung oder Muskelgruppe suchen..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => searchTerm.length > 0 && setIsDropdownOpen(true)}
            className="pl-10 focus:ring-2 focus:ring-blue-500"
            autoComplete="off"
          />
        </div>
        {/* Exercise Dropdown List - Google Style */}
        {isDropdownOpen && filteredExercises.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto border rounded-lg bg-white shadow-2xl z-50 border-gray-300">
            <div className="divide-y">
              {filteredExercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors duration-100 group"
                  onClick={() =>
                    handleSelectExercise(exercise.id, exercise.name)
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Search className="size-3 text-gray-400 flex-shrink-0" />
                        <div className="font-medium text-sm group-hover:text-blue-600 transition-colors">
                          {exercise.name}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 ml-5">
                        <span className="inline-block bg-gray-100 px-2 py-0.5 rounded mr-2">
                          {formatCategory(exercise.category)}
                        </span>
                        {exercise.equipment && (
                          <span className="text-xs">{exercise.equipment}</span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all duration-150 font-medium text-xs whitespace-nowrap hover:shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectExercise(exercise.id, exercise.name);
                      }}
                    >
                      Hinzufügen
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* No results message */}
            {filteredExercises.length === 0 && searchTerm && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Keine Übungen gefunden
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
