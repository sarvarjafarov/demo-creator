# Demo Creator - Live Demo Script

## Setup Before Demo
1. Server running (`npm run dev`)
2. AWS credentials configured (Bedrock + S3)
3. ElevenLabs API key configured
4. 2-3 product screenshots ready
5. 10-second voice recording ready
6. Browser open to http://localhost:5173

## Demo Flow (5-7 minutes)

### Opening (30 seconds)
"Creating product demo videos is one of the most painful parts of product marketing. You need a script, voiceover, animated visuals, subtitles - it takes hours. Demo Creator automates this entire process using Amazon Nova."

### Step 1: Create Project (60 seconds)
- Click "Create Demo Video" on the landing page
- Fill in product details:
  - Product Name: [your product]
  - Description: [one sentence]
  - Target Audience: [who it's for]
  - Demo Style: "clean SaaS demo"
  - Video Length: "60 sec"
  - Call to Action: "Start your free trial"
- Click "Continue to Upload Assets"

**Talk about**: "We capture key product info that Amazon Nova will use to generate targeted content."

### Step 2: Upload Assets (45 seconds)
- Upload a 10-second voice sample
- Upload 2-3 product screenshots
- Click "Upload & Start Generation"

**Talk about**: "The voice sample will be used by ElevenLabs to generate narration. Screenshots become the visual backbone of the demo."

### Step 3: Watch Generation (90 seconds)
- Show the progress page updating in real time
- Point out each step as it completes:
  1. Product brief generation
  2. Demo script generation
  3. Storyboard & narration generation
  4. Voiceover & video rendering

**Talk about**: "Amazon Nova is doing the heavy lifting here. It generates a creative brief, writes a persuasive script, creates a scene-by-scene storyboard, writes voiceover narration, and produces a machine-readable scene plan - all through a chained prompt architecture where each step builds on the last."

### Step 4: View Result (60 seconds)
- Play the generated video
- Point out:
  - Title card with product name
  - Animated screenshot scenes (zoom, pan effects)
  - AI-generated narration
  - Subtitles
  - CTA closing card
- Show the generated content (brief, script, narration text)
- Click download button

**Talk about**: "In under 2 minutes, we went from basic product info to a polished demo video. No scripting, no video editing, no voiceover recording."

### Architecture Highlight (60 seconds)
- Show the prompt files briefly
- Explain the 7-step Nova pipeline
- Mention the scene JSON format that bridges AI output to deterministic FFmpeg rendering

**Talk about**: "Nova isn't just used for one task - it orchestrates the entire creative process through 7 specialized prompt modules. The output is structured JSON that our FFmpeg pipeline can deterministically render."

### Closing (30 seconds)
"Demo Creator shows how Amazon Nova can power end-to-end creative workflows, not just answer questions. It transforms unstructured product information into polished video content through a chain of specialized AI tasks."

## Backup Plan
If live generation fails during demo:
1. Have a pre-generated video ready in the result page
2. Show the prompt modules and explain the architecture
3. Show the scene JSON format and FFmpeg pipeline
4. Demo the project creation and upload flow even without generation

## Key Talking Points
- Amazon Nova powers 7 distinct stages of the pipeline
- Prompt chain architecture: each step builds on previous output
- Scene JSON bridges AI creativity with deterministic rendering
- Full MVP built in JavaScript with AWS-native services
- Extensible: Nova Reel can be added for generated intro/outro scenes
