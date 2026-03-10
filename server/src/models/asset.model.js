import { v4 as uuid } from 'uuid';
import db from './db.js';

const assetModel = {
  /** Create a new asset record */
  create(data) {
    const id = uuid();
    db.prepare(`
      INSERT INTO assets (id, projectId, type, originalName, mimeType, s3Key, url, metadata)
      VALUES (@id, @projectId, @type, @originalName, @mimeType, @s3Key, @url, @metadata)
    `).run({
      id,
      projectId: data.projectId,
      type: data.type,
      originalName: data.originalName || null,
      mimeType: data.mimeType || null,
      s3Key: data.s3Key || null,
      url: data.url || null,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    });

    return this.findById(id);
  },

  /** Find asset by ID */
  findById(id) {
    return db.prepare('SELECT * FROM assets WHERE id = ?').get(id) || null;
  },

  /** Find all assets for a project, optionally filtered by type */
  findByProject(projectId, type) {
    if (type) {
      return db.prepare('SELECT * FROM assets WHERE projectId = ? AND type = ? ORDER BY createdAt').all(projectId, type);
    }
    return db.prepare('SELECT * FROM assets WHERE projectId = ? ORDER BY createdAt').all(projectId);
  },

  /** Delete asset */
  delete(id) {
    db.prepare('DELETE FROM assets WHERE id = ?').run(id);
  },
};

export default assetModel;
