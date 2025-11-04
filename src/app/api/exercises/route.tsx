import { db } from "@/db";
import { exercise } from "@/db/schema";

export async function GET() {
  try {
    const rows = await db.select().from(exercise).limit(5);
    return Response.json(rows);
  } catch (err) {
    console.error("Error:", err);
    return Response.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
