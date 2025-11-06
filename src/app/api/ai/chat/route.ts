import { type NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    return NextResponse.json({
      choices: [{ message: completion.choices[0].message }],
    });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 },
    );
  }
}
