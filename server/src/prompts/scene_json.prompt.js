/**
 * Scene JSON Generator
 * Produces structured machine-readable output for video assembly.
 * This is the final output that the FFmpeg pipeline consumes.
 */
export function buildSceneJsonPrompt(project, storyboard, narration, screenshotCount) {
  const system = `You are a video production engineer.
Convert storyboard and narration into a precise machine-readable scene plan.
This JSON will be consumed directly by an automated video rendering pipeline.
Be exact with timing, asset references, and effect parameters.
Output valid JSON only.`;

  const user = `Generate the final scene plan JSON for video assembly:

PRODUCT: ${project.productName}
VIDEO LENGTH: ${project.preferredVideoLength || '60 sec'}
AVAILABLE SCREENSHOTS: ${screenshotCount} (referenced as screenshot_1 through screenshot_${screenshotCount})
CALL TO ACTION: ${project.callToAction || 'Try it free today'}

STORYBOARD:
${typeof storyboard === 'string' ? storyboard : JSON.stringify(storyboard, null, 2)}

NARRATION:
${typeof narration === 'string' ? narration : JSON.stringify(narration, null, 2)}

Return JSON with this exact structure:
{
  "videoSettings": {
    "width": 1920,
    "height": 1080,
    "fps": 30,
    "totalDurationSeconds": 60
  },
  "scenes": [
    {
      "sceneNumber": 1,
      "sceneType": "title_card | screenshot | cta_card",
      "durationSeconds": 5,
      "startTime": 0,
      "endTime": 5,
      "headline": "Optional headline text",
      "bodyText": "Optional body text",
      "voiceoverText": "Narration for this scene",
      "visualDirection": "Description of what to show",
      "assetReference": "screenshot_1 or null for generated cards",
      "effect": {
        "type": "zoom_in | zoom_out | pan_left | pan_right | fade | static",
        "intensity": 0.1
      },
      "transition": {
        "in": "fade | cut",
        "out": "fade | cut",
        "durationSeconds": 0.5
      },
      "textOverlays": [
        {
          "text": "Text to show",
          "position": "center | bottom | top",
          "style": "headline | body | caption"
        }
      ]
    }
  ]
}

Rules:
- First scene must be sceneType "title_card"
- Last scene must be sceneType "cta_card"
- Middle scenes use "screenshot" type
- startTime and endTime must be continuous with no gaps
- All times in seconds
- Total of all scene durations must equal totalDurationSeconds`;

  return { system, user };
}
