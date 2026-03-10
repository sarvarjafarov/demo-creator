import logger from '../utils/logger.js';

/**
 * Simple in-process async job queue for MVP.
 * Jobs run one at a time per project to avoid race conditions.
 * Designed to be replaceable with BullMQ or SQS later.
 */
class JobQueue {
  constructor() {
    this.handlers = new Map();
    this.running = new Set();
  }

  /** Register a handler for a job type */
  register(type, handler) {
    this.handlers.set(type, handler);
  }

  /**
   * Enqueue and immediately start a job (fire-and-forget).
   * Returns the job record without waiting for completion.
   */
  enqueue(job) {
    const handler = this.handlers.get(job.type);
    if (!handler) {
      throw new Error(`No handler registered for job type: ${job.type}`);
    }

    // Run async - don't await
    this._run(job, handler);

    return job;
  }

  /**
   * Enqueue a job and wait for it to complete.
   * Used when you need to chain jobs sequentially.
   */
  async enqueueAndWait(job) {
    const handler = this.handlers.get(job.type);
    if (!handler) {
      throw new Error(`No handler registered for job type: ${job.type}`);
    }

    await this._run(job, handler);
    return job;
  }

  async _run(job, handler) {
    const key = `${job.projectId}:${job.type}`;
    if (this.running.has(key)) {
      logger.warn(`Job already running: ${key}`);
      return;
    }

    this.running.add(key);
    try {
      logger.info(`Job started: ${job.type} for project ${job.projectId}`);
      await handler(job);
      logger.info(`Job completed: ${job.type} for project ${job.projectId}`);
    } catch (err) {
      logger.error(`Job failed: ${job.type} for project ${job.projectId}`, {
        error: err.message,
        stack: err.stack,
      });
    } finally {
      this.running.delete(key);
    }
  }
}

// Singleton queue instance
const jobQueue = new JobQueue();

export default jobQueue;
