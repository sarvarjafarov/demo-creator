/**
 * FFmpeg filter expressions for scene effects.
 * Each function returns a filter string for use in FFmpeg -vf.
 *
 * IMPORTANT: Effects assume the input is already correctly sized by the
 * pre-scale step in composer.js. They use hard scale (no force_original_aspect_ratio)
 * to guarantee exact output dimensions and avoid pad rounding errors.
 */

/**
 * Zoom-in effect: slowly zooms from 100% to ~108% over the duration.
 */
export function zoomIn(duration, width = 1920, height = 1080) {
  const frames = duration * 30;
  const sw = Math.round(width * 1.15);
  const sh = Math.round(height * 1.15);
  return `scale=${sw}:${sh},` +
    `zoompan=z='min(zoom+0.0008,1.08)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${width}x${height}:fps=30`;
}

/**
 * Zoom-out effect: starts at ~108% zoom and slowly zooms out to 100%.
 */
export function zoomOut(duration, width = 1920, height = 1080) {
  const frames = duration * 30;
  const sw = Math.round(width * 1.15);
  const sh = Math.round(height * 1.15);
  return `scale=${sw}:${sh},` +
    `zoompan=z='if(eq(on,1),1.08,max(zoom-0.0008,1.0))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${width}x${height}:fps=30`;
}

/**
 * Left-to-right pan: gently pans across the image horizontally.
 */
export function panLeft(duration, width = 1920, height = 1080) {
  const frames = duration * 30;
  const sw = Math.round(width * 1.15);
  const sh = Math.round(height * 1.15);
  return `scale=${sw}:${sh},` +
    `zoompan=z='1':x='(iw-ow)*on/${frames}':y='(ih-oh)/2':d=${frames}:s=${width}x${height}:fps=30`;
}

/**
 * Right-to-left pan: gently pans across the image in reverse.
 */
export function panRight(duration, width = 1920, height = 1080) {
  const frames = duration * 30;
  const sw = Math.round(width * 1.15);
  const sh = Math.round(height * 1.15);
  return `scale=${sw}:${sh},` +
    `zoompan=z='1':x='(iw-ow)*(1-on/${frames})':y='(ih-oh)/2':d=${frames}:s=${width}x${height}:fps=30`;
}

/**
 * Fade in and out with static display.
 */
export function fadeInOut(duration, width = 1920, height = 1080) {
  return `scale=${width}:${height},` +
    `fade=t=in:st=0:d=0.5,fade=t=out:st=${Math.max(0, duration - 0.5)}:d=0.5`;
}

/**
 * Static display - scale to fit, no motion.
 */
export function staticDisplay(duration, width = 1920, height = 1080) {
  return `scale=${width}:${height}`;
}

/**
 * Ken Burns effect: combined slow zoom + diagonal pan.
 */
export function kenBurns(duration, width = 1920, height = 1080) {
  const frames = duration * 30;
  const sw = Math.round(width * 1.2);
  const sh = Math.round(height * 1.2);
  return `scale=${sw}:${sh},` +
    `zoompan=z='min(zoom+0.0006,1.08)':x='(iw-iw/zoom)/2+on*0.15':y='(ih-ih/zoom)/2+on*0.1':d=${frames}:s=${width}x${height}:fps=30`;
}

/**
 * Gentle floating motion: subtle up-and-down bob that feels alive.
 */
export function float(duration, width = 1920, height = 1080) {
  const frames = duration * 30;
  const sw = Math.round(width * 1.08);
  const sh = Math.round(height * 1.08);
  return `scale=${sw}:${sh},` +
    `zoompan=z='1.03':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2+6*sin(on/${frames}*6.28)':d=${frames}:s=${width}x${height}:fps=30`;
}

/** Map effect name to function */
export const effectMap = {
  zoom_in: zoomIn,
  zoom_out: zoomOut,
  pan_left: panLeft,
  pan_right: panRight,
  ken_burns: kenBurns,
  float: float,
  fade: fadeInOut,
  fade_in: fadeInOut,
  static: staticDisplay,
};

/**
 * Get the filter string for a given effect type.
 */
export function getEffectFilter(effectType, duration, width, height) {
  const fn = effectMap[effectType] || fadeInOut;
  return fn(duration, width, height);
}
