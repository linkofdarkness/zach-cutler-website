/**
 * JSDoc configuration for screenshot review system
 * 
 * This file documents the automated screenshot capture workflow.
 * Run with: npx jsdoc scripts/screenshot-plugin.ts --destination .jsdoc-output
 */

/**
 * @fileoverview Automated documentation screenshot capture system
 * @version 1.0.0
 * @author Zach Cutler
 * @see {@link https://zachcutler.me/screenshot-reviews/ | Screenshot Reviews}
 */

/**
 * Capture screenshots of documentation pages for QA and review
 * 
 * Usage:
 * ```bash
 * # Run from site directory
 * npm run capture-screenshots -- --pages home,about,blog
 * 
 * # With dark mode disabled
 * npm run capture-screenshots -- --no-dark
 * 
 * # Using bash script wrapper
 * ./scripts/capture-docs-screenshots.sh --pages home,about,blog
 * ```
 * 
 * @example
 * // Capture homepage and about page screenshots
 * <img src="./screenshot-reviews/homepage-light.png" alt="Homepage preview" />
 * <img src="./screenshot-reviews/about-dark.png" alt="About page dark mode" />
 */

/**
 * Configuration options for screenshot capture
 * @typedef {Object} ScreenshotConfig
 * @property {string[]} pages - Array of page paths to capture (e.g., ['home', 'about'])
 * @property {number} [viewportWidth=1200] - Width of browser viewport in pixels
 * @property {number} [viewportHeight=800] - Height of browser viewport in pixels  
 * @property {boolean} [captureDarkMode=true] - Whether to capture dark mode screenshots
 * @property {string} [outputDir='static/screenshot-reviews'] - Output directory for screenshots
 */

/**
 * Example configuration object
 * @type {ScreenshotConfig}
 */
const screenshotConfig = {
  pages: ['home', 'about', 'blog'],
  viewportWidth: 1200,
  viewportHeight: 800,
  captureDarkMode: true,
  outputDir: 'static/screenshot-reviews'
};

/**
 * Generate JSDoc index file for screenshot reviews
 * @param {string[]} pages - Array of page names that were captured
 * @param {string} outputDir - Directory where README should be written
 * @returns {Promise<string>} Generated README content
 */
async function generateJSDocIndex(pages, outputDir) {
  const date = new Date().toISOString();
  
  return `# Documentation Screenshot Reviews

This directory contains automated screenshots of documentation pages for quality assurance.

## Generated Information

- **Generated:** ${date}
- **Pages Captured:** ${pages.join(', ')}
- **Viewport:** ${screenshotConfig.viewportWidth}x${screenshotConfig.viewportHeight}px
- **Dark Mode:** ${screenshotConfig.captureDarkMode ? 'Captured' : 'Skipped'}

## Page Index

| Page | Light Mode | Dark Mode |
|------|-----------|----------|
${pages.map(page => `| ${page} | [${page}-light.png](./screenshot-reviews/${page}-light.png) | ${screenshotConfig.captureDarkMode ? `[${page}-dark.png](./screenshot-reviews/${page}-dark.png)` : 'N/A'} |`).join('\n')}

## Integration Examples

### In Markdown Documentation
\`\`\`markdown
![Homepage Preview](./screenshot-reviews/homepage-light.png)
\`\`\`

### In JSDoc Comments
\`\`\`javascript
/**
 * @example
 * <img src="./screenshot-reviews/about-page-light.png" alt="About page preview" />
 */
function displayAbout() {
  // ...
}
\`\`\`

## CI/CD Integration

Screenshots are automatically captured via GitHub Actions:
- **Schedule:** Daily at 2 AM UTC
- **Manual Trigger:** Use "Run workflow" button in Actions tab
- **Artifacts:** Available for 30 days after build completion

### Running Locally

\`\`\`bash
# From the site directory
cd site
npm run capture-screenshots -- --pages home,about,blog

# Using bash wrapper (from repo root)
./scripts/capture-docs-screenshots.sh --pages home,about,blog
\`\`\`
`;
}

module.exports = { 
  screenshotConfig,
  generateJSDocIndex,
  
  /**
   * Run the complete screenshot capture workflow
   * @param {ScreenshotConfig} config - Override configuration options
   */
  async runCaptureWorkflow(config) {
    const mergedConfig = { ...screenshotConfig, ...config };
    
    // Implementation would use puppeteer to launch browser and capture pages
    console.log('📸 Starting screenshot capture...');
    console.log('Configuration:', JSON.stringify(mergedConfig, null, 2));
    
    return mergedConfig;
  }
};
