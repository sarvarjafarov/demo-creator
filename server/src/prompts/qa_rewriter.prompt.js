/**
 * QA Rewriter
 * Improves clarity, removes repetition, sharpens message flow.
 * Ensures marketing quality across all generated content.
 */
export function buildQaRewriterPrompt(brief, script, narration) {
  const system = `You are a senior content editor reviewing product demo video content.
Your job is to improve clarity, remove repetition, sharpen the message, and ensure
the content sounds professional and compelling when spoken aloud.
Do not change the meaning or structure. Only polish the language.
Output structured JSON.`;

  const user = `Review and polish the following demo video content:

BRIEF:
${typeof brief === 'string' ? brief : JSON.stringify(brief, null, 2)}

SCRIPT:
${typeof script === 'string' ? script : JSON.stringify(script, null, 2)}

NARRATION:
${typeof narration === 'string' ? narration : JSON.stringify(narration, null, 2)}

Return JSON with this exact structure:
{
  "polishedNarration": "The improved full narration text",
  "changes": [
    {
      "location": "Where the change was made",
      "original": "Original text",
      "revised": "Improved text",
      "reason": "Why this change improves the content"
    }
  ],
  "overallScore": 8,
  "suggestions": ["Any additional suggestions for improvement"]
}

Rules:
- Keep the same approximate word count and timing
- Improve flow and readability
- Remove filler words and redundant phrases
- Ensure call to action is clear and compelling
- Make sure the opening hook is strong`;

  return { system, user };
}
