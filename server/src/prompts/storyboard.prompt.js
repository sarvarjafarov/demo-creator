/**
 * Storyboard Generator
 * Maps the script to available screenshots, creating a visual story arc.
 */
export function buildStoryboardPrompt(project, script, screenshotCount) {
  const system = `You are a video storyboard director for product demos.

You have ${screenshotCount} screenshot(s) of the actual product (screenshot_1 through screenshot_${screenshotCount}).
These screenshots show the product's real UI captured by scrolling through the product page/app.

Your job:
1. Match each script section to the MOST RELEVANT screenshot
2. Create a visual story arc: hook → show the product → highlight features → call to action
3. Each scene needs a clear headline overlay that SUMMARIZES the key point being made
4. Use varied motion effects for visual interest (zoom_in, pan_left, ken_burns, float, etc.)`;

  const user = `Create a storyboard for this demo video.

═══ PRODUCT ═══
Name: ${project.productName}
Video Length: ${project.preferredVideoLength || '60 sec'}
Available Screenshots: ${screenshotCount} (referenced as screenshot_1 through screenshot_${screenshotCount})
Call to Action: ${project.callToAction || 'Try it free today'}

═══ SCRIPT ═══
${typeof script === 'string' ? script : JSON.stringify(script, null, 2)}

═══ INSTRUCTIONS ═══
- screenshot_1 is the top of the page (hero/landing) — best for intro or overview
- screenshot_2, screenshot_3 are middle sections (features, how-it-works) — best for feature demos
- screenshot_${screenshotCount} is the bottom of the page (pricing, CTA, footer) — best for closing
- Each scene MUST have a textOverlay headline that reinforces the spoken message
- Use a DIFFERENT motion effect for each consecutive scene

Return JSON:
{
  "scenes": [
    {
      "sceneNumber": 1,
      "sceneName": "Hook / Opening",
      "durationSeconds": 5,
      "keyMessage": "What this scene communicates",
      "visualDescription": "What the viewer sees and why",
      "assetReference": "title_card | screenshot_1 | screenshot_2 | cta_card",
      "motionEffect": "zoom_in | zoom_out | pan_left | pan_right | ken_burns | float",
      "textOverlay": "Short punchy headline reinforcing the message",
      "transitionIn": "fade | cut",
      "transitionOut": "fade | cut"
    }
  ],
  "totalScenes": 6,
  "totalDuration": 60
}

Rules:
- First scene: title_card with product name (4-5s)
- Last scene: cta_card with call to action (5-6s)
- Middle scenes: screenshot-based, showing real product UI
- Use ALL available screenshots — don't skip any
- Each scene: 5-12 seconds, total must equal target video length
- Never use the same motion effect twice in a row`;

  return { system, user };
}
