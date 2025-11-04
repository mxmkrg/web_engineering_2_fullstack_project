// Debug script to check what set data exists
const { db } = require("./src/db/index.ts");
const { workout, workoutExercise, workoutSet } = require("./src/db/schema.ts");

async function debugSets() {
  console.log("=== Debugging Set Data ===");
  
  // Check total workouts
  const workoutsCount = await db.select().from(workout).limit(5);
  console.log("Sample workouts:", workoutsCount.length, workoutsCount[0]);
  
  // Check workout exercises
  const exercisesCount = await db.select().from(workoutExercise).limit(5);
  console.log("Sample workout exercises:", exercisesCount.length, exercisesCount[0]);
  
  // Check workout sets
  const setsCount = await db.select().from(workoutSet).limit(5);
  console.log("Sample workout sets:", setsCount.length, setsCount[0]);
  
  // Check the join query
  const joinQuery = await db
    .select({
      workoutId: workout.id,
      workoutName: workout.name,
      exerciseId: workoutExercise.id,
      setId: workoutSet.id,
    })
    .from(workout)
    .leftJoin(workoutExercise, eq(workout.id, workoutExercise.workoutId))
    .leftJoin(workoutSet, eq(workoutExercise.id, workoutSet.workoutExerciseId))
    .limit(10);
    
  console.log("Join query results:", joinQuery);
}

debugSets().catch(console.error);