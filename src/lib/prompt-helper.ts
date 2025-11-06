import { ENHANCED_SYSTEM_PROMPT } from "@/app/dashboard/_components/prompts/Prompts"

// Simple token counter (rough estimation: 1 token ≈ 4 characters for English)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Helper function to create personalized system prompt with profile data
export function createPersonalizedPrompt(profileData: any, additionalPrompt?: string): string {
  let systemPrompt = ENHANCED_SYSTEM_PROMPT;

  // Add profile-specific guidance if profile exists
  if (profileData.hasProfile && profileData.profile) {
    const p = profileData.profile;
    systemPrompt += `\nUser: ${p.trainingGoal || "general"}, ${p.trainingDaysPerWeek || "?"}x/wk, ${p.sessionDurationMinutes || "?"}min, ${p.age || "?"}y, ${p.gender?.charAt(0) || "?"}, limits: ${p.exerciseLimitations?.slice(0, 2).join(",") || "none"}`;
  } else {
    systemPrompt += `\nUser: No profile`;
  }

  // Add additional specific prompt if provided
  if (additionalPrompt) {
    systemPrompt += `\n\n${additionalPrompt}`;
  }

  // Log token count for progress requests
  if (additionalPrompt && additionalPrompt.includes("progress")) {
    const tokenCount = estimateTokens(systemPrompt);
    console.log(`🔢 PROGRESS TOKEN COUNT:`, {
      systemPromptTokens: tokenCount,
      systemPromptLength: systemPrompt.length,
      additionalPromptTokens: estimateTokens(additionalPrompt),
      profileDataTokens: profileData ? estimateTokens(JSON.stringify(profileData)) : 0
    });
  }

  return systemPrompt;
}
