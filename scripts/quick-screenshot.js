#!/usr/bin/env node

/**
 * Simple screenshot capture using web-fetch (no browser required)
 * This captures HTML and converts to image via external service
 * 
 * Usage:
 *   npm run quick-screenshots -- --pages home,about,blog
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration  
const config = {
  outputDir: 'static/screenshot-reviews',
  defaultPages: ['', 'about', 'blog'],
};

// Parse command line args manually
let pagesArg = config.defaultPages.join(',');
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--pages' && process.argv[i + 1]) {
    pagesArg = process.argv[++i];
  }
}
const options = { pages: pagesArg };

async function main() {
  console.log('📸 Quick Screenshot Capture (HTML-based)');
  console.log('==========================================\n');

  const pages = options.pages.split(',').map(p => p.trim());
  const outputDir = path.join(process.cwd(), config.outputDir);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  console.log(`📁 Output: ${outputDir}\n`);

  const baseUrl = 'https://zachcutler.me';

  for (const pageName of pages) {
    const pagePath = pageName === '' ? '' : `/${pageName}`;
    const url = `${baseUrl}${pagePath}`;
    console.log(`📄 Fetching: ${url}`);
    
    try {
      // Fetch HTML content
      const html = await fetchHtml(url);
      
      // Save as HTML file with screenshot metadata
      const filename = pageName === '' ? 'index' : pageName;
    const outputPath = path.join(outputDir, `${filename}.html`);
      const wrappedContent = wrapForScreenshot(html, pageName, url);
      fs.writeFileSync(outputPath, wrappedContent, 'utf-8');
      
      console.log(`   ✅ Saved: ${path.basename(outputPath)}\n`);
    } catch (error) {
      console.error(`   ❌ Failed for ${url}: ${error.message}\n`);
    }
  }

  // Generate index
  await generateIndex(pages, outputDir, baseUrl);
  
  console.log('✅ Capture complete!');
}

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function wrapForScreenshot(html, pageName, url) {
  const displayName = pageName === '' ? 'home' : pageName;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${displayName} - Screenshot Review</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; }
    .screenshot-info { background: #f0f0f0; padding: 15px; margin-bottom: 20px; border-radius: 8px; }
    .original-link { display: inline-block; margin-top: 10px; color: #0366d6; text-decoration: none; }
    .original-link:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="screenshot-info">
    <h2>Screenshot Review - ${displayName}</h2>
    <p><strong>URL:</strong> <a href="${url}">${url}</a></p>
    <p><strong>Captured:</strong> ${new Date().toLocaleString()}</p>
    <p>This is an HTML capture of the page. For visual screenshots, install Playwright or Puppeteer.</p>
  </div>
  
  <h3>Original Page Content Preview</h3>
  <pre style="background: #f5f5f5; padding: 15px; overflow-x: auto; max-height: 400px;">${html.substring(0, 2000)}...</pre>
  
  <a href="${url}" class="original-link" target="_blank">View Original Page →</a>
</body>
</html>`;
}

async function generateIndex(pages, outputDir, baseUrl) {
  const date = new Date().toISOString();
  
  let table = '| Page | URL | Captured |\n';
  table += '|------|-----|----------|\n';
  
  pages.forEach(page => {
    const displayName = page === '' ? 'home' : page;
    const pagePath = page === '' ? '' : `/${page}`;
    table += `| ${displayName} | [${baseUrl}${pagePath}](${baseUrl}${pagePath}) | ${date} |\n`;
  });

  const readme = `# Screenshot Reviews\n\nThis directory contains HTML captures of documentation pages for review.\n\n**Generated:** ${date}\n\n## Pages Captured\n\n${table}\n\n## Visual Screenshots\n\nFor full visual screenshots (PNG), install Playwright:\n\n\`\`\`bash\nnpm install --save-dev playwright\nnpx playwright install chromium\nnode scripts/capture-docs-screenshots.js\n\`\`\`\n`;

  fs.writeFileSync(path.join(outputDir, 'README.md'), readme, 'utf-8');
  console.log('📝 Generated README index');
}

main();
