import { spawn } from 'child_process';
import { writeFileSync, mkdirSync, readFileSync, unlinkSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';
import { getEffectFilter } from './effects.js';
import { buildTransitionChain, pickTransition } from './transitions.js';
import { generateBackgroundMusic } from './audio.js';
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

// ─── Escape text for FFmpeg drawtext ──────────────────────────────────
function escapeText(text) {
  return (text || '').replace(/[\\':]/g, '\\$&');
}

// ─── Title Card ──────────────────────────────────────────────────────
/**
 * Creates a professional title card with animated gradient background,
 * text fade-in animation, and decorative accent line.
 */
async function createTextCard(text, subtitle, options = {}) {
  const {
    width = 1920,
    height = 1080,
    duration = 5,
    isCtaCard = false,
  } = options;

  const outputPath = join(TEMP_DIR, `card-${uuid()}.mp4`);
  const safeText = escapeText(text);
  const safeSubtitle = escapeText(subtitle);

  // Color palette: darker for title, branded blue for CTA
  const r1 = isCtaCard ? 29 : 15;
  const g1 = isCtaCard ? 78 : 23;
  const b1 = isCtaCard ? 216 : 42;
  const r2 = isCtaCard ? 15 : 8;
  const g2 = isCtaCard ? 40 : 12;
  const b2 = isCtaCard ? 110 : 24;

  // Gradient background using geq (static vertical gradient — compatible with all FFmpeg versions)
  const bgFilter = `color=c=black:s=${width}x${height}:d=${duration}:r=30,` +
    `geq=r='${r2}+(${r1}-${r2})*(H-Y)/H':g='${g2}+(${g1}-${g2})*(H-Y)/H':b='${b2}+(${b1}-${b2})*(H-Y)/H'`;

  // Build filter parts
  const filters = [bgFilter];

  // Headline: centered with simple fade-in
  const titleY = Math.round(height / 2 - 50);
  filters.push(
    `drawtext=text='${safeText}':fontsize=68:fontcolor=white:` +
    `x=(w-text_w)/2:y=${titleY}:` +
    `alpha='min(1\\,t/0.6)'`
  );

  // Subtitle: below headline with delayed fade-in
  if (safeSubtitle) {
    const subY = Math.round(height / 2 + 30);
    filters.push(
      `drawtext=text='${safeSubtitle}':fontsize=28:fontcolor=white@0.75:` +
      `x=(w-text_w)/2:y=${subY}:` +
      `alpha='if(gt(t\\,0.3)\\,min(1\\,(t-0.3)/0.5)\\,0)'`
    );
  }

  // Static accent line centered below text
  const lineY = Math.round(height / 2 + (safeSubtitle ? 80 : 40));
  const lineX = Math.round(width / 2 - 150);
  const lineColor = isCtaCard ? 'white' : '#4f7df5';
  filters.push(
    `drawbox=x=${lineX}:y=${lineY}:w=300:h=3:color=${lineColor}@0.7:t=fill`
  );

  // Fade out at end
  filters.push(`fade=t=out:st=${Math.max(0, duration - 0.5)}:d=0.5`);

  await runFFmpeg([
    '-y',
    '-f', 'lavfi',
    '-i', filters[0], // background source
    '-vf', filters.slice(1).join(','),
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-t', String(duration),
    '-pix_fmt', 'yuv420p',
    '-r', '30',
    outputPath,
  ]);

  return outputPath;
}

// ─── Screenshot Clip ─────────────────────────────────────────────────
/**
 * Creates a screenshot clip in a SINGLE FFmpeg call:
 * - Dark solid background (screenshot floats on it)
 * - Motion effect (zoom, pan, ken burns, etc.)
 * - Optional text overlay (lower-third style)
 */
async function createScreenshotClip(screenshotBuffer, effect, duration, options = {}) {
  const { width = 1920, height = 1080, headline } = options;

  const imgPath = join(TEMP_DIR, `img-${uuid()}.png`);
  const outputPath = join(TEMP_DIR, `clip-${uuid()}.mp4`);

  writeFileSync(imgPath, screenshotBuffer);

  const ssWidth = Math.round(width * 0.88);
  const ssHeight = Math.round(height * 0.85);
  const effectType = effect?.type || 'zoom_in';
  const motionFilter = getEffectFilter(effectType, duration, ssWidth, ssHeight);
  const ox = Math.round((width - ssWidth) / 2);
  const oy = Math.round((height - ssHeight) / 2);

  // Single filter_complex: dark background + motion screenshot overlay + optional text
  let filterParts = [
    `color=c=#0a0e1a:s=${width}x${height}:d=${duration}:r=30[bg]`,
    `[0:v]${motionFilter}[ss]`,
    `[bg][ss]overlay=${ox}:${oy}[composed]`,
  ];

  let lastLabel = 'composed';

  if (headline) {
    const safeHeadline = escapeText(headline);
    const barY = height - 90;
    filterParts.push(
      `[${lastLabel}]` +
      `drawbox=x=0:y=${barY}:w=${width}:h=90:color=black@0.5:t=fill,` +
      `drawtext=text='${safeHeadline}':fontsize=30:fontcolor=white:` +
      `x=60:y=${barY + 28}` +
      `[textout]`
    );
    lastLabel = 'textout';
  }

  await runFFmpeg([
    '-y',
    '-loop', '1',
    '-i', imgPath,
    '-filter_complex', filterParts.join(';'),
    '-map', `[${lastLabel}]`,
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-pix_fmt', 'yuv420p',
    '-r', '30',
    '-t', String(duration),
    outputPath,
  ]);

  try { unlinkSync(imgPath); } catch {}
  return outputPath;
}

// ─── Compose Final Video ─────────────────────────────────────────────
/**
 * Compose the final video from scene clips, voiceover, and subtitles.
 * Uses xfade transitions between scenes for professional look.
 */
async function composeVideo({ project, sceneJson, subtitles, screenshots, voiceover }) {
  const scenes = sceneJson.scenes || [];
  const settings = sceneJson.videoSettings || { width: 1920, height: 1080 };
  const clipPaths = [];
  const clipDurations = [];
  const tempFiles = [];

  logger.info(`Composer: building ${scenes.length} scenes`);

  // Build each scene clip
  for (const scene of scenes) {
    let clipPath;
    const dur = scene.durationSeconds || 5;

    if (scene.sceneType === 'title_card') {
      clipPath = await createTextCard(
        scene.headline || project.productName,
        scene.bodyText || project.shortDescription,
        { duration: dur, width: settings.width, height: settings.height, isCtaCard: false }
      );
    } else if (scene.sceneType === 'cta_card') {
      clipPath = await createTextCard(
        scene.headline || project.callToAction || 'Try it today',
        scene.bodyText || project.productUrl || '',
        { duration: dur, width: settings.width, height: settings.height, isCtaCard: true }
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
          dur,
          { width: settings.width, height: settings.height, headline: scene.headline }
        );
      } else {
        clipPath = await createTextCard(
          scene.headline || 'Product Feature',
          scene.voiceoverText || '',
          { duration: dur }
        );
      }
    } else {
      clipPath = await createTextCard(
        scene.headline || '',
        scene.bodyText || '',
        { duration: dur }
      );
    }

    clipPaths.push(clipPath);
    clipDurations.push(dur);
  }

  // ─── Merge clips with xfade transitions ───────────────────────────
  const transitions = [];
  for (let i = 0; i < scenes.length - 1; i++) {
    transitions.push(pickTransition(scenes[i], scenes[i + 1]));
  }

  const mergedPath = join(TEMP_DIR, `merged-${uuid()}.mp4`);

  if (clipPaths.length === 1) {
    // Single clip, just copy
    await runFFmpeg(['-y', '-i', clipPaths[0], '-c', 'copy', mergedPath]);
  } else {
    const { filterComplex, outputLabel } = buildTransitionChain(
      clipPaths.length, clipDurations, transitions, 0.5
    );

    const inputArgs = clipPaths.flatMap((p) => ['-i', p]);
    await runFFmpeg([
      '-y',
      ...inputArgs,
      '-filter_complex', filterComplex,
      '-map', outputLabel,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-pix_fmt', 'yuv420p',
      '-r', '30',
      mergedPath,
    ]);
  }

  tempFiles.push(mergedPath);

  // ─── Audio ─────────────────────────────────────────────────────────
  const totalDuration = clipDurations.reduce((sum, d) => sum + d, 0);
  const hasVoiceover = voiceover && voiceover.length > 100;

  let finalPath = mergedPath;

  if (hasVoiceover) {
    const voiceoverPath = join(TEMP_DIR, `vo-${uuid()}.mp3`);
    writeFileSync(voiceoverPath, voiceover);
    tempFiles.push(voiceoverPath);

    const bgmPath = await generateBackgroundMusic(TEMP_DIR, totalDuration);
    tempFiles.push(bgmPath);

    const withAudioPath = join(TEMP_DIR, `final-${uuid()}.mp4`);
    await runFFmpeg([
      '-y',
      '-i', mergedPath,
      '-i', voiceoverPath,
      '-i', bgmPath,
      '-filter_complex',
      `[1:a]volume=1.0[voice];[2:a]volume=0.25[bgm];[voice][bgm]amix=inputs=2:duration=longest[aout]`,
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
    logger.info('Composer: no voiceover available, adding background music only');
    const bgmPath = await generateBackgroundMusic(TEMP_DIR, totalDuration);
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

  // ─── Subtitles ─────────────────────────────────────────────────────
  if (subtitles?.srtContent) {
    const srtPath = join(TEMP_DIR, `subs-${uuid()}.srt`);
    writeFileSync(srtPath, subtitles.srtContent);
    tempFiles.push(srtPath);

    const withSubsPath = join(TEMP_DIR, `final-subs-${uuid()}.mp4`);
    await runFFmpeg([
      '-y',
      '-i', finalPath,
      '-vf', `subtitles=${srtPath}:force_style='FontSize=28,PrimaryColour=&H00FFFFFF,OutlineColour=&H80000000,BackColour=&H40000000,Outline=2,Shadow=0,BorderStyle=4,MarginV=50,Alignment=2'`,
      '-c:v', 'libx264',
      '-preset', 'fast',
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
