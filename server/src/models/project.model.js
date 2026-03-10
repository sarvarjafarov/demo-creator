import { v4 as uuid } from 'uuid';
import db from './db.js';

const projectModel = {
  /** Create a new project and return it */
  create(data) {
    const id = uuid();
    const stmt = db.prepare(`
      INSERT INTO projects (id, title, productName, productCategory, shortDescription,
        targetAudience, productUrl, preferredDemoStyle, preferredVideoLength,
        callToAction, brandColors, toneOfVoice, keyFeatures, competitorNames, desiredOutcome)
      VALUES (@id, @title, @productName, @productCategory, @shortDescription,
        @targetAudience, @productUrl, @preferredDemoStyle, @preferredVideoLength,
        @callToAction, @brandColors, @toneOfVoice, @keyFeatures, @competitorNames, @desiredOutcome)
    `);

    stmt.run({
      id,
      title: data.title || data.productName,
      productName: data.productName,
      productCategory: data.productCategory || null,
      shortDescription: data.shortDescription,
      targetAudience: data.targetAudience || null,
      productUrl: data.productUrl || null,
      preferredDemoStyle: data.preferredDemoStyle || 'clean SaaS demo',
      preferredVideoLength: data.preferredVideoLength || '60 sec',
      callToAction: data.callToAction || null,
      brandColors: data.brandColors || null,
      toneOfVoice: data.toneOfVoice || null,
      keyFeatures: data.keyFeatures || null,
      competitorNames: data.competitorNames || null,
      desiredOutcome: data.desiredOutcome || null,
    });

    return this.findById(id);
  },

  /** Find project by ID */
  findById(id) {
    return db.prepare('SELECT * FROM projects WHERE id = ?').get(id) || null;
  },

  /** List all projects ordered by creation date */
  findAll() {
    return db.prepare('SELECT * FROM projects ORDER BY createdAt DESC').all();
  },

  /** Update project status */
  updateStatus(id, status) {
    db.prepare(`UPDATE projects SET status = ?, updatedAt = datetime('now') WHERE id = ?`).run(status, id);
    return this.findById(id);
  },

  /** Update project fields */
  update(id, data) {
    const fields = Object.keys(data)
      .filter((k) => data[k] !== undefined)
      .map((k) => `${k} = @${k}`)
      .join(', ');

    if (!fields) return this.findById(id);

    db.prepare(`UPDATE projects SET ${fields}, updatedAt = datetime('now') WHERE id = @id`).run({ ...data, id });
    return this.findById(id);
  },

  /** Delete project */
  delete(id) {
    db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  },
};

export default projectModel;
