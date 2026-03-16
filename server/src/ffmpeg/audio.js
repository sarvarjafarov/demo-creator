import { spawn } from 'child_process';
import { join } from 'path';
import { v4 as uuid } from 'uuid';
import logger from '../utils/logger.js';

/**
 * Generate professional-sounding ambient background music using FFmpeg.
 * Uses layered sine waves with amplitude modulation, harmonics,
 * low-pass filtering, and reverb for a warm, organic pad sound.
 *
 * @param {string} tempDir - Temporary directory for output
 * @param {number} duration - Duration in seconds
 * @returns {string} Path to the generated MP3 file
 */
export async function generateBackgroundMusic(tempDir, duration) {
  const outputPath = join(tempDir, `bgm-${uuid()}.mp3`);
  const fadeOut = Math.max(0, duration - 4);

  // Rich ambient pad using aevalsrc with amplitude modulation for organic feel
  // Each voice has a slow tremolo (sin modulation) for breathing effect
  const expr = [
    '0.07*sin(2*PI*130.81*t)*(1+0.3*sin(0.4*t))',   // C3 - root
    '0.06*sin(2*PI*164.81*t)*(1+0.2*sin(0.6*t))',   // E3 - major third
    '0.05*sin(2*PI*196.00*t)*(1+0.25*sin(0.3*t))',  // G3 - fifth
    '0.04*sin(2*PI*261.63*t)*(1+0.15*sin(0.5*t))',  // C4 - octave
    '0.025*sin(2*PI*329.63*t)*(1+0.2*sin(0.7*t))',  // E4 - high third
  ].join('+');

  const args = [
    '-y',
    '-f', 'lavfi',
    '-i', `aevalsrc='${expr}':s=44100:d=${duration}`,
    '-af', [
      'lowpass=f=1800',
      'equalizer=f=180:t=q:w=1:g=4',
      'aecho=0.8:0.88:80:0.25',
      'volume=0.18',
      `afade=t=in:st=0:d=3`,
      `afade=t=out:st=${fadeOut}:d=4`,
    ].join(','),
    '-c:a', 'libmp3lame',
    '-b:a', '192k',
    outputPath,
  ];

  await runFFmpeg(args);
  logger.info(`Audio: generated ambient pad (${duration}s)`);
  return outputPath;
}

function runFFmpeg(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let stderr = '';
    proc.stderr.on('data', (d) => { stderr += d.toString(); });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg audio exited with code ${code}: ${stderr.slice(-500)}`));
    });
    proc.on('error', reject);
  });
}
