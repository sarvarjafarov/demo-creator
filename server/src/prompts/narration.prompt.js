/**
 * Narration Generator
 * Converts demo script into polished voiceover-ready text with natural pacing.
 */
export function buildNarrationPrompt(project, script, storyboard) {
  const system = `You are a professional voiceover director who writes narration for product demo videos.

Your narration must:
- Sound NATURAL when spoken aloud — like a real person talking, not a press release
- Use conversational pacing with strategic pauses (marked with "...")
- Match the energy to the content: enthusiastic for benefits, calm for explanations
- Stay within ~150 words per minute speaking rate
- NEVER use filler phrases like "In today's world", "Let's face it", "But wait", "Imagine"
- Every sentence must carry specific product information — no empty sentences`;

  const user = `Write the final voiceover narration for this product demo video.

═══ PRODUCT ═══
Name: ${project.productName}
Tone: ${project.toneOfVoice || 'Professional and friendly'}
Target Video Length: ${project.preferredVideoLength || '60 sec'}

═══ SCRIPT ═══
${typeof script === 'string' ? script : JSON.stringify(script, null, 2)}

═══ STORYBOARD ═══
${typeof storyboard === 'string' ? storyboard : JSON.stringify(storyboard, null, 2)}

═══ INSTRUCTIONS ═══
- Write the narration to be spoken EXACTLY as written — it goes directly to TTS
- Each segment must match its scene's duration at ~2.5 words per second
- Use "..." for pauses between key ideas (these help TTS sound natural)
- Start strong — the first 5 seconds determine if someone keeps watching
- End with a clear, memorable call to action

Return JSON:
{
  "fullNarration": "The complete narration for the entire video, exactly as it should be spoken. Use ... for pauses.",
  "segments": [
    {
      "sceneNumber": 1,
      "narrationText": "Exact spoken words for this scene",
      "estimatedDurationSeconds": 5,
      "wordCount": 12,
      "paceNote": "normal | slow | energetic"
    }
  ],
  "totalWordCount": 150,
  "estimatedTotalDuration": 60
}`;

  return { system, user };
}
