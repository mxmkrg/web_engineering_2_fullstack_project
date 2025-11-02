"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, Search, Dumbbell, Target, Zap, Flame, Triangle, Activity } from "lucide-react"
import { getExercisesByCategory } from "@/actions/get-exercises"

type Category = "all" | "chest" | "back" | "legs" | "shoulders" | "arms" | "cardio"


const CATEGORY_ICONS: Record<Category, React.ComponentType<{ className?: string }>> = {
    all: Dumbbell,
    chest: Target, // Target represents chest/pec exercises
    back: Zap,
    legs: Flame,
    shoulders: Triangle, // Triangle represents shoulder deltoid shape
    arms: Dumbbell, // Dumbbell for arm exercises
    cardio: Activity,
}

const CATEGORIES: { value: Category; label: string }[] = [
    { value: "all", label: "All" },
    { value: "chest", label: "Chest" },
    { value: "back", label: "Back" },
    { value: "legs", label: "Legs" },
    { value: "shoulders", label: "Shoulders" },
    { value: "arms", label: "Arms" },
    { value: "cardio", label: "Cardio" },
]

interface ExerciseSearchProps {
    onSelect: (exercise: string) => void
    onClose: () => void
}

export function ExerciseSearch({ onSelect, onClose }: ExerciseSearchProps) {
    const [selectedCategory, setSelectedCategory] = useState<Category>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [exercises, setExercises] = useState<Record<string, string[]>>({})
    const [isLoading, setIsLoading] = useState(true)
    const inputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Lade Übungen einmalig beim Mount
    useEffect(() => {
        async function loadExercises() {
            setIsLoading(true)
            try {
                const data = await getExercisesByCategory()

                // Konvertiere zu erwartetem Format: { category: [exerciseName1, exerciseName2, ...] }
                const formatted: Record<string, string[]> = {}
                for (const [category, exerciseList] of Object.entries(data)) {
                    formatted[category] = exerciseList.map((ex: { id: number; name: string }) => ex.name)
                }

                setExercises(formatted)
            } catch (error) {
                console.error("Failed to load exercises:", error)
            } finally {
                setIsLoading(false)
            }
        }

        loadExercises()
    }, [])

    // Get all exercises for selected category
    const getExercisesForCategory = () => {
        if (selectedCategory === "all") {
            return Object.values(exercises).flat()
        }
        return exercises[selectedCategory] || []
    }

    // Filter exercises based on search query
    const filteredExercises = getExercisesForCategory().filter((exercise) =>
        exercise.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    // Auto-focus input on mount
    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-white/70 pt-20">
            <Card className="w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b p-6">
                    <h3 className="text-2xl font-semibold">Add Exercise</h3>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="p-6">
                    {/* Category Filter */}
                    <div className="mb-6">
                        <label className="mb-3 block text-sm font-medium">Choose Category</label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((category) => (
                                <Button
                                    key={category.value}
                                    variant={selectedCategory === category.value ? "default" : "outline"}
                                    onClick={() => {
                                        setSelectedCategory(category.value)
                                        setSearchQuery("")
                                        setIsDropdownOpen(true)
                                    }}
                                    className={`transition-all ${selectedCategory === category.value ? "bg-blue-500 text-white" : ""}`}
                                >
                                    {category.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Search Input with Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <label className="mb-3 block text-sm font-medium">Search Exercises</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                ref={inputRef}
                                placeholder="Search for exercises..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value)
                                    setIsDropdownOpen(true)
                                }}
                                onFocus={() => setIsDropdownOpen(true)}
                                className="pl-10"
                            />
                        </div>

                        {/* Dropdown List */}
                        {isDropdownOpen && filteredExercises.length > 0 && !isLoading && (
                            <div className="absolute z-10 mt-2 max-h-80 w-full overflow-y-auto rounded-lg border bg-popover shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                                {filteredExercises.map((exercise, index) => {
                                    const exerciseCategory =
                                        selectedCategory === "all"
                                            ? (Object.entries(exercises).find(([_, exList]) => exList.includes(exercise))?.[0] as
                                                | Exclude<Category, "all">
                                                | undefined)
                                            : selectedCategory
                                    const Icon = exerciseCategory ? CATEGORY_ICONS[exerciseCategory] : Dumbbell

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                onSelect(exercise)
                                                setIsDropdownOpen(false)
                                            }}
                                            className="flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-accent"
                                        >
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                                <Icon className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{exercise}</p>
                                                <p className="text-sm capitalize text-muted-foreground">{exerciseCategory}</p>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        )}

                        {/* Loading State */}
                        {isLoading && (
                            <div className="absolute z-10 mt-2 w-full rounded-lg border bg-popover p-8 text-center shadow-lg">
                                <p className="text-muted-foreground">Loading exercises...</p>
                            </div>
                        )}

                        {/* No Results */}
                        {isDropdownOpen && searchQuery && filteredExercises.length === 0 && !isLoading && (
                            <div className="absolute z-10 mt-2 w-full rounded-lg border bg-popover p-8 text-center shadow-lg">
                                <p className="text-muted-foreground">No exercises found for "{searchQuery}"</p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    )
}
