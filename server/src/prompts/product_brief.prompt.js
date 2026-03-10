/**
 * Product Brief Generator
 * Transforms raw user inputs into a polished creative brief for demo video production.
 */
export function buildProductBriefPrompt(project) {
  const system = `You are a product marketing expert creating creative briefs for product demo videos.
Output a structured JSON creative brief. Be concise and action-oriented.
Focus on what makes this product compelling for the target audience.`;

  const user = `Create a creative brief for a product demo video based on these inputs:

Product Name: ${project.productName}
Category: ${project.productCategory || 'Not specified'}
Description: ${project.shortDescription}
Target Audience: ${project.targetAudience || 'General audience'}
Product URL: ${project.productUrl || 'Not provided'}
Demo Style: ${project.preferredDemoStyle || 'clean SaaS demo'}
Video Length: ${project.preferredVideoLength || '60 sec'}
Call to Action: ${project.callToAction || 'Try it free today'}
Brand Colors: ${project.brandColors || 'Not specified'}
Tone of Voice: ${project.toneOfVoice || 'Professional and friendly'}
Key Features: ${project.keyFeatures || 'Not specified'}
Competitors: ${project.competitorNames || 'Not specified'}
Desired Outcome: ${project.desiredOutcome || 'Increase awareness and signups'}

Return JSON with this exact structure:
{
  "productSummary": "One-paragraph summary of the product and its value",
  "targetPersona": "Who this demo is for, their pain points",
  "keyMessages": ["message1", "message2", "message3"],
  "uniqueSellingPoints": ["usp1", "usp2", "usp3"],
  "toneGuidelines": "How the demo should feel",
  "videoObjective": "What this video should achieve",
  "estimatedSceneCount": 5,
  "suggestedHook": "Opening hook to grab attention in first 3 seconds"
}`;

  return { system, user };
}
