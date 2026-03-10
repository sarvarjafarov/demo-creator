/**
 * Narration Generator
 * Produces voiceover-ready narration text with pacing awareness.
 */
export function buildNarrationPrompt(project, script, storyboard) {
  const system = `You are a professional voiceover script writer.
Write narration that sounds natural when spoken aloud. Use conversational pacing.
Include brief pauses (marked with "...") where the speaker should breathe.
Average speaking rate is ~150 words per minute. Time your narration accordingly.
Output structured JSON.`;

  const user = `Write voiceover narration for this product demo:

PRODUCT: ${project.productName}
VIDEO LENGTH: ${project.preferredVideoLength || '60 sec'}
TONE: ${project.toneOfVoice || 'Professional and friendly'}

SCRIPT:
${typeof script === 'string' ? script : JSON.stringify(script, null, 2)}

STORYBOARD:
${typeof storyboard === 'string' ? storyboard : JSON.stringify(storyboard, null, 2)}

Return JSON with this exact structure:
{
  "fullNarration": "Complete narration text for the entire video, ready for TTS",
  "segments": [
    {
      "sceneNumber": 1,
      "narrationText": "The spoken words for this scene",
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
