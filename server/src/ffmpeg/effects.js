/**
 * FFmpeg filter expressions for scene effects.
 * Each function returns a filter string for use in FFmpeg filter_complex.
 */

/**
 * Generate a zoom-in effect filter.
 * Slowly zooms from 100% to 110% over the duration.
 */
export function zoomIn(duration, width = 1920, height = 1080) {
  return `scale=${width * 1.1}:${height * 1.1},` +
    `zoompan=z='min(zoom+0.001,1.1)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${duration * 30}:s=${width}x${height}:fps=30`;
}

/**
 * Generate a zoom-out effect filter.
 * Starts zoomed in at 110% and zooms out to 100%.
 */
export function zoomOut(duration, width = 1920, height = 1080) {
  return `scale=${width * 1.1}:${height * 1.1},` +
    `zoompan=z='if(eq(on,1),1.1,max(zoom-0.001,1.0))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${duration * 30}:s=${width}x${height}:fps=30`;
}

/**
 * Generate a left-to-right pan effect.
 */
export function panLeft(duration, width = 1920, height = 1080) {
  const scaledWidth = Math.round(width * 1.2);
  return `scale=${scaledWidth}:${height},` +
    `zoompan=z='1':x='(iw-ow)*on/${duration * 30}':y='0':d=${duration * 30}:s=${width}x${height}:fps=30`;
}

/**
 * Generate a right-to-left pan effect.
 */
export function panRight(duration, width = 1920, height = 1080) {
  const scaledWidth = Math.round(width * 1.2);
  return `scale=${scaledWidth}:${height},` +
    `zoompan=z='1':x='(iw-ow)*(1-on/${duration * 30})':y='0':d=${duration * 30}:s=${width}x${height}:fps=30`;
}

/**
 * Static display with fade in and fade out.
 */
export function fadeInOut(duration, width = 1920, height = 1080) {
  const fadeFrames = 15; // 0.5 sec at 30fps
  return `scale=${width}:${height}:force_original_aspect_ratio=decrease,` +
    `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black,` +
    `fade=t=in:st=0:d=0.5,fade=t=out:st=${duration - 0.5}:d=0.5`;
}

/**
 * Static display - scale and pad to fit.
 */
export function staticDisplay(duration, width = 1920, height = 1080) {
  return `scale=${width}:${height}:force_original_aspect_ratio=decrease,` +
    `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black`;
}

/** Map effect name to function */
export const effectMap = {
  zoom_in: zoomIn,
  zoom_out: zoomOut,
  pan_left: panLeft,
  pan_right: panRight,
  fade: fadeInOut,
  fade_in: fadeInOut,
  static: staticDisplay,
};

/**
 * Get the filter string for a given effect type.
 */
export function getEffectFilter(effectType, duration, width, height) {
  const fn = effectMap[effectType] || staticDisplay;
  return fn(duration, width, height);
}
