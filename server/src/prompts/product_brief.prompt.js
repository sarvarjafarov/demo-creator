/**
 * Product Brief Generator
 * Deep product analysis → compelling creative brief.
 * When screenshots are available, Nova analyzes them visually (multimodal).
 */
export function buildProductBriefPrompt(project, { hasScreenshots = false } = {}) {
  const system = `You are a world-class product marketing strategist who creates creative briefs for demo videos.

Your process:
1. DEEPLY ANALYZE the product description — extract every feature, benefit, and use case mentioned
2. IDENTIFY the core value proposition — what problem does this solve and why should anyone care?
3. MAP the user journey — from first impression to "aha moment" to conversion
4. CRAFT messaging that speaks directly to the target audience's pain points
${hasScreenshots ? `5. ANALYZE the attached screenshots — study the UI, identify key screens, note the visual hierarchy, color scheme, and what features are visible. Use these visual insights to make the brief concrete and specific.` : ''}

You must be SPECIFIC — never use generic marketing language. Every message should be grounded in the actual product details provided.`;

  let user = `Analyze this product deeply and create a creative brief for a 60-second demo video.

═══ PRODUCT DETAILS ═══
Product Name: ${project.productName}
Category: ${project.productCategory || 'Not specified'}
Target Audience: ${project.targetAudience || 'General audience'}
Product URL: ${project.productUrl || 'Not provided'}
Call to Action: ${project.callToAction || 'Try it free today'}
Demo Style: ${project.preferredDemoStyle || 'clean SaaS demo'}
Video Length: ${project.preferredVideoLength || '60 sec'}

═══ FULL PRODUCT DESCRIPTION (READ CAREFULLY) ═══
${project.shortDescription}

═══ ADDITIONAL CONTEXT ═══
Brand Colors: ${project.brandColors || 'Not specified'}
Tone of Voice: ${project.toneOfVoice || 'Professional and friendly'}
Key Features: ${project.keyFeatures || 'Not specified'}
Competitors: ${project.competitorNames || 'Not specified'}
Desired Outcome: ${project.desiredOutcome || 'Increase awareness and signups'}`;

  if (hasScreenshots) {
    user += `

═══ VISUAL ANALYSIS (SCREENSHOTS ATTACHED ABOVE) ═══
Study the attached screenshots carefully. For each screenshot, note:
- What screen/page is this? (dashboard, pricing, landing, settings, etc.)
- What key features or data are visible?
- What is the visual design quality and style?
- What would a first-time user notice most?`;
  }

  user += `

═══ INSTRUCTIONS ═══
Think step by step:
1. What is the SINGLE most compelling thing about this product?
2. What SPECIFIC pain point does it solve for the target audience?
3. What makes it DIFFERENT from alternatives?
4. What is the "aha moment" — the point where a viewer says "I need this"?

Return JSON:
{
  "productAnalysis": {
    "coreProblem": "The specific problem this product solves",
    "coreValue": "The one-sentence value proposition",
    "keyFeatures": ["feature1 with specific detail", "feature2 with specific detail", "feature3"],
    "targetPainPoints": ["specific pain point 1", "specific pain point 2"],
    "ahaMonent": "The moment in the demo that makes viewers want to try it",
    "competitiveEdge": "What makes this different/better"
  },
  "productSummary": "One compelling paragraph that sells this product (use actual features and numbers from the description)",
  "targetPersona": "Specific description of the ideal viewer — their role, daily frustrations, and what they're looking for",
  "keyMessages": ["message1 grounded in product details", "message2", "message3"],
  "uniqueSellingPoints": ["specific USP from the description", "specific USP", "specific USP"],
  "toneGuidelines": "How the demo should feel — specific guidance",
  "videoObjective": "What this video should achieve and what action the viewer should take",
  "estimatedSceneCount": 6,
  "suggestedHook": "A specific, punchy opening line that names the problem (not generic)"${hasScreenshots ? `,
  "visualInsights": {
    "dominantColors": ["color1", "color2"],
    "designStyle": "Specific description of the UI design style observed",
    "keyScreensIdentified": ["screen1 and what it shows", "screen2 and what it shows"],
    "highlightableElements": ["specific UI element worth showcasing"]
  }` : ''}
}`;

  return { system, user };
}
