import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import env from '../config/env.js';
import logger from '../utils/logger.js';
import mockBedrockProvider from './mock-bedrock.provider.js';

// Use mock when AWS credentials are not configured
const USE_MOCK = !env.aws.accessKeyId || !env.aws.secretAccessKey;

if (USE_MOCK) {
  logger.info('Bedrock: using mock provider (no AWS credentials configured)');
}

const client = USE_MOCK ? null : new BedrockRuntimeClient({
  region: env.aws.region,
  credentials: {
    accessKeyId: env.aws.accessKeyId,
    secretAccessKey: env.aws.secretAccessKey,
  },
});

const bedrockProvider = {
  /**
   * Invoke Amazon Nova via Bedrock.
   * Falls back to mock responses when AWS is not configured.
   */
  async invoke(prompt, systemPrompt, options = {}) {
    if (USE_MOCK) return mockBedrockProvider.invoke(prompt, systemPrompt, options);

    const modelId = options.modelId || env.aws.bedrockModelId;
    const maxTokens = options.maxTokens || 4096;
    const temperature = options.temperature ?? 0.7;

    const body = {
      messages: [
        {
          role: 'user',
          content: [{ text: prompt }],
        },
      ],
      inferenceConfig: {
        maxTokens,
        temperature,
        topP: options.topP ?? 0.9,
      },
    };

    if (systemPrompt) {
      body.system = [{ text: systemPrompt }];
    }

    logger.debug(`Bedrock invoke: model=${modelId}, prompt length=${prompt.length}`);

    const command = new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(body),
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    const outputText = responseBody.output?.message?.content?.[0]?.text
      || responseBody.content?.[0]?.text
      || '';

    logger.debug(`Bedrock response length: ${outputText.length}`);
    return outputText;
  },

  /**
   * Invoke Nova with multimodal content (text + images).
   * @param {string} prompt - Text prompt
   * @param {string} systemPrompt - System prompt
   * @param {Buffer[]} imageBuffers - Array of PNG/JPEG image buffers
   * @param {object} options - Model options
   */
  async invokeWithImages(prompt, systemPrompt, imageBuffers = [], options = {}) {
    if (USE_MOCK) return mockBedrockProvider.invoke(prompt, systemPrompt, options);

    const modelId = options.modelId || env.aws.bedrockModelId;
    const maxTokens = options.maxTokens || 4096;
    const temperature = options.temperature ?? 0.7;

    // Build content blocks: images first, then text
    const contentBlocks = [];
    for (const buf of imageBuffers) {
      contentBlocks.push({
        image: {
          format: 'png',
          source: { bytes: buf.toString('base64') },
        },
      });
    }
    contentBlocks.push({ text: prompt });

    const body = {
      messages: [{ role: 'user', content: contentBlocks }],
      inferenceConfig: {
        maxTokens,
        temperature,
        topP: options.topP ?? 0.9,
      },
    };

    if (systemPrompt) {
      body.system = [{ text: systemPrompt }];
    }

    logger.debug(`Bedrock invoke (multimodal): model=${modelId}, images=${imageBuffers.length}, prompt length=${prompt.length}`);

    const command = new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(body),
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    const outputText = responseBody.output?.message?.content?.[0]?.text
      || responseBody.content?.[0]?.text
      || '';

    logger.debug(`Bedrock multimodal response length: ${outputText.length}`);
    return outputText;
  },

  /**
   * Invoke Nova with images and parse JSON from the response.
   */
  async invokeJsonWithImages(prompt, systemPrompt, imageBuffers = [], options = {}) {
    if (USE_MOCK) return mockBedrockProvider.invokeJson(prompt, systemPrompt, options);

    const text = await this.invokeWithImages(prompt, systemPrompt, imageBuffers, options);

    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    try {
      return JSON.parse(cleaned);
    } catch (err) {
      logger.error('Failed to parse JSON from Bedrock multimodal response', { text: cleaned.slice(0, 500) });
      throw new Error('Failed to parse structured output from Nova');
    }
  },

  /**
   * Invoke Nova and parse JSON from the response.
   * Handles markdown code fences in responses.
   */
  async invokeJson(prompt, systemPrompt, options = {}) {
    if (USE_MOCK) return mockBedrockProvider.invokeJson(prompt, systemPrompt, options);

    const text = await this.invoke(prompt, systemPrompt, options);

    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    try {
      return JSON.parse(cleaned);
    } catch (err) {
      logger.error('Failed to parse JSON from Bedrock response', { text: cleaned.slice(0, 500) });
      throw new Error('Failed to parse structured output from Nova');
    }
  },
};

export default bedrockProvider;
