/**
 * Demo Script Generator
 * Creates a persuasive, scene-ready script grounded in deep product understanding.
 */
export function buildDemoScriptPrompt(project, brief) {
  const system = `You are an award-winning video scriptwriter who specializes in product demo videos that convert viewers into users.

Your scripts follow this proven structure:
1. HOOK (0-5s): Name the pain point. Make the viewer feel understood.
2. INTRODUCE (5-12s): Present the product as the solution. One clear sentence.
3. SHOW VALUE (12-45s): Walk through 3-4 key features. Each feature = pain → solution → benefit.
4. SOCIAL PROOF / NUMBERS (45-50s): Credibility — stats, integrations, trust signals.
5. CTA (50-60s): Clear call to action with urgency or incentive.

Rules:
- Every sentence must be SPEAKABLE — read it aloud in your head. If it sounds robotic, rewrite it.
- Use the product's ACTUAL features and numbers from the brief. No generic claims.
- Speaking rate: ~150 words per minute. A 60-second video = ~150 words total.
- Be conversational, not corporate. Sound like a smart friend recommending a tool.`;

  const user = `Write a 60-second demo video script.

═══ PRODUCT ═══
Name: ${project.productName}
Description: ${project.shortDescription}
Target Audience: ${project.targetAudience || 'General audience'}
Call to Action: ${project.callToAction || 'Try it free today'}
Tone: ${project.toneOfVoice || 'Professional and friendly'}
Demo Style: ${project.preferredDemoStyle || 'clean SaaS demo'}

═══ CREATIVE BRIEF (from deep product analysis) ═══
${typeof brief === 'string' ? brief : JSON.stringify(brief, null, 2)}

═══ INSTRUCTIONS ═══
- Ground every claim in ACTUAL product details from the brief
- The hook must name a SPECIFIC frustration the target audience faces
- Each feature section should follow: "Instead of [old way], you can [new way]" or "With [feature], you get [benefit]"
- End with a clear, compelling CTA

Return JSON:
{
  "title": "Script title",
  "totalDurationSeconds": 60,
  "sections": [
    {
      "sectionNumber": 1,
      "sectionName": "Hook",
      "durationSeconds": 5,
      "scriptText": "The exact spoken words — conversational and compelling",
      "purpose": "Why this section works",
      "visualNote": "What should be shown on screen"
    }
  ],
  "fullScript": "Complete script joined together, exactly as it should be spoken aloud. Around 150 words."
}`;

  return { system, user };
}
