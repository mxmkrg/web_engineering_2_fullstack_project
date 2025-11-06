"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Search, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

type Exercise = {
  id: number;
  name: string;
  category: string;
  muscleGroups: string;
  equipment: string | null;
  description: string | null;
};

type RoutineExercise = {
  exerciseId: number;
  exerciseName: string;
  targetSets: number;
  targetReps: string;
  targetWeight?: number;
  restPeriod?: number;
  notes?: string;
};

interface RoutineBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  exercises: Exercise[];
  onCreateRoutine: (
    formData: FormData,
  ) => Promise<{ success: boolean; error?: string; routineId?: number }>;
  onRoutineCreated: () => void;
}

export function RoutineBuilder({
  open,
  onOpenChange,
  userId,
  exercises,
  onCreateRoutine,
  onRoutineCreated,
}: RoutineBuilderProps) {
  const [step, setStep] = useState<"basic" | "exercises">("basic");
  
  // Basic routine info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [duration, setDuration] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  // Exercise management
  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>([]);
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Loading state
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setStep("basic");
    setName("");
    setDescription("");
    setCategory("");
    setDifficulty("");
    setDuration("");
    setTags([]);
    setNewTag("");
    setRoutineExercises([]);
    setShowExerciseSearch(false);
    setExerciseSearch("");
    setSelectedCategory("all");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleNextStep = () => {
    if (!name.trim()) {
      toast.error("Please enter a routine name");
      return;
    }
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    if (!difficulty) {
      toast.error("Please select a difficulty");
      return;
    }
    setStep("exercises");
  };

  const handleAddExercise = (exercise: Exercise) => {
    const newRoutineExercise: RoutineExercise = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      targetSets: 3,
      targetReps: "8-12",
      targetWeight: undefined,
      restPeriod: 60,
      notes: "",
    };
    setRoutineExercises([...routineExercises, newRoutineExercise]);
    setShowExerciseSearch(false);
    setExerciseSearch("");
  };

  const updateExercise = (index: number, field: keyof RoutineExercise, value: any) => {
    const updated = [...routineExercises];
    (updated[index] as any)[field] = value;
    setRoutineExercises(updated);
  };

  const removeExercise = (index: number) => {
    setRoutineExercises(routineExercises.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (routineExercises.length === 0) {
      toast.error("Please add at least one exercise to your routine");
      return;
    }

    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.set("userId", userId);
      formData.set("name", name);
      formData.set("description", description);
      formData.set("category", category);
      formData.set("difficulty", difficulty);
      formData.set("duration", duration || "0");
      formData.set("tags", JSON.stringify(tags));
      formData.set("exercises", JSON.stringify(routineExercises));

      const result = await onCreateRoutine(formData);

      if (result.success) {
        toast.success("Routine created successfully!");
        handleClose();
        onRoutineCreated();
      } else {
        toast.error(result.error || "Failed to create routine");
      }
    } catch (error) {
      console.error("Error creating routine:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  // Filter exercises for search
  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = !exerciseSearch || 
      exercise.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
      exercise.muscleGroups.toLowerCase().includes(exerciseSearch.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || exercise.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const exerciseCategories = ["all", ...Array.from(new Set(exercises.map(ex => ex.category)))];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">
              {step === "basic" ? "Create Routine" : "Add Exercises"}
            </h2>
            <p className="text-muted-foreground">
              {step === "basic" 
                ? "Set up the basic information for your routine"
                : "Add exercises to build your workout template"
              }
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClose}
            className="hover:bg-gray-100 rounded-full p-2"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {step === "basic" ? (
            <div className="space-y-6">
              {/* Basic Info Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Routine Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Push Day, Full Body, etc."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your routine..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        <SelectItem value="strength">Strength</SelectItem>
                        <SelectItem value="hypertrophy">Hypertrophy</SelectItem>
                        <SelectItem value="endurance">Endurance</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select value={difficulty} onValueChange={setDifficulty} required>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="60"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    min="15"
                    max="180"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag (e.g., push, chest, etc.)"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleTagKeyPress}
                    />
                    <Button type="button" onClick={addTag} variant="outline" className="bg-white hover:bg-gray-50 border border-gray-300">
                      Add
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-destructive p-0 h-auto w-auto hover:bg-transparent"
                          >
                            <X className="size-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Exercise Search */}
              {showExerciseSearch ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="size-5" />
                      Add Exercise
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Category filter */}
                    <div className="flex gap-2 flex-wrap">
                      {exerciseCategories.map((cat) => (
                        <Button
                          key={cat}
                          variant={selectedCategory === cat ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(cat)}
                          className={selectedCategory === cat 
                            ? "bg-blue-600 hover:bg-blue-700 text-white" 
                            : "bg-white hover:bg-gray-50 border border-gray-300"
                          }
                        >
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </Button>
                      ))}
                    </div>

                    {/* Search input */}
                    <Input
                      placeholder="Search exercises..."
                      value={exerciseSearch}
                      onChange={(e) => setExerciseSearch(e.target.value)}
                    />

                    {/* Exercise list */}
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {filteredExercises.map((exercise) => (
                        <div
                          key={exercise.id}
                          className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                        >
                          <div>
                            <div className="font-medium">{exercise.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {exercise.category} • {exercise.equipment || "No equipment"}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddExercise(exercise)}
                            disabled={routineExercises.some(re => re.exerciseId === exercise.id)}
                            className={routineExercises.some(re => re.exerciseId === exercise.id) 
                              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                            }
                          >
                            {routineExercises.some(re => re.exerciseId === exercise.id) ? "Added" : "Add"}
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setShowExerciseSearch(false)}
                      className="w-full bg-white hover:bg-gray-50 border border-gray-300"
                    >
                      Close
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Button onClick={() => setShowExerciseSearch(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="size-4 mr-2" />
                  Add Exercise
                </Button>
              )}

              {/* Exercise List */}
              {routineExercises.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Routine Exercises</h3>
                  {routineExercises.map((routineEx, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{routineEx.exerciseName}</CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeExercise(index)}
                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground bg-white border-red-300 hover:border-red-500"
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Target Sets</Label>
                            <Input
                              type="number"
                              min="1"
                              value={routineEx.targetSets}
                              onChange={(e) => updateExercise(index, "targetSets", parseInt(e.target.value) || 1)}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Target Reps</Label>
                            <Input
                              placeholder="e.g., 8-12 or 10"
                              value={routineEx.targetReps}
                              onChange={(e) => updateExercise(index, "targetReps", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Weight (kg) - Optional</Label>
                            <Input
                              type="number"
                              step="0.5"
                              placeholder="Starting weight"
                              value={routineEx.targetWeight || ""}
                              onChange={(e) => updateExercise(index, "targetWeight", e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Rest Period (seconds)</Label>
                            <Input
                              type="number"
                              min="30"
                              value={routineEx.restPeriod || 60}
                              onChange={(e) => updateExercise(index, "restPeriod", parseInt(e.target.value) || 60)}
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Notes - Optional</Label>
                          <Input
                            placeholder="Exercise-specific notes..."
                            value={routineEx.notes || ""}
                            onChange={(e) => updateExercise(index, "notes", e.target.value)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex items-center gap-2">
            {step === "exercises" && (
              <Button variant="outline" onClick={() => setStep("basic")}>
                <ArrowLeft className="size-4 mr-2" />
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {step === "basic" ? (
              <Button onClick={handleNextStep} className="bg-blue-600 hover:bg-blue-700 text-white">
                Next: Add Exercises
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Save className="size-4 mr-2" />
                {isSaving ? "Creating..." : "Create Routine"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}