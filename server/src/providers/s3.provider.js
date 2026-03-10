import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import env from '../config/env.js';
import logger from '../utils/logger.js';

const s3 = new S3Client({
  region: env.aws.region,
  ...(env.aws.accessKeyId && {
    credentials: {
      accessKeyId: env.aws.accessKeyId,
      secretAccessKey: env.aws.secretAccessKey,
    },
  }),
});

const BUCKET = env.aws.s3Bucket;

const s3Provider = {
  /**
   * Upload a buffer or stream to S3.
   * Returns the S3 key.
   */
  async upload(key, body, contentType) {
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }));
    logger.info(`S3 uploaded: ${key}`);
    return key;
  },

  /**
   * Upload a multer file object to S3.
   * Returns { s3Key, url }.
   */
  async uploadFile(file, keyPrefix) {
    const ext = file.originalname.split('.').pop();
    const key = `${keyPrefix}/${Date.now()}-${file.originalname}`;
    await this.upload(key, file.buffer, file.mimetype);
    const url = await this.getSignedUrl(key);
    return { s3Key: key, url };
  },

  /** Get a pre-signed URL for downloading (valid 1 hour) */
  async getSignedUrl(key, expiresIn = 3600) {
    const url = await getSignedUrl(s3, new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }), { expiresIn });
    return url;
  },

  /** Download file from S3 as a buffer */
  async download(key) {
    const { Body, ContentType } = await s3.send(new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }));

    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of Body) {
      chunks.push(chunk);
    }
    return { buffer: Buffer.concat(chunks), contentType: ContentType };
  },

  /** Delete a file from S3 */
  async delete(key) {
    await s3.send(new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }));
    logger.info(`S3 deleted: ${key}`);
  },

  /** Build the public URL for an S3 object (if bucket is public) */
  getPublicUrl(key) {
    return `https://${BUCKET}.s3.${env.aws.region}.amazonaws.com/${key}`;
  },
};

export default s3Provider;
