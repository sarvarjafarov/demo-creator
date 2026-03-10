import Database from 'better-sqlite3';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';
import logger from '../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = resolve(__dirname, '../../data/demo-creator.sqlite');

// Ensure data directory exists
mkdirSync(dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/** Initialize all tables */
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT,
      productName TEXT NOT NULL,
      productCategory TEXT,
      shortDescription TEXT NOT NULL,
      targetAudience TEXT,
      productUrl TEXT,
      preferredDemoStyle TEXT DEFAULT 'clean SaaS demo',
      preferredVideoLength TEXT DEFAULT '60 sec',
      callToAction TEXT,
      brandColors TEXT,
      toneOfVoice TEXT,
      keyFeatures TEXT,
      competitorNames TEXT,
      desiredOutcome TEXT,
      status TEXT DEFAULT 'created',
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      projectId TEXT NOT NULL,
      type TEXT NOT NULL,
      originalName TEXT,
      mimeType TEXT,
      s3Key TEXT,
      url TEXT,
      metadata TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS generated_content (
      id TEXT PRIMARY KEY,
      projectId TEXT NOT NULL UNIQUE,
      brief TEXT,
      script TEXT,
      storyboard TEXT,
      narration TEXT,
      subtitles TEXT,
      sceneJson TEXT,
      qaVersion TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      projectId TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      startedAt TEXT,
      completedAt TEXT,
      logs TEXT,
      output TEXT,
      errorMessage TEXT,
      FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);

  logger.info('Database initialized');
}

export default db;
