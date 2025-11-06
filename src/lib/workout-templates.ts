export type ExerciseType = "compound" | "isolation" | "bodyweight";

export interface WorkoutTemplateExercise {
  name: string;
  baseWeight: number;
  baseReps: number;
  sets: number;
  progressionRate: number;
  type: ExerciseType;
}

export interface WorkoutTemplate {
  name: string;
  baseDuration: number;
  phase: string;
  exercises: WorkoutTemplateExercise[];
  description?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

// Comprehensive workout templates with realistic progression
export const workoutTemplates: Record<string, WorkoutTemplate> = {
  // Foundation Phase (Weeks 1-4)
  fullBodyA: {
    name: "Full Body Foundation A",
    baseDuration: 55,
    phase: "foundation",
    description:
      "A well-rounded full body workout focusing on fundamental movement patterns. Perfect for building strength and coordination.",
    difficulty: "beginner",
    exercises: [
      {
        name: "Squats",
        baseWeight: 45,
        baseReps: 8,
        sets: 3,
        progressionRate: 1.0,
        type: "compound",
      },
      {
        name: "Bench Press",
        baseWeight: 65,
        baseReps: 8,
        sets: 3,
        progressionRate: 0.8,
        type: "compound",
      },
      {
        name: "Bent-over Rows",
        baseWeight: 55,
        baseReps: 10,
        sets: 3,
        progressionRate: 0.9,
        type: "compound",
      },
      {
        name: "Overhead Press",
        baseWeight: 35,
        baseReps: 8,
        sets: 3,
        progressionRate: 0.6,
        type: "compound",
      },
      {
        name: "Planks",
        baseWeight: 0,
        baseReps: 30,
        sets: 3,
        progressionRate: 0,
        type: "bodyweight",
      },
    ],
  },

  fullBodyB: {
    name: "Full Body Foundation B",
    baseDuration: 50,
    phase: "foundation",
    description:
      "Alternative full body routine with different exercise variations. Great for recovery while maintaining progress.",
    difficulty: "beginner",
    exercises: [
      {
        name: "Deadlifts",
        baseWeight: 95,
        baseReps: 5,
        sets: 3,
        progressionRate: 1.1,
        type: "compound",
      },
      {
        name: "Incline Dumbbell Press",
        baseWeight: 25,
        baseReps: 10,
        sets: 3,
        progressionRate: 0.7,
        type: "compound",
      },
      {
        name: "Lat Pulldowns",
        baseWeight: 70,
        baseReps: 12,
        sets: 3,
        progressionRate: 0.8,
        type: "compound",
      },
      {
        name: "Dumbbell Shoulder Press",
        baseWeight: 20,
        baseReps: 10,
        sets: 3,
        progressionRate: 0.6,
        type: "isolation",
      },
      {
        name: "Bodyweight Squats",
        baseWeight: 0,
        baseReps: 15,
        sets: 2,
        progressionRate: 0,
        type: "bodyweight",
      },
    ],
  },

  // Strength Building Phase (Weeks 5-8)
  upperBody: {
    name: "Upper Body Power",
    baseDuration: 65,
    phase: "strength",
    description:
      "Intense upper body workout designed to build pressing and pulling strength with heavier weights.",
    difficulty: "intermediate",
    exercises: [
      {
        name: "Bench Press",
        baseWeight: 75,
        baseReps: 6,
        sets: 4,
        progressionRate: 0.9,
        type: "compound",
      },
      {
        name: "Bent-over Rows",
        baseWeight: 65,
        baseReps: 8,
        sets: 4,
        progressionRate: 1.0,
        type: "compound",
      },
      {
        name: "Overhead Press",
        baseWeight: 45,
        baseReps: 6,
        sets: 3,
        progressionRate: 0.7,
        type: "compound",
      },
      {
        name: "Dumbbell Bicep Curls",
        baseWeight: 15,
        baseReps: 12,
        sets: 3,
        progressionRate: 0.5,
        type: "isolation",
      },
      {
        name: "Tricep Dips",
        baseWeight: 0,
        baseReps: 8,
        sets: 3,
        progressionRate: 0,
        type: "bodyweight",
      },
      {
        name: "Face Pulls",
        baseWeight: 30,
        baseReps: 15,
        sets: 3,
        progressionRate: 0.4,
        type: "isolation",
      },
    ],
  },

  lowerBody: {
    name: "Lower Body Power",
    baseDuration: 60,
    phase: "strength",
    description:
      "Comprehensive lower body strength training focusing on squats, deadlifts, and unilateral movements.",
    difficulty: "intermediate",
    exercises: [
      {
        name: "Squats",
        baseWeight: 65,
        baseReps: 6,
        sets: 4,
        progressionRate: 1.1,
        type: "compound",
      },
      {
        name: "Romanian Deadlifts",
        baseWeight: 75,
        baseReps: 8,
        sets: 3,
        progressionRate: 1.0,
        type: "compound",
      },
      {
        name: "Bulgarian Split Squats",
        baseWeight: 0,
        baseReps: 10,
        sets: 3,
        progressionRate: 0,
        type: "bodyweight",
      },
      {
        name: "Calf Raises",
        baseWeight: 0,
        baseReps: 20,
        sets: 3,
        progressionRate: 0,
        type: "bodyweight",
      },
      {
        name: "Leg Curls",
        baseWeight: 45,
        baseReps: 12,
        sets: 3,
        progressionRate: 0.6,
        type: "isolation",
      },
      {
        name: "Walking Lunges",
        baseWeight: 0,
        baseReps: 16,
        sets: 2,
        progressionRate: 0,
        type: "bodyweight",
      },
    ],
  },

  // Muscle Building Phase (Weeks 9-12)
  pushDay: {
    name: "Push Day - Chest, Shoulders, Triceps",
    baseDuration: 70,
    phase: "hypertrophy",
    description:
      "Focused push-muscle training targeting chest, shoulders, and triceps for maximum muscle growth.",
    difficulty: "intermediate",
    exercises: [
      {
        name: "Bench Press",
        baseWeight: 85,
        baseReps: 8,
        sets: 4,
        progressionRate: 0.8,
        type: "compound",
      },
      {
        name: "Incline Dumbbell Press",
        baseWeight: 35,
        baseReps: 10,
        sets: 3,
        progressionRate: 0.7,
        type: "compound",
      },
      {
        name: "Overhead Press",
        baseWeight: 55,
        baseReps: 8,
        sets: 3,
        progressionRate: 0.6,
        type: "compound",
      },
      {
        name: "Lateral Raises",
        baseWeight: 10,
        baseReps: 15,
        sets: 3,
        progressionRate: 0.3,
        type: "isolation",
      },
      {
        name: "Tricep Pushdowns",
        baseWeight: 40,
        baseReps: 12,
        sets: 3,
        progressionRate: 0.5,
        type: "isolation",
      },
      {
        name: "Push-ups",
        baseWeight: 0,
        baseReps: 12,
        sets: 2,
        progressionRate: 0,
        type: "bodyweight",
      },
    ],
  },

  pullDay: {
    name: "Pull Day - Back, Biceps",
    baseDuration: 65,
    phase: "hypertrophy",
    description:
      "Comprehensive back and bicep workout designed to build pulling strength and muscle mass.",
    difficulty: "intermediate",
    exercises: [
      {
        name: "Deadlifts",
        baseWeight: 135,
        baseReps: 5,
        sets: 4,
        progressionRate: 1.0,
        type: "compound",
      },
      {
        name: "Lat Pulldowns",
        baseWeight: 90,
        baseReps: 10,
        sets: 4,
        progressionRate: 0.8,
        type: "compound",
      },
      {
        name: "Bent-over Rows",
        baseWeight: 85,
        baseReps: 8,
        sets: 3,
        progressionRate: 0.9,
        type: "compound",
      },
      {
        name: "Face Pulls",
        baseWeight: 35,
        baseReps: 15,
        sets: 3,
        progressionRate: 0.4,
        type: "isolation",
      },
      {
        name: "Barbell Bicep Curls",
        baseWeight: 25,
        baseReps: 12,
        sets: 3,
        progressionRate: 0.5,
        type: "isolation",
      },
      {
        name: "Hammer Curls",
        baseWeight: 15,
        baseReps: 12,
        sets: 3,
        progressionRate: 0.4,
        type: "isolation",
      },
    ],
  },

  legDay: {
    name: "Leg Day - Quads, Hamstrings, Glutes",
    baseDuration: 75,
    phase: "hypertrophy",
    description:
      "Intense lower body session focusing on maximum muscle development and strength gains.",
    difficulty: "advanced",
    exercises: [
      {
        name: "Squats",
        baseWeight: 95,
        baseReps: 8,
        sets: 4,
        progressionRate: 1.0,
        type: "compound",
      },
      {
        name: "Romanian Deadlifts",
        baseWeight: 105,
        baseReps: 8,
        sets: 4,
        progressionRate: 0.9,
        type: "compound",
      },
      {
        name: "Leg Press",
        baseWeight: 180,
        baseReps: 12,
        sets: 3,
        progressionRate: 1.2,
        type: "compound",
      },
      {
        name: "Leg Curls",
        baseWeight: 60,
        baseReps: 12,
        sets: 3,
        progressionRate: 0.6,
        type: "isolation",
      },
      {
        name: "Calf Raises",
        baseWeight: 45,
        baseReps: 20,
        sets: 4,
        progressionRate: 0.5,
        type: "isolation",
      },
      {
        name: "Walking Lunges",
        baseWeight: 25,
        baseReps: 16,
        sets: 3,
        progressionRate: 0.3,
        type: "compound",
      },
    ],
  },

  // Refinement Phase (Weeks 13-16)
  strengthFocus: {
    name: "Strength Focus Session",
    baseDuration: 80,
    phase: "refinement",
    description:
      "Heavy compound movements with lower reps to maximize strength gains and test your limits.",
    difficulty: "advanced",
    exercises: [
      {
        name: "Squats",
        baseWeight: 115,
        baseReps: 5,
        sets: 5,
        progressionRate: 0.8,
        type: "compound",
      },
      {
        name: "Bench Press",
        baseWeight: 105,
        baseReps: 5,
        sets: 5,
        progressionRate: 0.7,
        type: "compound",
      },
      {
        name: "Deadlifts",
        baseWeight: 155,
        baseReps: 3,
        sets: 4,
        progressionRate: 0.9,
        type: "compound",
      },
      {
        name: "Overhead Press",
        baseWeight: 65,
        baseReps: 5,
        sets: 4,
        progressionRate: 0.5,
        type: "compound",
      },
      {
        name: "Planks",
        baseWeight: 25,
        baseReps: 45,
        sets: 3,
        progressionRate: 0.2,
        type: "bodyweight",
      },
    ],
  },

  volumeSession: {
    name: "Volume Session",
    baseDuration: 90,
    phase: "refinement",
    description:
      "High-volume workout with moderate weights to improve muscular endurance and work capacity.",
    difficulty: "advanced",
    exercises: [
      {
        name: "Goblet Squats",
        baseWeight: 35,
        baseReps: 15,
        sets: 4,
        progressionRate: 0.6,
        type: "compound",
      },
      {
        name: "Incline Dumbbell Press",
        baseWeight: 45,
        baseReps: 12,
        sets: 4,
        progressionRate: 0.6,
        type: "compound",
      },
      {
        name: "Lat Pulldowns",
        baseWeight: 110,
        baseReps: 12,
        sets: 4,
        progressionRate: 0.7,
        type: "compound",
      },
      {
        name: "Leg Press",
        baseWeight: 220,
        baseReps: 15,
        sets: 4,
        progressionRate: 1.0,
        type: "compound",
      },
      {
        name: "Dumbbell Shoulder Press",
        baseWeight: 30,
        baseReps: 12,
        sets: 3,
        progressionRate: 0.5,
        type: "isolation",
      },
      {
        name: "Cable Rows",
        baseWeight: 80,
        baseReps: 15,
        sets: 3,
        progressionRate: 0.6,
        type: "compound",
      },
      {
        name: "Push-ups",
        baseWeight: 0,
        baseReps: 20,
        sets: 3,
        progressionRate: 0,
        type: "bodyweight",
      },
    ],
  },
};

export const getTemplateKeys = () => Object.keys(workoutTemplates);
export const getTemplate = (key: string) => workoutTemplates[key];
export const getAllTemplates = () => workoutTemplates;
