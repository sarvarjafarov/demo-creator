/**
 * QA Rewriter
 * Final quality pass — ensures narration is natural, specific, and compelling.
 */
export function buildQaRewriterPrompt(brief, script, narration) {
  const system = `You are a senior creative director doing the final quality pass on a product demo video narration.

Your job is to make the narration PERFECT for text-to-speech:
1. Remove ANY generic marketing fluff ("revolutionize", "game-changing", "seamless", "robust")
2. Replace vague claims with SPECIFIC product details from the brief
3. Ensure every sentence sounds natural when spoken aloud at conversational pace
4. Kill repetition — if two sentences make the same point, merge or cut one
5. The opening MUST grab attention in 3 seconds — no slow buildups
6. The CTA MUST be concrete and actionable

Read the narration aloud in your head. If any sentence sounds like it came from a corporate press release, rewrite it to sound human.`;

  const user = `Polish this narration for a product demo video.

═══ BRIEF ═══
${typeof brief === 'string' ? brief : JSON.stringify(brief, null, 2)}

═══ SCRIPT ═══
${typeof script === 'string' ? script : JSON.stringify(script, null, 2)}

═══ NARRATION TO POLISH ═══
${typeof narration === 'string' ? narration : JSON.stringify(narration, null, 2)}

═══ QUALITY CHECKLIST ═══
Before returning, verify:
- [ ] Opening sentence names a SPECIFIC problem (not "managing X is hard")
- [ ] Every feature mention includes a CONCRETE benefit
- [ ] No two consecutive sentences start the same way
- [ ] No buzzwords or filler phrases
- [ ] Word count is ~150 words (60-second video at 2.5 words/sec)
- [ ] Call to action tells the viewer EXACTLY what to do next

Return JSON:
{
  "polishedNarration": "The perfected narration text, ready for TTS. Use ... for natural pauses.",
  "changes": [
    {
      "location": "Where the change was made",
      "original": "Original text",
      "revised": "Improved text",
      "reason": "Why"
    }
  ],
  "overallScore": 8,
  "suggestions": ["Any remaining improvement ideas"]
}`;

  return { system, user };
}
