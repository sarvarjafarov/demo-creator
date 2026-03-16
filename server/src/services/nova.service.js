import bedrockProvider from '../providers/bedrock.provider.js';
import { buildProductBriefPrompt } from '../prompts/product_brief.prompt.js';
import { buildDemoScriptPrompt } from '../prompts/demo_script.prompt.js';
import { buildStoryboardPrompt } from '../prompts/storyboard.prompt.js';
import { buildNarrationPrompt } from '../prompts/narration.prompt.js';
import { buildSubtitlesPrompt } from '../prompts/subtitles.prompt.js';
import { buildSceneJsonPrompt } from '../prompts/scene_json.prompt.js';
import { buildQaRewriterPrompt } from '../prompts/qa_rewriter.prompt.js';
import { buildVisualDirectionPrompt } from '../prompts/visual_direction.prompt.js';
import logger from '../utils/logger.js';

/**
 * Nova service orchestrates the full AI content generation pipeline.
 * Each step builds on the output of the previous step.
 */
const novaService = {
  /** Step 1: Generate product brief (supports multimodal with screenshots) */
  async generateBrief(project, screenshotBuffers = []) {
    logger.info(`Nova: generating brief for project ${project.id} (screenshots: ${screenshotBuffers.length})`);
    const hasScreenshots = screenshotBuffers.length > 0;
    const { system, user } = buildProductBriefPrompt(project, { hasScreenshots });

    if (hasScreenshots) {
      return bedrockProvider.invokeJsonWithImages(user, system, screenshotBuffers, { maxTokens: 4096 });
    }
    return bedrockProvider.invokeJson(user, system);
  },

  /** Step 2: Generate demo script from brief */
  async generateScript(project, brief) {
    logger.info(`Nova: generating script for project ${project.id}`);
    const { system, user } = buildDemoScriptPrompt(project, brief);
    return bedrockProvider.invokeJson(user, system);
  },

  /** Step 3: Generate storyboard from script */
  async generateStoryboard(project, script, screenshotCount) {
    logger.info(`Nova: generating storyboard for project ${project.id}`);
    const { system, user } = buildStoryboardPrompt(project, script, screenshotCount);
    return bedrockProvider.invokeJson(user, system);
  },

  /** Step 4: Generate narration from script + storyboard */
  async generateNarration(project, script, storyboard) {
    logger.info(`Nova: generating narration for project ${project.id}`);
    const { system, user } = buildNarrationPrompt(project, script, storyboard);
    return bedrockProvider.invokeJson(user, system);
  },

  /** Step 5: Generate subtitles from narration + storyboard */
  async generateSubtitles(narration, storyboard) {
    logger.info('Nova: generating subtitles');
    const { system, user } = buildSubtitlesPrompt(narration, storyboard);
    return bedrockProvider.invokeJson(user, system);
  },

  /** Step 6: Generate scene JSON for video assembly */
  async generateSceneJson(project, storyboard, narration, screenshotCount) {
    logger.info(`Nova: generating scene JSON for project ${project.id}`);
    const { system, user } = buildSceneJsonPrompt(project, storyboard, narration, screenshotCount);
    return bedrockProvider.invokeJson(user, system);
  },

  /** Step 7: QA rewrite pass on all content */
  async qaRewrite(brief, script, narration) {
    logger.info('Nova: running QA rewrite');
    const { system, user } = buildQaRewriterPrompt(brief, script, narration);
    return bedrockProvider.invokeJson(user, system);
  },

  /** Step 8: Generate visual direction */
  async generateVisualDirection(project, storyboard) {
    logger.info(`Nova: generating visual direction for project ${project.id}`);
    const { system, user } = buildVisualDirectionPrompt(project, storyboard);
    return bedrockProvider.invokeJson(user, system);
  },

  /**
   * Run the full content generation pipeline.
   * Returns all generated content.
   */
  async runFullPipeline(project, screenshotCount) {
    logger.info(`Nova: starting full pipeline for project ${project.id}`);

    // Step 1: Brief
    const brief = await this.generateBrief(project);

    // Step 2: Script
    const script = await this.generateScript(project, brief);

    // Step 3: Storyboard
    const storyboard = await this.generateStoryboard(project, script, screenshotCount);

    // Step 4: Narration
    const narration = await this.generateNarration(project, script, storyboard);

    // Step 5: QA pass
    const qa = await this.qaRewrite(brief, script, narration);
    const finalNarration = qa.polishedNarration || narration.fullNarration;

    // Step 6: Subtitles (using polished narration)
    const subtitles = await this.generateSubtitles(
      { ...narration, fullNarration: finalNarration },
      storyboard
    );

    // Step 7: Scene JSON
    const sceneJson = await this.generateSceneJson(
      project,
      storyboard,
      { ...narration, fullNarration: finalNarration },
      screenshotCount
    );

    logger.info(`Nova: full pipeline complete for project ${project.id}`);

    return {
      brief,
      script,
      storyboard,
      narration: { ...narration, fullNarration: finalNarration },
      subtitles,
      sceneJson,
      qaVersion: qa,
    };
  },
};

export default novaService;
