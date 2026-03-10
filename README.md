# Demo Creator

AI-powered product demo video generator built for the **Amazon Nova AI Challenge**.

## Problem

Creating product demo videos is slow, manual, and expensive. Teams spend hours writing scripts, recording voiceovers, editing screenshots, and assembling final cuts. Most SaaS teams skip demo videos entirely because the effort-to-value ratio feels too high.

## Solution

Demo Creator turns basic product inputs and a short voice sample into a polished product demo video. Users provide product details and screenshots, and the system uses **Amazon Nova** for creative planning and **ElevenLabs** for voice generation to produce a ready-to-share MP4.

## How Amazon Nova Is Used

Amazon Nova is the creative brain of Demo Creator. It powers **7 stages** of the content pipeline:

1. **Product Brief Generator** - Transforms raw user inputs into a structured creative brief
2. **Demo Script Generator** - Writes a concise, persuasive demo script
3. **Storyboard Generator** - Breaks the script into scenes with purpose and visual direction
4. **Narration Generator** - Produces voiceover-ready narration text with pacing
5. **Subtitle Generator** - Creates subtitle chunks aligned to scenes
6. **Scene JSON Generator** - Outputs machine-readable scene plan for video assembly
7. **QA Rewriter** - Polishes all content for clarity and marketing quality

## Architecture

```
User Input -> Amazon Nova (Bedrock) -> Content Pipeline
                                         |
                                    ElevenLabs TTS
                                         |
                                    FFmpeg Video Assembly
                                         |
                                    Final MP4 on S3
```

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **AI**: Amazon Bedrock (Nova Pro)
- **Voice**: ElevenLabs API
- **Video**: FFmpeg
- **Storage**: AWS S3
- **Database**: SQLite (MVP) / PostgreSQL (production)

## Setup

### Prerequisites

- Node.js 18+
- FFmpeg installed (`brew install ffmpeg` on macOS)
- AWS account with Bedrock access (Nova Pro model enabled)
- ElevenLabs API key

### Install

```bash
# Install all dependencies
npm run install:all
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3001) |
| `AWS_REGION` | Yes | AWS region for Bedrock/S3 |
| `AWS_ACCESS_KEY_ID` | Yes | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | Yes | AWS secret key |
| `AWS_S3_BUCKET` | Yes | S3 bucket for assets |
| `AWS_BEDROCK_MODEL_ID` | No | Nova model ID (default: amazon.nova-pro-v1:0) |
| `ELEVENLABS_API_KEY` | Yes | ElevenLabs API key |
| `ELEVENLABS_VOICE_ID` | No | Default voice ID |

### Run Locally

```bash
# Start both server and client in dev mode
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:3001
- Health check: http://localhost:3001/api/health

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
demo-creator/
  server/                  # Express API server
    src/
      config/              # Environment config
      routes/              # API route definitions
      controllers/         # Request handlers
      services/            # Business logic
      providers/           # AWS S3, Bedrock wrappers
      jobs/                # Async job queue and handlers
      prompts/             # Nova prompt modules
      ffmpeg/              # Video composition logic
      models/              # SQLite models
      middleware/           # Error handling, upload
      utils/               # Logger, helpers
  client/                  # React frontend
    src/
      pages/               # Page components
      components/          # Shared UI components
      hooks/               # Custom React hooks
      api/                 # API client
      styles/              # Tailwind CSS
  docs/                    # Documentation
```

## Demo Flow

1. User enters product name, description, target audience, and demo preferences
2. User uploads 2+ product screenshots and a 10-second voice sample
3. System generates creative brief, script, storyboard, and narration via Amazon Nova
4. System generates voiceover via ElevenLabs using narration text
5. System assembles screenshots into animated scenes with FFmpeg
6. System merges scenes, voiceover, subtitles, and title cards into final MP4
7. User downloads the finished demo video

## License

MIT
