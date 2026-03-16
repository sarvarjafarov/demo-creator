import puppeteer from 'puppeteer';
import storageProvider from '../providers/storage.provider.js';
import assetModel from '../models/asset.model.js';
import logger from '../utils/logger.js';

/**
 * Captures screenshots from a product URL using Puppeteer.
 * Scrolls through the page and takes multiple screenshots at different viewports.
 */
const captureService = {
  /**
   * Visit a URL, scroll through the page, and capture screenshots.
   * Saves them to storage and creates asset records.
   *
   * @param {string} projectId - Project ID
   * @param {string} url - Product URL to capture
   * @returns {{ screenshots: Array }} - Array of saved asset records
   */
  async captureScreenshots(projectId, url) {
    logger.info(`Capture: starting screenshot capture for ${url}`);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      timeout: 30000,
    });

    const screenshots = [];

    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

      // Navigate to the URL with a generous timeout
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {
        // Fallback: try with just domcontentloaded
        return page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      });

      // Wait a bit for any animations/lazy-loaded content
      await page.evaluate(() => new Promise((r) => setTimeout(r, 2000)));

      // Get total page height
      const pageHeight = await page.evaluate(() => document.body.scrollHeight);
      const viewportHeight = 900;

      // Calculate scroll positions to capture the full page
      // Take a screenshot at each viewport-height interval
      const scrollPositions = [0]; // Always start at top
      const maxScreenshots = 6;
      const step = Math.max(viewportHeight, Math.floor(pageHeight / maxScreenshots));

      for (let y = step; y < pageHeight; y += step) {
        scrollPositions.push(y);
        if (scrollPositions.length >= maxScreenshots) break;
      }

      for (let i = 0; i < scrollPositions.length; i++) {
        const y = scrollPositions[i];

        // Scroll to position
        await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
        // Wait for any scroll-triggered animations
        await page.evaluate(() => new Promise((r) => setTimeout(r, 800)));

        // Take screenshot
        const buffer = await page.screenshot({ type: 'png' });

        const key = `projects/${projectId}/screenshots/${Date.now()}-capture-${i + 1}.png`;
        await storageProvider.upload(key, buffer, 'image/png');
        const assetUrl = await storageProvider.getSignedUrl(key);

        const asset = assetModel.create({
          projectId,
          type: 'screenshot',
          originalName: `capture-${i + 1}.png`,
          mimeType: 'image/png',
          s3Key: key,
          url: assetUrl,
        });

        screenshots.push(asset);
        logger.info(`Capture: saved screenshot ${i + 1}/${scrollPositions.length}`);
      }

      logger.info(`Capture: completed ${screenshots.length} screenshots for project ${projectId}`);
    } finally {
      await browser.close();
    }

    return { screenshots };
  },
};

export default captureService;
