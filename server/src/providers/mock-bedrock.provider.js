import logger from '../utils/logger.js';

/**
 * Mock Bedrock provider for local development without AWS credentials.
 * Returns realistic-looking sample data so the full UI flow can be tested.
 */
const mockBedrockProvider = {
  async invoke(prompt, systemPrompt, options = {}) {
    logger.info('Mock Bedrock: returning sample response');
    await delay(800); // Simulate API latency
    return '{"mock": true}';
  },

  async invokeJson(prompt, systemPrompt, options = {}) {
    logger.info('Mock Bedrock: returning sample JSON');
    await delay(800);

    // Detect which prompt type based on content
    if (prompt.includes('creative brief')) {
      return mockBrief();
    } else if (prompt.includes('demo video script') || prompt.includes('Write a demo video script')) {
      return mockScript();
    } else if (prompt.includes('storyboard')) {
      return mockStoryboard();
    } else if (prompt.includes('voiceover narration') || prompt.includes('Write voiceover narration')) {
      return mockNarration();
    } else if (prompt.includes('subtitles') || prompt.includes('Create subtitles')) {
      return mockSubtitles();
    } else if (prompt.includes('scene plan JSON') || prompt.includes('final scene plan')) {
      return mockSceneJson();
    } else if (prompt.includes('polish') || prompt.includes('Review and polish')) {
      return mockQa();
    } else if (prompt.includes('visual direction')) {
      return mockVisualDirection();
    }

    return { mock: true, note: 'Unrecognized prompt type' };
  },
};

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function mockBrief() {
  return {
    productSummary: 'A powerful yet intuitive platform that helps teams streamline their workflow, reduce manual tasks, and ship faster. Built for modern teams who value speed and simplicity.',
    targetPersona: 'Product managers and team leads at growing startups who are drowning in manual processes and need a tool that just works.',
    keyMessages: [
      'Save 10+ hours per week on repetitive tasks',
      'Get started in under 5 minutes with zero setup',
      'Trusted by 500+ teams worldwide',
    ],
    uniqueSellingPoints: [
      'One-click automation for common workflows',
      'Real-time collaboration without the complexity',
      'Integrates with tools you already use',
    ],
    toneGuidelines: 'Professional but approachable. Confident without being pushy. Focus on outcomes, not features.',
    videoObjective: 'Drive free trial signups by demonstrating how easy and powerful the product is.',
    estimatedSceneCount: 8,
    suggestedHook: 'What if you could automate your busywork in one click?',
  };
}

function mockScript() {
  return {
    title: 'Product Demo Script',
    totalDurationSeconds: 45,
    sections: [
      { sectionNumber: 1, sectionName: 'Hook', durationSeconds: 5, scriptText: 'What if you could automate your busywork in one click?', purpose: 'Grab attention', visualNote: 'Title card with product name' },
      { sectionNumber: 2, sectionName: 'Problem 1', durationSeconds: 6, scriptText: 'Teams waste hours on repetitive tasks every single day.', purpose: 'Establish pain point', visualNote: 'Show homepage screenshot' },
      { sectionNumber: 3, sectionName: 'Problem 2', durationSeconds: 6, scriptText: 'Copying data, updating statuses, sending the same notifications.', purpose: 'Deepen pain point', visualNote: 'Show feature section' },
      { sectionNumber: 4, sectionName: 'Solution', durationSeconds: 6, scriptText: 'A platform that automates your workflows so you can focus on what matters.', purpose: 'Introduce product', visualNote: 'Show product details' },
      { sectionNumber: 5, sectionName: 'Features', durationSeconds: 6, scriptText: 'Set up automations in seconds. Collaborate with your team in real-time.', purpose: 'Show key features', visualNote: 'Show integrations' },
      { sectionNumber: 6, sectionName: 'Ease of Use', durationSeconds: 5, scriptText: 'Connect to the tools you already use. No learning curve required.', purpose: 'Remove objections', visualNote: 'Show pricing/testimonials' },
      { sectionNumber: 7, sectionName: 'Social Proof', durationSeconds: 5, scriptText: 'Trusted by over 500 teams worldwide.', purpose: 'Build trust', visualNote: 'Show social proof section' },
      { sectionNumber: 8, sectionName: 'CTA', durationSeconds: 6, scriptText: 'Start your free trial today. See why teams love it.', purpose: 'Drive action', visualNote: 'CTA card' },
    ],
    fullScript: 'What if you could automate your busywork in one click? Teams waste hours on repetitive tasks every single day. Copying data, updating statuses, sending the same notifications. A platform that automates your workflows so you can focus on what matters. Set up automations in seconds. Collaborate with your team in real-time. Connect to the tools you already use. No learning curve required. Trusted by over 500 teams worldwide. Start your free trial today. See why teams love it.',
  };
}

function mockStoryboard() {
  return {
    scenes: [
      { sceneNumber: 1, sceneName: 'Hook', durationSeconds: 5, keyMessage: 'Grab attention', visualDescription: 'Title card with hook text', assetReference: 'title_card', motionEffect: 'fade_in', textOverlay: 'What if you could automate your busywork?', transitionIn: 'fade', transitionOut: 'fade' },
      { sceneNumber: 2, sceneName: 'Problem 1', durationSeconds: 6, keyMessage: 'Show the pain', visualDescription: 'Homepage overview', assetReference: 'screenshot_1', motionEffect: 'zoom_in', textOverlay: null, transitionIn: 'fade', transitionOut: 'fade' },
      { sceneNumber: 3, sceneName: 'Problem 2', durationSeconds: 6, keyMessage: 'Deepen the pain', visualDescription: 'Feature section', assetReference: 'screenshot_2', motionEffect: 'pan_left', textOverlay: null, transitionIn: 'fade', transitionOut: 'fade' },
      { sceneNumber: 4, sceneName: 'Solution', durationSeconds: 6, keyMessage: 'Introduce the answer', visualDescription: 'Product details', assetReference: 'screenshot_3', motionEffect: 'zoom_out', textOverlay: 'Automate Everything', transitionIn: 'fade', transitionOut: 'fade' },
      { sceneNumber: 5, sceneName: 'Features', durationSeconds: 6, keyMessage: 'Key capabilities', visualDescription: 'Integrations view', assetReference: 'screenshot_4', motionEffect: 'pan_right', textOverlay: null, transitionIn: 'fade', transitionOut: 'fade' },
      { sceneNumber: 6, sceneName: 'Ease of Use', durationSeconds: 5, keyMessage: 'Remove objections', visualDescription: 'Pricing or testimonials', assetReference: 'screenshot_5', motionEffect: 'zoom_in', textOverlay: 'Zero Learning Curve', transitionIn: 'fade', transitionOut: 'fade' },
      { sceneNumber: 7, sceneName: 'Social Proof', durationSeconds: 5, keyMessage: 'Build trust', visualDescription: 'Footer or social proof', assetReference: 'screenshot_6', motionEffect: 'pan_left', textOverlay: null, transitionIn: 'fade', transitionOut: 'fade' },
      { sceneNumber: 8, sceneName: 'CTA', durationSeconds: 6, keyMessage: 'Drive signups', visualDescription: 'CTA card', assetReference: 'cta_card', motionEffect: 'fade_in', textOverlay: 'Start Your Free Trial', transitionIn: 'fade', transitionOut: 'fade' },
    ],
    totalScenes: 8,
    totalDuration: 45,
  };
}

function mockNarration() {
  return {
    fullNarration: 'What if you could automate your busywork in just one click? Teams waste hours on repetitive tasks every single day. Copying data, updating statuses, sending the same notifications. A platform that automates your workflows so you can focus on what matters. Set up automations in seconds. Collaborate with your team in real-time. Connect to the tools you already use. No learning curve required. Trusted by over 500 teams worldwide. Start your free trial today. See why teams love it.',
    segments: [
      { sceneNumber: 1, narrationText: 'What if you could automate your busywork in just one click?', estimatedDurationSeconds: 5, wordCount: 12, paceNote: 'slow' },
      { sceneNumber: 2, narrationText: 'Teams waste hours on repetitive tasks every single day.', estimatedDurationSeconds: 6, wordCount: 9, paceNote: 'normal' },
      { sceneNumber: 3, narrationText: 'Copying data, updating statuses, sending the same notifications.', estimatedDurationSeconds: 6, wordCount: 9, paceNote: 'normal' },
      { sceneNumber: 4, narrationText: 'A platform that automates your workflows so you can focus on what matters.', estimatedDurationSeconds: 6, wordCount: 13, paceNote: 'normal' },
      { sceneNumber: 5, narrationText: 'Set up automations in seconds. Collaborate with your team in real-time.', estimatedDurationSeconds: 6, wordCount: 12, paceNote: 'energetic' },
      { sceneNumber: 6, narrationText: 'Connect to the tools you already use. No learning curve required.', estimatedDurationSeconds: 5, wordCount: 12, paceNote: 'normal' },
      { sceneNumber: 7, narrationText: 'Trusted by over 500 teams worldwide.', estimatedDurationSeconds: 5, wordCount: 7, paceNote: 'confident' },
      { sceneNumber: 8, narrationText: 'Start your free trial today. See why teams love it.', estimatedDurationSeconds: 6, wordCount: 10, paceNote: 'energetic' },
    ],
    totalWordCount: 84,
    estimatedTotalDuration: 45,
  };
}

function mockSubtitles() {
  return {
    subtitles: [
      { index: 1, startSeconds: 0, endSeconds: 4, text: 'What if you could automate\nyour busywork in one click?' },
      { index: 2, startSeconds: 5, endSeconds: 10, text: 'Teams waste hours on\nrepetitive tasks every day.' },
      { index: 3, startSeconds: 11, endSeconds: 16, text: 'Copying data, updating statuses,\nsending the same notifications.' },
      { index: 4, startSeconds: 17, endSeconds: 22, text: 'A platform that automates\nyour workflows.' },
      { index: 5, startSeconds: 23, endSeconds: 28, text: 'Set up automations in seconds.\nCollaborate in real-time.' },
      { index: 6, startSeconds: 29, endSeconds: 33, text: 'Connect to the tools you use.\nZero learning curve.' },
      { index: 7, startSeconds: 34, endSeconds: 38, text: 'Trusted by over 500\nteams worldwide.' },
      { index: 8, startSeconds: 39, endSeconds: 44, text: 'Start your free trial today.\nSee why teams love it.' },
    ],
    totalCount: 8,
    srtContent: `1\n00:00:00,000 --> 00:00:04,000\nWhat if you could automate\nyour busywork in one click?\n\n2\n00:00:05,000 --> 00:00:10,000\nTeams waste hours on\nrepetitive tasks every day.\n\n3\n00:00:11,000 --> 00:00:16,000\nCopying data, updating statuses,\nsending the same notifications.\n\n4\n00:00:17,000 --> 00:00:22,000\nA platform that automates\nyour workflows.\n\n5\n00:00:23,000 --> 00:00:28,000\nSet up automations in seconds.\nCollaborate in real-time.\n\n6\n00:00:29,000 --> 00:00:33,000\nConnect to the tools you use.\nZero learning curve.\n\n7\n00:00:34,000 --> 00:00:38,000\nTrusted by over 500\nteams worldwide.\n\n8\n00:00:39,000 --> 00:00:44,000\nStart your free trial today.\nSee why teams love it.`,
  };
}

function mockSceneJson() {
  return {
    videoSettings: { width: 1920, height: 1080, fps: 30, totalDurationSeconds: 45 },
    scenes: [
      {
        sceneNumber: 1, sceneType: 'title_card', durationSeconds: 4, startTime: 0, endTime: 4,
        headline: 'Product Demo', bodyText: 'Automate your workflow in one click',
        voiceoverText: 'What if you could automate your busywork in just one click?',
        assetReference: null,
        effect: { type: 'fade' },
      },
      {
        sceneNumber: 2, sceneType: 'screenshot', durationSeconds: 6, startTime: 4, endTime: 10,
        headline: 'Your Dashboard',
        voiceoverText: 'Teams waste hours on repetitive tasks every single day.',
        assetReference: 'screenshot_1',
        effect: { type: 'ken_burns' },
      },
      {
        sceneNumber: 3, sceneType: 'screenshot', durationSeconds: 6, startTime: 10, endTime: 16,
        voiceoverText: 'Copying data, updating statuses, sending the same notifications.',
        assetReference: 'screenshot_2',
        effect: { type: 'pan_left' },
      },
      {
        sceneNumber: 4, sceneType: 'screenshot', durationSeconds: 6, startTime: 16, endTime: 22,
        headline: 'Powerful Automation',
        voiceoverText: 'A platform that automates your workflows so you can focus on what matters.',
        assetReference: 'screenshot_3',
        effect: { type: 'zoom_out' },
      },
      {
        sceneNumber: 5, sceneType: 'screenshot', durationSeconds: 6, startTime: 22, endTime: 28,
        voiceoverText: 'Set up automations in seconds. Collaborate with your team in real-time.',
        assetReference: 'screenshot_4',
        effect: { type: 'float' },
      },
      {
        sceneNumber: 6, sceneType: 'screenshot', durationSeconds: 5, startTime: 28, endTime: 33,
        headline: 'Zero Learning Curve',
        voiceoverText: 'Connect to the tools you already use. No learning curve required.',
        assetReference: 'screenshot_2',
        effect: { type: 'zoom_in' },
      },
      {
        sceneNumber: 7, sceneType: 'screenshot', durationSeconds: 5, startTime: 33, endTime: 38,
        voiceoverText: 'Trusted by over 500 teams worldwide.',
        assetReference: 'screenshot_3',
        effect: { type: 'pan_right' },
      },
      {
        sceneNumber: 8, sceneType: 'cta_card', durationSeconds: 7, startTime: 38, endTime: 45,
        headline: 'Start Your Free Trial', bodyText: 'No credit card required',
        voiceoverText: 'Start your free trial today. See why teams love it.',
        assetReference: null,
        effect: { type: 'fade' },
      },
    ],
  };
}

function mockQa() {
  return {
    polishedNarration: 'What if you could automate your busywork in just one click? Teams waste hours on repetitive tasks every single day. Copying data, updating statuses, sending the same notifications. A platform that automates your workflows so you can focus on what truly matters. Set up automations in seconds. Collaborate with your team in real-time. Connect to the tools you already love. Zero learning curve. Trusted by over 500 teams worldwide. Start your free trial today. Join the teams who already made the switch.',
    changes: [
      { location: 'Scene 4', original: 'what matters', revised: 'what truly matters', reason: 'Stronger emotional impact' },
      { location: 'Scene 6', original: 'No learning curve required', revised: 'Zero learning curve', reason: 'More concise and punchy' },
      { location: 'Scene 8', original: 'See why teams love it', revised: 'Join the teams who already made the switch', reason: 'More actionable CTA' },
    ],
    overallScore: 9,
    suggestions: ['Consider adding a specific metric in the hook for more credibility'],
  };
}

function mockVisualDirection() {
  return {
    globalStyle: {
      backgroundColor: '#1e3a8a',
      textColor: '#ffffff',
      accentColor: '#3b82f6',
      fontStyle: 'clean sans-serif',
    },
    sceneDirections: [
      { sceneNumber: 1, backgroundColor: '#1e3a8a', textColor: '#ffffff', headlineSize: 'large', screenshotFraming: 'n/a', motionNotes: 'Fade in text elements sequentially', overlayPosition: 'center' },
      { sceneNumber: 2, backgroundColor: '#000000', textColor: '#ffffff', headlineSize: 'medium', screenshotFraming: 'fullscreen', motionNotes: 'Slow zoom in over 12 seconds', overlayPosition: 'lower-third' },
      { sceneNumber: 3, backgroundColor: '#000000', textColor: '#ffffff', headlineSize: 'medium', screenshotFraming: 'centered with padding', motionNotes: 'Left-to-right pan', overlayPosition: 'bottom' },
      { sceneNumber: 4, backgroundColor: '#000000', textColor: '#ffffff', headlineSize: 'small', screenshotFraming: 'fullscreen', motionNotes: 'Gentle zoom out', overlayPosition: 'lower-third' },
      { sceneNumber: 5, backgroundColor: '#1d4ed8', textColor: '#ffffff', headlineSize: 'large', screenshotFraming: 'n/a', motionNotes: 'Fade in with slight scale up', overlayPosition: 'center' },
    ],
  };
}

export default mockBedrockProvider;
