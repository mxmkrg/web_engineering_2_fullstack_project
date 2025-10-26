import { getExercises } from "@/actions/get-exercises";
import { NewWorkoutForm } from "./_components/new-workout-form";

export default async function NewWorkoutPage() {
  const exercises = await getExercises();

  return <NewWorkoutForm exercises={exercises} />;
}
