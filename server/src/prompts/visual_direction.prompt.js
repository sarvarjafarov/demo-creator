/**
 * Visual Direction Generator
 * Provides scene-by-scene visual guidance for video assembly.
 */
export function buildVisualDirectionPrompt(project, storyboard) {
  const system = `You are a creative director for product demo videos.
Provide specific visual direction for each scene that can be implemented with
simple effects: zoom, pan, fade, text overlays, and color backgrounds.
Do not suggest complex animations or 3D effects.
Output structured JSON.`;

  const user = `Provide visual direction for this demo video:

PRODUCT: ${project.productName}
BRAND COLORS: ${project.brandColors || 'Blue (#2563eb) and white'}
DEMO STYLE: ${project.preferredDemoStyle || 'clean SaaS demo'}

STORYBOARD:
${typeof storyboard === 'string' ? storyboard : JSON.stringify(storyboard, null, 2)}

Return JSON with this exact structure:
{
  "globalStyle": {
    "backgroundColor": "#1e3a8a",
    "textColor": "#ffffff",
    "accentColor": "#3b82f6",
    "fontStyle": "clean sans-serif"
  },
  "sceneDirections": [
    {
      "sceneNumber": 1,
      "backgroundColor": "#1e3a8a",
      "textColor": "#ffffff",
      "headlineSize": "large | medium | small",
      "screenshotFraming": "fullscreen | centered with padding | device mockup",
      "motionNotes": "Specific motion instructions",
      "overlayPosition": "top | center | bottom | lower-third"
    }
  ]
}`;

  return { system, user };
}
