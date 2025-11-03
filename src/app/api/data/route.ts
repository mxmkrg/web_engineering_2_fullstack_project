import {getExercisesByCategory} from "@/actions/get-exercises";
import {NextResponse} from "next/server";

export async function GET() {
  try {
    const data = await getExercisesByCategory();
    return NextResponse.json(data, {status: 200});
  } catch (error) {
    console.error("Error in GET /api/data:", error);
    return NextResponse.json(
      {error: "Failed to fetch data"},
      {status: 500},
    );
  }
}
