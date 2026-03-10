# Demo Creator - Judging One-Pager

## What It Does
Demo Creator automatically generates polished product demo videos from basic product information and screenshots, powered by Amazon Nova.

## The Problem
Product demo videos are essential for marketing but expensive and slow to create. Most small teams skip them entirely because the process requires scriptwriting, voiceover, video editing, and assembly skills.

## How It Works
1. User enters product details and uploads screenshots + voice sample
2. Amazon Nova generates script, storyboard, narration, and scene plan
3. ElevenLabs creates voiceover from the narration text
4. FFmpeg assembles screenshots into animated video with subtitles
5. User downloads a ready-to-share MP4

## Amazon Nova Integration (Core)
Nova powers a **7-step prompt chain** through Amazon Bedrock:

| Step | Nova Task | Output |
|------|-----------|--------|
| 1 | Product Brief | Creative brief with key messages and USPs |
| 2 | Demo Script | Scene-ready script with timing and visual notes |
| 3 | Storyboard | Scene breakdown with asset references and effects |
| 4 | Narration | Voiceover text with pacing awareness |
| 5 | QA Rewrite | Polished content for marketing quality |
| 6 | Subtitles | Timed subtitle segments in SRT format |
| 7 | Scene JSON | Machine-readable render instructions |

Nova is not an add-on - it is the creative brain that drives the entire pipeline. Each step feeds structured JSON to the next, creating a coherent chain from raw inputs to production-ready content.

## Tech Stack
- **AI**: Amazon Bedrock (Nova Pro) - 8 modular prompt modules
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Voice**: ElevenLabs TTS
- **Video**: FFmpeg
- **Storage**: AWS S3
- **Database**: SQLite

## What Makes It Special
- **Prompt chain architecture**: 7 specialized Nova steps that build on each other
- **Structured AI output**: Scene JSON bridges creative AI with deterministic rendering
- **End-to-end automation**: From text input to downloadable MP4
- **Production-quality output**: Animated scenes, professional narration, burned subtitles

## Future Potential
- Nova Reel for AI-generated intro/outro animations
- Screen recording integration
- Multiple video templates
- Batch generation for product suites
- Direct social media publishing
