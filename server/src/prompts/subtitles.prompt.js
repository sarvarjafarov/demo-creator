/**
 * Subtitle Generator
 * Produces subtitle chunks aligned to script sections.
 */
export function buildSubtitlesPrompt(narration, storyboard) {
  const system = `You are a subtitle editor for product demo videos.
Create subtitle segments that are easy to read on screen.
Each subtitle should be 1-2 short lines, max 42 characters per line.
Align subtitles to scene boundaries from the storyboard.
Output structured JSON.`;

  const user = `Create subtitles for this narration:

NARRATION:
${typeof narration === 'string' ? narration : JSON.stringify(narration, null, 2)}

STORYBOARD:
${typeof storyboard === 'string' ? storyboard : JSON.stringify(storyboard, null, 2)}

Return JSON with this exact structure:
{
  "subtitles": [
    {
      "index": 1,
      "startSeconds": 0.0,
      "endSeconds": 3.5,
      "text": "Subtitle text here"
    }
  ],
  "totalCount": 20,
  "srtContent": "1\\n00:00:00,000 --> 00:00:03,500\\nSubtitle text here\\n\\n2\\n..."
}

Rules:
- Keep each subtitle under 2 lines
- Each line max 42 characters
- No subtitle longer than 5 seconds
- Subtitles should cover the entire narration
- Include the full SRT-formatted content in srtContent`;

  return { system, user };
}
