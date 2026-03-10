# Demo Creator - Architecture

## System Overview

```
+-------------------+     +-------------------+     +------------------+
|                   |     |                   |     |                  |
|   React Client    |---->|   Express API     |---->|  Amazon Bedrock  |
|   (Vite + TW)     |     |   (Node.js)       |     |  (Nova Pro)      |
|                   |     |                   |     |                  |
+-------------------+     +--------+----------+     +------------------+
                                   |
                          +--------+----------+
                          |                   |
                    +-----v-----+       +-----v-----+
                    |           |       |           |
                    |  AWS S3   |       | ElevenLabs|
                    |           |       |   TTS     |
                    +-----------+       +-----------+
                          |
                    +-----v-----+
                    |           |
                    |  FFmpeg   |
                    |  Pipeline |
                    |           |
                    +-----------+
```

## Data Flow

```
User Input --> Project Created --> Assets Uploaded to S3
                                        |
                                        v
                              Nova Brief Generation
                                        |
                                        v
                              Nova Script Generation
                                        |
                                        v
                              Nova Storyboard Generation
                                        |
                                        v
                              Nova Narration + QA Rewrite
                                        |
                                        v
                              Nova Subtitles + Scene JSON
                                        |
                              +---------+---------+
                              |                   |
                              v                   v
                        ElevenLabs TTS      FFmpeg Render
                              |                   |
                              +-------+-----------+
                                      |
                                      v
                              Final MP4 on S3
                                      |
                                      v
                              User Downloads Video
```

## Component Architecture

### Backend Layers

| Layer | Purpose | Key Files |
|-------|---------|-----------|
| Routes | HTTP endpoint definitions | `routes/*.routes.js` |
| Controllers | Request handling, validation | `controllers/*.controller.js` |
| Services | Business logic orchestration | `services/*.service.js` |
| Providers | External service wrappers | `providers/s3.provider.js`, `providers/bedrock.provider.js` |
| Models | Data access (SQLite) | `models/*.model.js` |
| Jobs | Async task execution | `jobs/queue.js`, `jobs/handlers/*.handler.js` |
| Prompts | AI prompt templates | `prompts/*.prompt.js` |
| FFmpeg | Video composition | `ffmpeg/composer.js`, `ffmpeg/effects.js` |

### Frontend Structure

| Component | Purpose |
|-----------|---------|
| HomePage | Landing page with value proposition |
| CreateProjectPage | Product details form |
| UploadPage | Voice sample and screenshot upload |
| ProgressPage | Real-time generation progress |
| ResultPage | Video preview and download |

## Database Schema

### Projects
Primary entity. Stores all product details and current status.

### Assets
Files uploaded by users (screenshots, voice samples) and generated files (voiceover, final video). Each links to an S3 key.

### Generated Content
AI-generated content for each project. One row per project with JSON fields for brief, script, storyboard, narration, subtitles, and scene JSON.

### Jobs
Async job tracking. Each generation step creates a job record with status, logs, and output.

## Nova Prompt Chain

The prompt chain is the core innovation. Each step receives the output of previous steps:

1. **Brief** (project inputs) --> structured creative brief
2. **Script** (project + brief) --> scene-ready script with timing
3. **Storyboard** (project + script + screenshot count) --> scene breakdown with asset refs
4. **Narration** (project + script + storyboard) --> voiceover text with pacing
5. **QA Rewrite** (brief + script + narration) --> polished narration
6. **Subtitles** (narration + storyboard) --> timed SRT content
7. **Scene JSON** (project + storyboard + narration + screenshot count) --> render instructions

All prompts request structured JSON output to enable downstream machine processing.

## Job Queue Architecture

MVP uses an in-memory async queue with these properties:
- One job per type per project at a time (prevents races)
- Jobs run immediately when enqueued
- Status tracked in SQLite (pending -> running -> completed/failed)
- Designed for replacement with BullMQ or SQS

## Video Pipeline

FFmpeg handles all video composition:
1. **Title Card** - Generated colored background with text overlays
2. **Screenshot Clips** - Each screenshot animated with zoom/pan/fade effects
3. **CTA Card** - Closing card with call to action
4. **Concat** - All clips joined sequentially
5. **Audio Merge** - Voiceover mixed into video
6. **Subtitle Burn** - SRT subtitles rendered onto video

Output: 1920x1080 H.264 MP4 at 30fps.

## Deployment

### Development
```bash
npm run dev  # Runs server:3001 + client:5173 concurrently
```

### Production (AWS)
- Build client: `npm run build`
- Server serves static client build
- Deploy via Docker to App Runner, ECS, or EC2
- S3 for asset storage
- Bedrock for Nova access
- Environment variables for all credentials
