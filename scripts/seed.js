#!/usr/bin/env node

/**
 * Seed script - creates a sample project for demo/testing.
 * Run: node scripts/seed.js
 */

import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

// Dynamic import after env is loaded
const { initDatabase } = await import('../server/src/models/db.js');
const projectModel = (await import('../server/src/models/project.model.js')).default;

initDatabase();

const project = projectModel.create({
  productName: 'FlowBoard',
  productCategory: 'Project Management',
  shortDescription: 'FlowBoard is an intelligent project management platform that automates task assignments, tracks progress in real-time, and helps teams ship 2x faster with AI-powered sprint planning.',
  targetAudience: 'Engineering managers and product leads at fast-growing startups (20-200 employees)',
  productUrl: 'https://flowboard.io',
  preferredDemoStyle: 'clean SaaS demo',
  preferredVideoLength: '60 sec',
  callToAction: 'Start your free 14-day trial',
  brandColors: '#2563eb, #1e3a8a, #ffffff',
  toneOfVoice: 'Confident, modern, and results-oriented',
  keyFeatures: 'AI sprint planning, real-time progress tracking, automated task assignment, team velocity dashboard, Slack and GitHub integrations',
  competitorNames: 'Jira, Linear, Asana',
  desiredOutcome: 'Drive free trial signups from engineering leaders',
});

console.log('Seed project created:');
console.log(`  ID:   ${project.id}`);
console.log(`  Name: ${project.productName}`);
console.log(`  URL:  http://localhost:5173/projects/${project.id}/upload`);
console.log('');
console.log('Next: upload screenshots and voice sample at the URL above.');

process.exit(0);
