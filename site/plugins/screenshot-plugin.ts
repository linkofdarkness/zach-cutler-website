/**
 * Docusaurus plugin for capturing page screenshots during build
 * 
 * Usage:
 * - Install puppeteer: npm install --save-dev puppeteer
 * - Add to docusaurus.config.ts plugins array
 * - Screenshots saved to static/screenshot-reviews/
 */

import type { Plugin } from '@docusaurus/types';
import path from 'path';
import fs from 'fs-extra';
import puppeteer from 'puppeteer';

interface ScreenshotPluginOptions {
  /** Pages to capture (relative paths without leading /) */
  pages: string[];
  
  /** Output directory relative to static folder */
  outputDir?: string;
  
  /** Screenshot dimensions */
  viewportWidth?: number;
  viewportHeight?: number;
  
  /** Enable dark mode screenshots */
  captureDarkMode?: boolean;
}

export default function screenshotPlugin(options: ScreenshotPluginOptions): Plugin {
  const outputDir = path.join(process.cwd(), 'static', options.outputDir || 'screenshot-reviews');

  return {
    name: 'docusaurus-screenshot-plugin',

    async loadContent() {
      // Nothing to load, we just hook into build hooks
      return [];
    },

    async contentLoaded({ actions }) {
      // Actions available but not used in this plugin
    },

    async postBuild({ outDir, siteConfig, ...context }) {
      console.log('📸 Starting screenshot capture...');
      
      // Ensure output directory exists
      await fs.ensureDir(outputDir);

      // Base URLs to screenshot (these will be served from static folder)
      const baseUrl = `http://localhost:${siteConfig.port || 3000}`;
      
      const pagesToCapture = options.pages.map(p => `${baseUrl}/${p}`);

      // Launch browser for screenshots
      const browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      });

      try {
        for (const url of pagesToCapture) {
          const pageName = path.basename(url.replace(baseUrl, ''));
          console.log(`📸 Capturing: ${pageName}`);

          const page = await browser.newPage();
          
          // Set viewport
          await page.setViewport({
            width: options.viewportWidth || 1200,
            height: options.viewportHeight || 800,
          });

          // Navigate to page
          await page.goto(url, { waitUntil: 'networkidle0' });

          // Take screenshot (light mode)
          const lightScreenshotPath = path.join(outputDir, `${pageName}-light.png`);
          await page.screenshot({ 
            path: lightScreenshotPath,
            fullPage: true 
          });
          console.log(`✅ Saved: ${lightScreenshotPath}`);

          // Optional: Dark mode screenshot
          if (options.captureDarkMode) {
            await page.evaluate(() => {
              document.documentElement.setAttribute('data-theme', 'dark');
            });
            
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait for theme switch
            
            const darkScreenshotPath = path.join(outputDir, `${pageName}-dark.png`);
            await page.screenshot({ 
              path: darkScreenshotPath,
              fullPage: true 
            });
            console.log(`✅ Saved (dark): ${darkScreenshotPath}`);
          }

          await page.close();
        }

        // Generate JSDoc index file for review
        const jsdocIndexPath = path.join(outputDir, 'README.md');
        const readmeContent = generateReadme(pagesToCapture, outputDir, options);
        await fs.writeFile(jsdocIndexPath, readmeContent, 'utf-8');
        console.log(`📝 Generated: ${jsdocIndexPath}`);

      } finally {
        await browser.close();
      }

      console.log('✅ Screenshot capture complete!');
    },
  };
}

function generateReadme(pages: string[], outputDir: string, options: ScreenshotPluginOptions): string {
  const date = new Date().toISOString().split('T')[0];
  
  return `# Page Screenshots for Review

This directory contains automated screenshots of key pages taken during the Docusaurus build process.

**Generated:** ${date}  
**Browser:** Puppeteer (Chromium headless)  
**Viewport:** ${options.viewportWidth || 1200}x${options.viewportHeight || 800}px

## Pages Captured

| Page | Light Mode | Dark Mode |
|------|-----------|-----------|
`;

  pages.forEach(page => {
    const pageName = path.basename(page.replace('http://localhost:3000/', ''));
    return `| ${pageName} | [${pageName}-light.png](./screenshot-reviews/${pageName}-light.png) | ${options.captureDarkMode ? `[${pageName}-dark.png](./screenshot-reviews/${pageName}-dark.png)` : 'N/A'} |\n`;
  });

  return `
## How to Use

1. Navigate to this directory in your browser or download the screenshots
2. Review each page for layout, typography, and styling issues
3. Compare light vs dark mode if captured

## Automating with JSDoc Integration

To integrate these screenshots into your documentation:

\`\`\`javascript
/**
 * @fileoverview Page screenshot reviews for QA
 * @see {@link https://zachcutler.me/screenshot-reviews/ | Screenshot Reviews}
 */

// Example usage in a blog post or docs page:
// <img src="https://zachcutler.me/screenshot-reviews/homepage-light.png" alt="Homepage preview" />
\`\`\`

## Updating Screenshots

To capture new pages, edit \`plugins/screenshot-plugin.ts\` and update the \`pages\` array.
`;
}
