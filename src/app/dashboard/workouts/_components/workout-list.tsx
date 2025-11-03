"use client"

import { Calendar, Clock, Edit, Trash2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState, useEffect } from "react"

interface Workout {
  id: number
  name: string
  date: Date
  duration: number | null
  status: string
}

export function WorkoutList() {
  const router = useRouter()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [completingId, setCompletingId] = useState<number | null>(null)

  // Load workouts from API
  useEffect(() => {
    loadWorkouts()
  }, [])

  const loadWorkouts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/workouts')
      const result = await response.json()

      if (result.success) {
        setWorkouts(result.workouts)
      } else {
        toast.error(result.error || "Failed to load workouts")
      }
    } catch (error) {
      console.error("Error loading workouts:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (workoutId: number) => {
    router.push(`/dashboard/workouts/${workoutId}/edit`)
  }

  const handleComplete = async (workoutId: number) => {
    if (!confirm("Mark this workout as completed? Duration will be calculated automatically.")) {
      return
    }

    setCompletingId(workoutId)
    try {
      const response = await fetch(`/api/workouts/${workoutId}/complete`, {
        method: 'PATCH',
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message || `Workout completed! Duration: ${result.duration} minutes`)
        // Reload workouts after completing
        await loadWorkouts()
      } else {
        toast.error(result.error || "Failed to complete workout")
      }
    } catch (error) {
      console.error("Error completing workout:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setCompletingId(null)
    }
  }

  const handleDelete = async (workoutId: number) => {
    if (!confirm("Are you sure you want to delete this workout?")) {
      return
    }

    setDeletingId(workoutId)
    try {
      const response = await fetch(`/api/workouts/${workoutId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Workout deleted successfully")
        // Reload workouts after deleting
        await loadWorkouts()
      } else {
        toast.error(result.error || "Failed to delete workout")
      }
    } catch (error) {
      console.error("Error deleting workout:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 animate-pulse">
            <div className="h-12 w-12 bg-muted rounded-lg"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-muted rounded w-32"></div>
              <div className="h-3 bg-muted rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!workouts || workouts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          No workouts yet. Start your fitness journey!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {workouts.map((workoutItem) => (
        <div
          key={workoutItem.id}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className={`p-2 rounded-lg ${workoutItem.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'}`}>
              {workoutItem.status === 'completed' ? (
                <CheckCircle className="size-4 text-green-600" />
              ) : (
                <Calendar className="size-4 text-blue-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">{workoutItem.name}</h3>
                {workoutItem.status === 'completed' && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Completed
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {new Date(workoutItem.date).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="size-4 mr-1" />
              {workoutItem.duration || 0}m
            </div>

            <div className="flex gap-2">
              {workoutItem.status === 'active' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleComplete(workoutItem.id)}
                  disabled={completingId === workoutItem.id}
                  className="hover:bg-green-100 hover:text-green-600"
                  title="Complete Workout"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(workoutItem.id)}
                className="hover:bg-blue-100 hover:text-blue-600"
                title="Edit Workout"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(workoutItem.id)}
                disabled={deletingId === workoutItem.id}
                className="hover:bg-red-100 hover:text-red-600"
                title="Delete Workout"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
