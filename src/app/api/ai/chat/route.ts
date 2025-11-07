import { type NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is required");
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Simple token counter (rough estimation: 1 token ≈ 4 characters for English)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Truncate messages if they exceed token limit
function truncateMessages(messages: any[], maxTokens: number = 15000) {
  let totalTokens = 0;
  const truncatedMessages = [];

  // Always keep system message (first message)
  if (messages.length > 0) {
    truncatedMessages.push(messages[0]);
    totalTokens += estimateTokens(JSON.stringify(messages[0]));
  }

  // Add messages from newest to oldest until we hit limit
  for (let i = messages.length - 1; i >= 1; i--) {
    const messageTokens = estimateTokens(JSON.stringify(messages[i]));
    if (totalTokens + messageTokens <= maxTokens) {
      truncatedMessages.splice(1, 0, messages[i]); // Insert after system message
      totalTokens += messageTokens;
    } else {
      break;
    }
  }

  return { messages: truncatedMessages, totalTokens };
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    // Estimate and log token usage
    const originalTokens = estimateTokens(JSON.stringify(messages));
    console.log(`🔢 ORIGINAL TOKEN COUNT: ${originalTokens}`);

    // Truncate if necessary - use much lower limit to stay under OpenAI limits
    const { messages: truncatedMessages, totalTokens } = truncateMessages(
      messages,
      15000,
    );

    if (truncatedMessages.length < messages.length) {
      console.log(
        `✂️ TRUNCATED: ${messages.length} -> ${truncatedMessages.length} messages`,
      );
      console.log(`🔢 TRUNCATED TOKEN COUNT: ${totalTokens}`);
    }

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: truncatedMessages,
      temperature: 0.7,
      max_tokens: 500, // Limit response length to reduce total tokens
    });

    // Log usage statistics
    if (completion.usage) {
      console.log(`📊 ACTUAL USAGE:`, {
        prompt_tokens: completion.usage.prompt_tokens,
        completion_tokens: completion.usage.completion_tokens,
        total_tokens: completion.usage.total_tokens,
      });
    }

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
