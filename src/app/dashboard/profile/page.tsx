"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, User, Target, Calendar, Clock, AlertCircle } from "lucide-react"
import BlurText from "./_components/BlurText"
import PillNav from "./_components/PillNav"
import { 
  saveBasicInfo, 
  savePhysicalInfo, 
  saveTrainingPreferences, 
  saveLimitations 
} from "@/actions/save-profile"

type UserProfile = {
  id?: number
  userId: string
  age?: number | null
  gender?: string | null
  heightCm?: number | null
  weightKg?: number | null
  trainingGoal?: string | null
  trainingDaysPerWeek?: number | null
  sessionDurationMinutes?: number | null
  exerciseLimitations?: string | null
  createdAt?: Date
  updatedAt?: Date
}

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeSection, setActiveSection] = useState(0)
  const [profile, setProfile] = useState<UserProfile>({
    userId: "",
    age: undefined,
    gender: "",
    heightCm: undefined,
    weightKg: undefined,
    trainingGoal: "",
    trainingDaysPerWeek: undefined,
    sessionDurationMinutes: undefined,
    exerciseLimitations: "",
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const handleAnimationComplete = () => {
    console.log('Animation completed!')
  }

  const navigationItems = [
    { label: 'Basic Info', id: 'basic' },
    { label: 'Physical', id: 'physical' },
    { label: 'Training', id: 'training' },
    { label: 'Limitations', id: 'limitations' }
  ]

  const handleSectionChange = (item: any, index: number) => {
    setActiveSection(index)
  }

  // Section-specific save handlers
  const handleSaveBasicInfo = async () => {
    setIsSaving(true)
    try {
      const result = await saveBasicInfo(profile.age ?? undefined, profile.gender ?? undefined)
      
      if (result.success) {
        toast.success(result.message)
        if (result.profile) {
          setProfile(prev => ({
            ...prev,
            id: result.profile.id,
            age: result.profile.age ?? prev.age,
            gender: result.profile.gender ?? prev.gender,
            createdAt: result.profile.createdAt ?? prev.createdAt,
            updatedAt: result.profile.updatedAt ?? prev.updatedAt
          }))
        }
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error("Error saving basic info:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePhysicalInfo = async () => {
    setIsSaving(true)
    try {
      const result = await savePhysicalInfo(profile.heightCm ?? undefined, profile.weightKg ?? undefined)
      
      if (result.success) {
        toast.success(result.message)
        if (result.profile) {
          setProfile(prev => ({
            ...prev,
            id: result.profile.id,
            heightCm: result.profile.heightCm ?? prev.heightCm,
            weightKg: result.profile.weightKg ?? prev.weightKg,
            createdAt: result.profile.createdAt ?? prev.createdAt,
            updatedAt: result.profile.updatedAt ?? prev.updatedAt
          }))
        }
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error("Error saving physical info:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveTrainingPreferences = async () => {
    setIsSaving(true)
    try {
      const result = await saveTrainingPreferences(
        profile.trainingGoal ?? undefined,
        profile.trainingDaysPerWeek ?? undefined,
        profile.sessionDurationMinutes ?? undefined
      )
      
      if (result.success) {
        toast.success(result.message)
        if (result.profile) {
          setProfile(prev => ({
            ...prev,
            id: result.profile.id,
            trainingGoal: result.profile.trainingGoal ?? prev.trainingGoal,
            trainingDaysPerWeek: result.profile.trainingDaysPerWeek ?? prev.trainingDaysPerWeek,
            sessionDurationMinutes: result.profile.sessionDurationMinutes ?? prev.sessionDurationMinutes,
            createdAt: result.profile.createdAt ?? prev.createdAt,
            updatedAt: result.profile.updatedAt ?? prev.updatedAt
          }))
        }
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error("Error saving training preferences:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveLimitations = async () => {
    setIsSaving(true)
    try {
      const result = await saveLimitations(profile.exerciseLimitations ?? undefined)
      
      if (result.success) {
        toast.success(result.message)
        if (result.profile) {
          setProfile(prev => ({
            ...prev,
            id: result.profile.id,
            exerciseLimitations: result.profile.exerciseLimitations ?? prev.exerciseLimitations,
            createdAt: result.profile.createdAt ?? prev.createdAt,
            updatedAt: result.profile.updatedAt ?? prev.updatedAt
          }))
        }
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error("Error saving limitations:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  const loadProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/profile")
      const result = await response.json()

      if (result.success && result.profile) {
        setProfile(result.profile)
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      toast.error("Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }



  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-sm text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8 animate-slide-in-from-top">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
            <User className="h-7 w-7 text-white" />
          </div>
          <div>
            <BlurText
              text="User Profile"
              delay={150}
              animateBy="words"
              direction="top"
              onAnimationComplete={handleAnimationComplete}
              className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
            />
            <p className="text-muted-foreground text-sm mt-1">
              Manage your personal information and training preferences
            </p>
          </div>
        </div>
      </div>

      <div>

        {/* Personal Information with PillNav - Full Width */}
        <Card className=" w-full md:w-[800px] h-[550px] border-blue-100 dark:border-blue-900 shadow-sm hover:shadow-md transition-all duration-300 animate-slide-in-from-left" style={{ animationDelay: "100ms" }}>
            <CardHeader className="border-b border-blue-50 dark:border-blue-900/50 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/30">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                  <CardDescription>Navigate through different sections of your profile</CardDescription>
                </div>
              </div>

              <PillNav
                items={navigationItems}
                activeHref=""
                className="profile-nav"
                ease="power2.easeOut"
                baseColor="#2563eb"
                pillColor="#ffffff"
                hoveredPillTextColor="#2563eb"
                pillTextColor="#ffffff"
                onItemClick={handleSectionChange}
              />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="min-h-[300px]">
                {/* Basic Info Section */}
                {activeSection === 0 && (
                  <div className="animate-fade-in">
                    <h3 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 group">
                        <Label htmlFor="age" className="text-sm font-medium flex items-center gap-2">
                          Age
                          <span className="text-blue-600">*</span>
                        </Label>
                        <Input
                          id="age"
                          type="number"
                          min="1"
                          max="120"
                          value={profile.age || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, age: e.target.value ? parseInt(e.target.value) : undefined })
                          }
                          placeholder="Enter your age"
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-2 group">
                        <Label htmlFor="gender" className="text-sm font-medium flex items-center gap-2">
                          Gender
                          <span className="text-blue-600">*</span>
                        </Label>
                        <Select
                          value={profile.gender || ""}
                          onValueChange={(value) => setProfile({ ...profile, gender: value })}
                        >
                          <SelectTrigger id="gender" className="bg-white dark:bg-gray-800 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                            <SelectItem value="male" className="hover:bg-blue-50 dark:hover:bg-blue-900/50">Male</SelectItem>
                            <SelectItem value="female" className="hover:bg-blue-50 dark:hover:bg-blue-900/50">Female</SelectItem>
                            <SelectItem value="other" className="hover:bg-blue-50 dark:hover:bg-blue-900/50">Other</SelectItem>
                            <SelectItem value="prefer_not_to_say" className="hover:bg-blue-50 dark:hover:bg-blue-900/50">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Save Button for Basic Info */}
                    <div className="flex justify-end mt-6 pt-4 border-t border-blue-100">
                      <Button
                        type="button"
                        onClick={handleSaveBasicInfo}
                        disabled={isSaving}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/40"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Basic Info"
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Physical Section */}
                {activeSection === 1 && (
                  <div className="animate-fade-in">
                    <h3 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Physical Measurements
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 group">
                        <Label htmlFor="height" className="text-sm font-medium flex items-center gap-2">
                          Height (cm)
                          <span className="text-blue-600">*</span>
                        </Label>
                        <Input
                          id="height"
                          type="number"
                          min="50"
                          max="300"
                          value={profile.heightCm || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, heightCm: e.target.value ? parseInt(e.target.value) : undefined })
                          }
                          placeholder="Enter your height"
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-2 group">
                        <Label htmlFor="weight" className="text-sm font-medium flex items-center gap-2">
                          Weight (kg)
                          <span className="text-blue-600">*</span>
                        </Label>
                        <Input
                          id="weight"
                          type="number"
                          min="20"
                          max="500"
                          step="0.1"
                          value={profile.weightKg || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, weightKg: e.target.value ? parseFloat(e.target.value) : undefined })
                          }
                          placeholder="Enter your weight"
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Save Button for Physical */}
                    <div className="flex justify-end mt-6 pt-4 border-t border-blue-100">
                      <Button
                        type="button"
                        onClick={handleSavePhysicalInfo}
                        disabled={isSaving}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/40"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Physical Info"
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Training Section */}
                {activeSection === 2 && (
                  <div className="animate-fade-in">
                    <h3 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Training Preferences
                    </h3>
                    <div className="space-y-6">
                      <div className="space-y-2 group">
                        <Label htmlFor="trainingGoal" className="text-sm font-medium flex items-center gap-2">
                          <Target className="h-3.5 w-3.5 text-blue-600" />
                          Training Goal
                          <span className="text-blue-600">*</span>
                        </Label>
                        <Select
                          value={profile.trainingGoal || ""}
                          onValueChange={(value) => setProfile({ ...profile, trainingGoal: value })}
                        >
                          <SelectTrigger id="trainingGoal" className="bg-white dark:bg-gray-800 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <SelectValue placeholder="Select your training goal" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                            <SelectItem value="strength" className="hover:bg-blue-50 dark:hover:bg-blue-900/50">💪 Strength</SelectItem>
                            <SelectItem value="muscle_gain" className="hover:bg-blue-50 dark:hover:bg-blue-900/50">🏋️ Muscle Gain</SelectItem>
                            <SelectItem value="fat_loss" className="hover:bg-blue-50 dark:hover:bg-blue-900/50">🔥 Fat Loss</SelectItem>
                            <SelectItem value="health" className="hover:bg-blue-50 dark:hover:bg-blue-900/50">❤️ General Health</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 group">
                          <Label htmlFor="trainingDays" className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-blue-600" />
                            Training Days per Week
                            <span className="text-blue-600">*</span>
                          </Label>
                          <Input
                            id="trainingDays"
                            type="number"
                            min="1"
                            max="7"
                            value={profile.trainingDaysPerWeek || ""}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                trainingDaysPerWeek: e.target.value ? parseInt(e.target.value) : undefined,
                              })
                            }
                            placeholder="e.g., 3"
                            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div className="space-y-2 group">
                          <Label htmlFor="sessionDuration" className="text-sm font-medium flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-blue-600" />
                            Session Duration (minutes)
                            <span className="text-blue-600">*</span>
                          </Label>
                          <Input
                            id="sessionDuration"
                            type="number"
                            min="15"
                            max="300"
                            step="15"
                            value={profile.sessionDurationMinutes || ""}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                sessionDurationMinutes: e.target.value ? parseInt(e.target.value) : undefined,
                              })
                            }
                            placeholder="e.g., 60"
                            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Save Button for Training */}
                    <div className="flex justify-end mt-6 pt-4 border-t border-blue-100">
                      <Button
                        type="button"
                        onClick={handleSaveTrainingPreferences}
                        disabled={isSaving}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/40"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Training Preferences"
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Limitations Section */}
                {activeSection === 3 && (
                  <div className="animate-fade-in">
                    <h3 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Exercise Limitations
                    </h3>
                    <div className="space-y-2 group">

                      <Textarea
                        id="limitations"
                        value={profile.exerciseLimitations || ""}
                        onChange={(e) => setProfile({ ...profile, exerciseLimitations: e.target.value })}
                        placeholder="(Optional) Enter any injuries, limitations, or exercises to avoid..."
                        rows={6}
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        style={{ minHeight: 60 }}

                      />
                      <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>List any injuries, physical limitations, or exercises you need to avoid</span>
                      </p>
                    </div>

                    {/* Save Button for Limitations */}
                    <div className="flex justify-end mt-6 pt-4 border-t border-blue-100">
                      <Button
                        type="button"
                        onClick={handleSaveLimitations}
                        disabled={isSaving}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/40"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Limitations"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}

