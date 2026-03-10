# Demo Creator - Hackathon Summary

## Team
Sarvar Jafarov

## Challenge
Amazon Nova AI Challenge

## Project Name
Demo Creator

## One-Line Pitch
An AI-powered platform that transforms product details and screenshots into polished demo videos using Amazon Nova for creative direction and content generation.

## Problem
Creating product demo videos is one of the most time-consuming tasks in product marketing. A typical 60-second demo video requires:
- 2-4 hours of scriptwriting
- 1-2 hours of storyboarding
- Recording and editing voiceover
- Screenshot preparation and animation
- Video assembly and subtitle timing

Most startups, indie developers, and small teams skip demo videos entirely because the process is too slow, expensive, or requires specialized skills they don't have.

## Solution
Demo Creator automates the entire demo video creation pipeline. Users provide:
1. Product details (name, description, audience, style preferences)
2. Product screenshots (2+ images)
3. A short voice sample (10 seconds)

The system then uses Amazon Nova to generate a complete creative package:
- Product brief
- Demo script
- Scene-by-scene storyboard
- Voiceover narration text
- Subtitles
- Machine-readable scene plan

ElevenLabs generates the voiceover audio, and FFmpeg assembles everything into a downloadable MP4 with animated screenshots, title cards, subtitles, and professional narration.

## How Amazon Nova Is Used
Amazon Nova is the creative engine of Demo Creator. It powers a 7-step content generation pipeline through Amazon Bedrock:

1. **Product Brief Generator** - Transforms raw product inputs into a structured creative brief with key messages, USPs, and tone guidelines
2. **Demo Script Generator** - Writes a scene-ready script with timing and visual notes
3. **Storyboard Generator** - Breaks the script into scenes with asset references and motion effects
4. **Narration Generator** - Produces voiceover-ready text with pacing awareness
5. **QA Rewriter** - Polishes all content for clarity and marketing quality
6. **Subtitle Generator** - Creates timed subtitle segments aligned to scenes
7. **Scene JSON Generator** - Outputs machine-readable video assembly instructions

Each step feeds into the next, creating a chain of AI-generated content that drives the entire video production pipeline.

## Technical Architecture
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **AI Engine**: Amazon Bedrock (Nova Pro) - 8 modular prompt modules
- **Voice**: ElevenLabs TTS API
- **Video**: FFmpeg (scene animation, composition, subtitles)
- **Storage**: AWS S3
- **Database**: SQLite

## Key Innovation
The prompt chain architecture ensures each AI generation step builds on the previous one, producing coherent, production-ready content. The scene JSON output format bridges AI-generated creative direction with deterministic video rendering.

## What We Built
- Full wizard-style UI for project creation and asset upload
- 8 specialized Nova prompt modules
- Async job pipeline with status tracking
- FFmpeg video compositor with zoom, pan, and fade effects
- End-to-end flow from product details to downloadable MP4
