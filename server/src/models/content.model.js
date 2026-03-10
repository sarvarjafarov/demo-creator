import { v4 as uuid } from 'uuid';
import db from './db.js';

const contentModel = {
  /** Create or update generated content for a project (upsert) */
  upsert(projectId, data) {
    const existing = this.findByProject(projectId);

    if (existing) {
      const fields = Object.keys(data)
        .filter((k) => data[k] !== undefined)
        .map((k) => `${k} = @${k}`)
        .join(', ');

      if (!fields) return existing;

      db.prepare(`UPDATE generated_content SET ${fields}, updatedAt = datetime('now') WHERE projectId = @projectId`)
        .run({ ...data, projectId });
    } else {
      const id = uuid();
      db.prepare(`
        INSERT INTO generated_content (id, projectId, brief, script, storyboard, narration, subtitles, sceneJson, qaVersion)
        VALUES (@id, @projectId, @brief, @script, @storyboard, @narration, @subtitles, @sceneJson, @qaVersion)
      `).run({
        id,
        projectId,
        brief: data.brief || null,
        script: data.script || null,
        storyboard: data.storyboard || null,
        narration: data.narration || null,
        subtitles: data.subtitles || null,
        sceneJson: data.sceneJson || null,
        qaVersion: data.qaVersion || null,
      });
    }

    return this.findByProject(projectId);
  },

  /** Find generated content by project ID */
  findByProject(projectId) {
    return db.prepare('SELECT * FROM generated_content WHERE projectId = ?').get(projectId) || null;
  },
};

export default contentModel;
