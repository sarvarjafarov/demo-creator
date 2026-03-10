import { v4 as uuid } from 'uuid';
import db from './db.js';

const jobModel = {
  /** Create a new job */
  create(projectId, type) {
    const id = uuid();
    db.prepare(`INSERT INTO jobs (id, projectId, type) VALUES (?, ?, ?)`).run(id, projectId, type);
    return this.findById(id);
  },

  /** Find job by ID */
  findById(id) {
    return db.prepare('SELECT * FROM jobs WHERE id = ?').get(id) || null;
  },

  /** Find all jobs for a project */
  findByProject(projectId) {
    return db.prepare('SELECT * FROM jobs WHERE projectId = ? ORDER BY rowid').all(projectId);
  },

  /** Find latest job of a given type for a project */
  findLatest(projectId, type) {
    return db.prepare('SELECT * FROM jobs WHERE projectId = ? AND type = ? ORDER BY rowid DESC LIMIT 1')
      .get(projectId, type) || null;
  },

  /** Mark job as started */
  start(id) {
    db.prepare(`UPDATE jobs SET status = 'running', startedAt = datetime('now') WHERE id = ?`).run(id);
    return this.findById(id);
  },

  /** Mark job as completed with optional output */
  complete(id, output) {
    db.prepare(`UPDATE jobs SET status = 'completed', completedAt = datetime('now'), output = ? WHERE id = ?`)
      .run(output ? JSON.stringify(output) : null, id);
    return this.findById(id);
  },

  /** Mark job as failed with error message */
  fail(id, errorMessage) {
    db.prepare(`UPDATE jobs SET status = 'failed', completedAt = datetime('now'), errorMessage = ? WHERE id = ?`)
      .run(errorMessage, id);
    return this.findById(id);
  },

  /** Append to job logs */
  appendLog(id, message) {
    const job = this.findById(id);
    const logs = job?.logs ? JSON.parse(job.logs) : [];
    logs.push({ time: new Date().toISOString(), message });
    db.prepare('UPDATE jobs SET logs = ? WHERE id = ?').run(JSON.stringify(logs), id);
  },
};

export default jobModel;
