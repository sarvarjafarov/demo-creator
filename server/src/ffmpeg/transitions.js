/**
 * Inter-scene transitions using FFmpeg xfade filter.
 * Replaces simple concat with smooth professional transitions.
 */

const TRANSITION_MAP = {
  fade: 'fade',
  slideleft: 'slideleft',
  slideright: 'slideright',
  wipeleft: 'wipeleft',
  wiperight: 'wiperight',
  circleopen: 'circleopen',
  dissolve: 'dissolve',
};

/**
 * Build an FFmpeg filter_complex string that chains xfade transitions
 * between all input clips.
 *
 * @param {number} count - Number of input clips
 * @param {number[]} durations - Duration of each clip in seconds
 * @param {string[]} transitions - Transition type for each junction (length = count - 1)
 * @param {number} transitionDur - Duration of each transition in seconds
 * @returns {{ filterComplex: string, outputLabel: string }}
 */
export function buildTransitionChain(count, durations, transitions = [], transitionDur = 0.5) {
  if (count <= 1) {
    return { filterComplex: '', outputLabel: '[0:v]' };
  }

  const parts = [];
  let offset = durations[0] - transitionDur;
  let prevLabel = '[0:v]';

  for (let i = 1; i < count; i++) {
    const transType = TRANSITION_MAP[transitions[i - 1]] || 'fade';
    const outLabel = i < count - 1 ? `[v${i}]` : '[vout]';

    parts.push(
      `${prevLabel}[${i}:v]xfade=transition=${transType}:duration=${transitionDur}:offset=${Math.max(0, offset).toFixed(3)}${outLabel}`
    );

    prevLabel = outLabel;
    if (i < count - 1) {
      offset += durations[i] - transitionDur;
    }
  }

  return {
    filterComplex: parts.join(';'),
    outputLabel: '[vout]',
  };
}

/**
 * Pick a transition type based on scene types.
 */
export function pickTransition(fromScene, toScene) {
  if (fromScene.sceneType === 'title_card') return 'fade';
  if (toScene.sceneType === 'cta_card') return 'fade';
  if (fromScene.sceneType === 'screenshot' && toScene.sceneType === 'screenshot') {
    // Alternate between slide and dissolve for variety
    const options = ['slideleft', 'dissolve', 'wipeleft', 'fade'];
    return options[fromScene.sceneNumber % options.length];
  }
  return 'fade';
}
