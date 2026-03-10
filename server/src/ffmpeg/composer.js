import { spawn } from 'child_process';
import { writeFileSync, mkdirSync, readFileSync, unlinkSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';
import { getEffectFilter } from './effects.js';
import logger from '../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMP_DIR = resolve(__dirname, '../../temp');

/** Ensure temp directory exists */
mkdirSync(TEMP_DIR, { recursive: true });

/**
 * Run an FFmpeg command and return a promise.
 */
function runFFmpeg(args) {
  return new Promise((resolve, reject) => {
    logger.debug(`FFmpeg: ${args.join(' ')}`);
    const proc = spawn('ffmpeg', args, { stdio: ['pipe', 'pipe', 'pipe'] });

    let stderr = '';
    proc.stderr.on('data', (d) => { stderr += d.toString(); });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}: ${stderr.slice(-500)}`));
    });
    proc.on('error', reject);
  });
}

/**
 * Create a title card or CTA card video using FFmpeg.
 * Generates a gradient background with centered text and fade in/out.
 */
async function createTextCard(text, subtitle, options = {}) {
  const {
    width = 1920,
    height = 1080,
    bgColor = '0x1e3a8a',
    textColor = 'white',
    duration = 5,
  } = options;

  const outputPath = join(TEMP_DIR, `card-${uuid()}.mp4`);

  // Escape special chars for FFmpeg drawtext
  const safeText = (text || '').replace(/[':]/g, '\\$&');
  const safeSubtitle = subtitle ? subtitle.replace(/[':]/g, '\\$&') : '';

  // Build filter: two-tone gradient bg + text + fade
  // Use a lighter shade overlaid with a gradient for depth
  const filterParts = [
    `drawtext=text='${safeText}':fontcolor=${textColor}:fontsize=60:x=(w-text_w)/2:y=(h-text_h)/2-30`,
  ];

  if (safeSubtitle) {
    // Word-wrap long subtitles by limiting width
    filterParts.push(
      `drawtext=text='${safeSubtitle}':fontcolor=${textColor}@0.7:fontsize=26:x=(w-text_w)/2:y=(h-text_h)/2+50`
    );
  }

  // Fade in/out for smooth transitions
  filterParts.push(`fade=t=in:st=0:d=0.6,fade=t=out:st=${Math.max(0, duration - 0.6)}:d=0.6`);

  // Create gradient background by blending two colors
  const gradTop = bgColor;
  const gradBottom = bgColor === '0x1d4ed8' ? '0x0f2a6e' : '0x0f1b3d';

  await runFFmpeg([
    '-y',
    '-f', 'lavfi',
    '-i', `color=c=${gradTop}:s=${width}x${height / 2}:d=${duration}:r=30`,
    '-f', 'lavfi',
    '-i', `color=c=${gradBottom}:s=${width}x${height / 2}:d=${duration}:r=30`,
    '-filter_complex',
    `[0][1]vstack,${filterParts.join(',')}`,
    '-c:v', 'libx264',
    '-t', String(duration),
    '-pix_fmt', 'yuv420p',
    outputPath,
  ]);

  return outputPath;
}

/**
 * Create a video clip from a screenshot with an effect and fade transitions.
 */
async function createScreenshotClip(screenshotBuffer, effect, duration, options = {}) {
  const { width = 1920, height = 1080 } = options;

  const imgPath = join(TEMP_DIR, `img-${uuid()}.png`);
  const outputPath = join(TEMP_DIR, `clip-${uuid()}.mp4`);

  writeFileSync(imgPath, screenshotBuffer);

  const effectType = effect?.type || 'fade';
  let filter = getEffectFilter(effectType, duration, width, height);

  // Add fade in/out for smooth scene transitions
  filter += `,fade=t=in:st=0:d=0.5,fade=t=out:st=${Math.max(0, duration - 0.5)}:d=0.5`;

  await runFFmpeg([
    '-y',
    '-loop', '1',
    '-i', imgPath,
    '-vf', filter,
    '-c:v', 'libx264',
    '-t', String(duration),
    '-pix_fmt', 'yuv420p',
    '-r', '30',
    outputPath,
  ]);

  try { unlinkSync(imgPath); } catch {}

  return outputPath;
}

/**
 * Generate ambient background music using layered sine waves (Am chord).
 * Creates a warm, professional-sounding pad with fade in/out.
 */
async function generateBackgroundMusic(duration) {
  const outputPath = join(TEMP_DIR, `bgm-${uuid()}.mp3`);
  const fadeOut = Math.max(0, duration - 3);

  // Layer 4 frequencies forming an Am chord for a warm ambient pad
  // Each at different volumes for a rich, non-annoying sound
  await runFFmpeg([
    '-y',
    '-f', 'lavfi', '-i', `sine=frequency=174:duration=${duration}`,
    '-f', 'lavfi', '-i', `sine=frequency=220:duration=${duration}`,
    '-f', 'lavfi', '-i', `sine=frequency=261:duration=${duration}`,
    '-f', 'lavfi', '-i', `sine=frequency=329:duration=${duration}`,
    '-filter_complex',
    `[0:a]volume=0.12[a];[1:a]volume=0.10[b];[2:a]volume=0.08[c];[3:a]volume=0.06[d];` +
    `[a][b][c][d]amix=inputs=4:duration=longest,afade=t=in:st=0:d=2,afade=t=out:st=${fadeOut}:d=3[out]`,
    '-map', '[out]',
    '-c:a', 'libmp3lame',
    '-b:a', '128k',
    outputPath,
  ]).catch(async () => {
    // Fallback: single tone if complex filter fails
    await runFFmpeg([
      '-y',
      '-f', 'lavfi',
      '-i', `sine=frequency=220:duration=${duration}`,
      '-af', `volume=0.15,afade=t=in:st=0:d=2,afade=t=out:st=${fadeOut}:d=3`,
      '-c:a', 'libmp3lame',
      '-b:a', '128k',
      outputPath,
    ]);
  });

  logger.info(`Composer: generated background music (${duration}s)`);
  return outputPath;
}

/**
 * Compose the final video from scene clips, voiceover, and subtitles.
 */
async function composeVideo({ project, sceneJson, subtitles, screenshots, voiceover }) {
  const scenes = sceneJson.scenes || [];
  const settings = sceneJson.videoSettings || { width: 1920, height: 1080 };
  const clipPaths = [];
  const tempFiles = [];

  logger.info(`Composer: building ${scenes.length} scenes`);

  // Build each scene clip
  for (const scene of scenes) {
    let clipPath;

    if (scene.sceneType === 'title_card') {
      clipPath = await createTextCard(
        scene.headline || project.productName,
        scene.bodyText || project.shortDescription,
        { duration: scene.durationSeconds, width: settings.width, height: settings.height }
      );
    } else if (scene.sceneType === 'cta_card') {
      clipPath = await createTextCard(
        scene.headline || project.callToAction || 'Try it today',
        scene.bodyText || project.productUrl || '',
        { duration: scene.durationSeconds, width: settings.width, height: settings.height, bgColor: '0x1d4ed8' }
      );
    } else if (scene.sceneType === 'screenshot') {
      const ref = scene.assetReference || '';
      const match = ref.match(/screenshot_(\d+)/);
      const idx = match ? parseInt(match[1], 10) - 1 : 0;
      const screenshot = screenshots[Math.min(idx, screenshots.length - 1)];

      if (screenshot?.buffer) {
        clipPath = await createScreenshotClip(
          screenshot.buffer,
          scene.effect,
          scene.durationSeconds,
          { width: settings.width, height: settings.height }
        );
      } else {
        clipPath = await createTextCard(
          scene.headline || 'Product Feature',
          scene.voiceoverText || '',
          { duration: scene.durationSeconds }
        );
      }
    } else {
      clipPath = await createTextCard(
        scene.headline || '',
        scene.bodyText || '',
        { duration: scene.durationSeconds }
      );
    }

    clipPaths.push(clipPath);
  }

  // Create concat file for FFmpeg
  const concatPath = join(TEMP_DIR, `concat-${uuid()}.txt`);
  const concatContent = clipPaths.map((p) => `file '${p}'`).join('\n');
  writeFileSync(concatPath, concatContent);
  tempFiles.push(concatPath);

  // Merge all clips
  const mergedPath = join(TEMP_DIR, `merged-${uuid()}.mp4`);
  await runFFmpeg([
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', concatPath,
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    mergedPath,
  ]);
  tempFiles.push(mergedPath);

  // Calculate total video duration for background music
  const totalDuration = scenes.reduce((sum, s) => sum + (s.durationSeconds || 5), 0);

  // Determine if we have real voiceover audio (not a 0-byte placeholder)
  const hasVoiceover = voiceover && voiceover.length > 100;

  let finalPath = mergedPath;

  if (hasVoiceover) {
    // Add voiceover audio
    const voiceoverPath = join(TEMP_DIR, `vo-${uuid()}.mp3`);
    writeFileSync(voiceoverPath, voiceover);
    tempFiles.push(voiceoverPath);

    // Generate background music to mix with voiceover
    const bgmPath = await generateBackgroundMusic(totalDuration);
    tempFiles.push(bgmPath);

    // Mix voiceover + background music, then merge with video
    const withAudioPath = join(TEMP_DIR, `final-${uuid()}.mp4`);
    await runFFmpeg([
      '-y',
      '-i', mergedPath,
      '-i', voiceoverPath,
      '-i', bgmPath,
      '-filter_complex',
      `[1:a]volume=1.0[voice];[2:a]volume=0.3[bgm];[voice][bgm]amix=inputs=2:duration=longest[aout]`,
      '-map', '0:v',
      '-map', '[aout]',
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-shortest',
      withAudioPath,
    ]);

    finalPath = withAudioPath;
    tempFiles.push(withAudioPath);
  } else {
    // No voiceover — add just background music so video isn't silent
    logger.info('Composer: no voiceover available, adding background music only');
    const bgmPath = await generateBackgroundMusic(totalDuration);
    tempFiles.push(bgmPath);

    const withBgmPath = join(TEMP_DIR, `final-bgm-${uuid()}.mp4`);
    await runFFmpeg([
      '-y',
      '-i', mergedPath,
      '-i', bgmPath,
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-shortest',
      withBgmPath,
    ]);

    finalPath = withBgmPath;
    tempFiles.push(withBgmPath);
  }

  // Add subtitles if available
  if (subtitles?.srtContent) {
    const srtPath = join(TEMP_DIR, `subs-${uuid()}.srt`);
    writeFileSync(srtPath, subtitles.srtContent);
    tempFiles.push(srtPath);

    const withSubsPath = join(TEMP_DIR, `final-subs-${uuid()}.mp4`);
    await runFFmpeg([
      '-y',
      '-i', finalPath,
      '-vf', `subtitles=${srtPath}:force_style='FontSize=24,PrimaryColour=&HFFFFFF,OutlineColour=&H000000,Outline=2,Shadow=1'`,
      '-c:v', 'libx264',
      '-c:a', 'copy',
      '-pix_fmt', 'yuv420p',
      withSubsPath,
    ]);

    finalPath = withSubsPath;
    tempFiles.push(withSubsPath);
  }

  // Read final video into buffer
  const videoBuffer = readFileSync(finalPath);

  // Cleanup temp files
  for (const p of [...clipPaths, ...tempFiles]) {
    try { if (existsSync(p)) unlinkSync(p); } catch {}
  }

  logger.info(`Composer: final video size ${(videoBuffer.length / 1024 / 1024).toFixed(1)}MB`);
  return videoBuffer;
}

export default { composeVideo, createTextCard, createScreenshotClip };
