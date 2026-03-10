import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../../.env') });

const env = {
  port: parseInt(process.env.PORT, 10) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',

  // AWS
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3Bucket: process.env.AWS_S3_BUCKET || 'demo-creator-assets',
    bedrockModelId: process.env.AWS_BEDROCK_MODEL_ID || 'amazon.nova-pro-v1:0',
    bedrockReelModelId: process.env.AWS_BEDROCK_REEL_MODEL_ID || 'amazon.nova-reel-v1:0',
  },

  // ElevenLabs
  elevenLabs: {
    apiKey: process.env.ELEVENLABS_API_KEY,
    voiceId: process.env.ELEVENLABS_VOICE_ID,
  },

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // App
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:3001',
  clientBuildPath: process.env.CLIENT_BUILD_PATH || 'client/dist',
  sessionSecret: process.env.SESSION_SECRET || 'dev-secret-change-me',
};

export default env;
