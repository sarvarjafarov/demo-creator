/**
 * Storyboard Generator
 * Breaks the script into scenes with purpose, key message, and suggested visuals.
 */
export function buildStoryboardPrompt(project, script, screenshotCount) {
  const system = `You are a video storyboard artist for product demos.
Create detailed scene-by-scene storyboards that map directly to available visual assets.
The user has uploaded ${screenshotCount} product screenshot(s). Reference them as screenshot_1, screenshot_2, etc.
Output structured JSON.`;

  const user = `Create a storyboard for this demo video:

PRODUCT: ${project.productName}
VIDEO LENGTH: ${project.preferredVideoLength || '60 sec'}
AVAILABLE SCREENSHOTS: ${screenshotCount}

SCRIPT:
${typeof script === 'string' ? script : JSON.stringify(script, null, 2)}

Return JSON with this exact structure:
{
  "scenes": [
    {
      "sceneNumber": 1,
      "sceneName": "Hook / Opening",
      "durationSeconds": 5,
      "keyMessage": "What this scene communicates",
      "visualDescription": "What the viewer sees",
      "assetReference": "title_card | screenshot_1 | screenshot_2 | cta_card",
      "motionEffect": "zoom_in | zoom_out | pan_left | pan_right | fade_in | static",
      "textOverlay": "Optional headline text shown on screen",
      "transitionIn": "fade | cut",
      "transitionOut": "fade | cut"
    }
  ],
  "totalScenes": 5,
  "totalDuration": 60
}

Rules:
- First scene should be a title_card with the product name
- Last scene should be a cta_card with the call to action
- Middle scenes use screenshot assets with motion effects
- Distribute screenshots evenly across middle scenes
- Each scene should be 5-15 seconds
- Total duration must match the target video length`;

  return { system, user };
}
