import env from '../config/env.js';
import logger from '../utils/logger.js';
import s3Provider from '../providers/storage.provider.js';

const BASE_URL = 'https://api.elevenlabs.io/v1';

const elevenLabsService = {
  /**
   * Generate speech audio from narration text.
   * Saves the result to S3 and returns the S3 key.
   *
   * @param {string} projectId - Project ID for S3 path
   * @param {string} text - Narration text to convert to speech
   * @param {object} [options] - Optional voice settings
   * @returns {{ s3Key: string, url: string }}
   */
  async generateVoiceover(projectId, text, options = {}) {
    const voiceId = options.voiceId || env.elevenLabs.voiceId;

    // Mock mode when ElevenLabs is not configured
    if (!env.elevenLabs.apiKey || !voiceId) {
      logger.info(`ElevenLabs: skipping voiceover (not configured), using silent placeholder`);
      const s3Key = `projects/${projectId}/voiceover/narration.mp3`;
      // Save an empty placeholder so the pipeline doesn't break
      await s3Provider.upload(s3Key, Buffer.alloc(0), 'audio/mpeg');
      const url = await s3Provider.getSignedUrl(s3Key);
      return { s3Key, url, mock: true };
    }

    logger.info(`ElevenLabs: generating voiceover for project ${projectId}, text length=${text.length}`);

    const response = await fetch(`${BASE_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': env.elevenLabs.apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: options.modelId || 'eleven_multilingual_v2',
        voice_settings: {
          stability: options.stability ?? 0.5,
          similarity_boost: options.similarityBoost ?? 0.75,
          style: options.style ?? 0.0,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error('ElevenLabs API error', { status: response.status, body: errorBody });
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    // Get audio buffer from response
    const audioBuffer = Buffer.from(await response.arrayBuffer());
    const s3Key = `projects/${projectId}/voiceover/narration.mp3`;

    await s3Provider.upload(s3Key, audioBuffer, 'audio/mpeg');
    const url = await s3Provider.getSignedUrl(s3Key);

    logger.info(`ElevenLabs: voiceover saved to ${s3Key}`);
    return { s3Key, url };
  },

  /**
   * Add a voice clone from a voice sample.
   * TODO: Full voice cloning requires ElevenLabs Professional plan.
   * For MVP, we use a pre-selected voice ID.
   *
   * @param {string} name - Voice name
   * @param {Buffer} audioBuffer - Voice sample audio
   * @returns {{ voiceId: string }}
   */
  async addVoiceClone(name, audioBuffer) {
    if (!env.elevenLabs.apiKey) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    logger.info(`ElevenLabs: creating voice clone "${name}"`);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('files', new Blob([audioBuffer], { type: 'audio/wav' }), 'sample.wav');

    const response = await fetch(`${BASE_URL}/voices/add`, {
      method: 'POST',
      headers: {
        'xi-api-key': env.elevenLabs.apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error('ElevenLabs voice clone error', { status: response.status, body: errorBody });
      throw new Error(`ElevenLabs voice clone error: ${response.status}`);
    }

    const data = await response.json();
    logger.info(`ElevenLabs: voice clone created with ID ${data.voice_id}`);
    return { voiceId: data.voice_id };
  },
};

export default elevenLabsService;
