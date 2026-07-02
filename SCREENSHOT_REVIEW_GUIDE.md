# Screenshot Review System Guide

This guide explains how to capture and review documentation screenshots using automated tools.

## Quick Start

### Option 1: Quick HTML Capture (Recommended - No Dependencies)

Captures HTML content as preview files. Fast, no browser required:

```bash
# From repository root
cd /home/node/.openclaw/workspace/repos/zach-cutler-website
node scripts/quick-screenshot.js --pages home,about,blog
```

### Option 2: Visual PNG Screenshots (Requires Browser)

Captures actual browser screenshots with dark mode support:

```bash
# Install puppeteer-core first
npm install --save-dev puppeteer-core

# Then run capture
node scripts/capture-docs-screenshots.js --pages home,about,blog
```

### Option 3: GitHub Actions (Automated)

Trigger via [Actions tab](https://github.com/linkofdarkness/zach-cutler-website/actions) → "Capture Documentation Screenshots" workflow.

### View Captured Screenshots

**Quick HTML captures:** Saved to `/home/node/.openclaw/workspace/static/screenshot-reviews/`
- Open `README.md` for a formatted index
- Browse `.html` files in your file explorer or browser

**Visual PNG screenshots:** Saved to `site/static/screenshot-reviews/` (after installing puppeteer-core)
- Browse PNG files directly
- Serve with `npx serve site/static/screenshot-reviews -p 3001`

## Configuration Options

### Command Line Arguments

**Quick HTML capture:**
```bash
--pages "",about,blog,tutorials/api-reference  # Use "" for homepage, others as names
```

**Visual PNG capture (with puppeteer-core):**
```bash
--pages "",about,blog    # Use "" for homepage (/), others as paths
--no-dark                # Skip dark mode screenshots (default: captures both)
```

### Default Configuration

| Method | Pages | Output Type |
|--------|-------|-------------|
| Quick HTML | `"",about,blog` | `.html` preview files |
| Visual PNG | Configurable | `.png` screenshots (light + dark) |

## JSDoc Integration

### Documenting with Screenshots in Code

**For quick HTML captures:**
```javascript
/**
 * @fileoverview Homepage component with screenshot integration
 * @see {@link https://zachcutler.me/screenshot-reviews/home.html | Screenshot Review}
 */

/**
 * Renders the homepage layout
 * 
 * @example
 * // View captured HTML preview for review
 * <a href="./screenshot-reviews/home.html" target="_blank">Review Screenshot</a>
 * 
 * @returns {JSX.Element} Homepage component
 */
function Homepage() {
  return (
    <div className="homepage">
      {/* ... */}
    </div>
  );
}
```

**For visual PNG screenshots:**
```javascript
/**
 * @example
 * // View captured screenshot for visual review
 * <img src="./screenshot-reviews/index-light.png" alt="Homepage preview (light mode)" />
 * <img src="./screenshot-reviews/index-dark.png" alt="Homepage preview (dark mode)" data-theme="dark" />
 */
```

### Generate JSDoc Documentation

```bash
# Install jsdoc if not already installed
npm install --save-dev jsdoc

# Generate documentation with screenshot references
npx jsdoc scripts/jsdoc-screenshot-docs.js --destination .jsdoc-output
```

## Automated Screenshots (CI/CD)

### Manual Trigger via GitHub Actions

1. Go to **Actions** tab → [Capture Documentation Screenshots](https://github.com/linkofdarkness/zach-cutler-website/actions/workflows/capture-screenshots.yml)
2. Click **"Run workflow"**
3. Optionally configure:
   - Pages to capture (default: `home,about,blog`)
   - Dark mode toggle
4. Wait for the job to complete (~5 minutes)

### Scheduled Captures

By default, screenshots are captured daily at 2 AM UTC via the scheduled workflow. This ensures you always have fresh review images.

## Best Practices

1. **Use Quick HTML First**: Start with the quick-screenshot system (no dependencies required)
2. **Add Visual Screenshots Later**: Use puppeteer-core when you need actual PNG images
3. **Review Before Merging**: Compare screenshots to catch visual regressions in PRs
4. **Document Changes**: Update README.md in `screenshot-reviews/` when adding new pages

## Troubleshooting

### puppeteer-core Installation Issues

If you encounter module not found errors:
```bash
cd site
npm install --save-dev puppeteer-core@latest
node -e "try { require('puppeteer-core'); console.log('✅ Ready'); } catch(e) { process.exit(1); }"
```

### Visual Screenshots Not Capturing

- Ensure the site is built and running: `npm run build && npm run serve &`
- Check page URLs are correct (relative paths without leading `/`)
- Verify puppeteer-core can access localhost:3000

### Dark Mode Not Working

- Ensure your theme supports dark mode (`data-theme="dark"`)
- Add a 500ms delay after switching themes for CSS transitions to complete
- Check that the colorMode is enabled in `docusaurus.config.ts`

## Files Reference

| File | Purpose |
|------|---------|
| `scripts/quick-screenshot.js` | Quick HTML capture (no browser required) ⭐ Recommended |
| `scripts/capture-docs-screenshots.js` | Visual PNG capture with puppeteer-core |
| `scripts/jsdoc-screenshot-docs.js` | JSDoc configuration and documentation generator |
| `.github/workflows/capture-screenshots.yml` | GitHub Actions workflow for automation |

## Advanced: Custom Plugin

For tight integration with Docusaurus build, create a plugin:

```typescript
// plugins/screenshot-plugin.ts
import type { Plugin } from '@docusaurus/types';
import puppeteer from 'puppeteer';

export default function screenshotPlugin(): Plugin {
  return {
    async postBuild({ outDir }) {
      const browser = await puppeteer.launch();
      // ... capture logic
      await browser.close();
    }
  };
}
```

Then add to `docusaurus.config.ts`:
```typescript
plugins: ['./plugins/screenshot-plugin.ts'],
```

---

**Need help?** Check the [JSDoc output](.jsdoc-output/) for detailed API documentation, or file an issue in this repository.
