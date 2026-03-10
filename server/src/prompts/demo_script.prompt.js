/**
 * Demo Script Generator
 * Generates a concise, persuasive, scene-ready script for the product demo video.
 */
export function buildDemoScriptPrompt(project, brief) {
  const system = `You are a professional video scriptwriter specializing in product demo videos.
Write scripts that are concise, persuasive, and ready for voiceover recording.
Each line should be natural to speak aloud. Avoid jargon unless the audience expects it.
Output structured JSON.`;

  const user = `Write a demo video script based on:

PRODUCT: ${project.productName}
DESCRIPTION: ${project.shortDescription}
VIDEO LENGTH: ${project.preferredVideoLength || '60 sec'}
DEMO STYLE: ${project.preferredDemoStyle || 'clean SaaS demo'}
CALL TO ACTION: ${project.callToAction || 'Try it free today'}

CREATIVE BRIEF:
${typeof brief === 'string' ? brief : JSON.stringify(brief, null, 2)}

Return JSON with this exact structure:
{
  "title": "Script title",
  "totalDurationSeconds": 60,
  "sections": [
    {
      "sectionNumber": 1,
      "sectionName": "Hook",
      "durationSeconds": 8,
      "scriptText": "The spoken words for this section",
      "purpose": "Why this section exists",
      "visualNote": "Brief note on what should be shown"
    }
  ],
  "fullScript": "Complete script text joined together for voiceover"
}`;

  return { system, user };
}
