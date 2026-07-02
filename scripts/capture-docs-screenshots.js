#!/usr/bin/env node

/**
 * Capture screenshots of documentation pages for review
 * 
 * Usage:
 *   npm run capture-screenshots  -- --pages home,about,blog
 *   node scripts/capture-docs-screenshots.js
 *
 * Features:
 * - Captures light and dark mode screenshots  
 * - Generates JSDoc index file for documentation
 * - Uses puppeteer-core (lighter weight)
 */

const puppeteer = require('puppeteer-core');
const fs = require('fs-extra');
const path = require('path');
const { program } = require('commander');

// Configuration  
const config = {
  outputDir: 'static/screenshot-reviews',
  viewportWidth: 1200,
  viewportHeight: 800,
  captureDarkMode: true,
  defaultPages: ['', 'about', 'blog'],
};

program
  .name('capture-docs-screenshots')
  .description('Capture screenshots of docs pages for review')
  .option('-p, --pages <pages>', 'Comma-separated list of page paths (e.g., home,about,blog)', config.defaultPages.join(','))
  .option('--no-dark', 'Skip dark mode screenshots')
  .parse();

const options = program.opts();
config.captureDarkMode = options.dark;

async function main() {
  console.log('📸 Documentation Screenshot Capture');
  console.log('====================================\n');

  const pages = options.pages.split(',').map(p => p.trim());
  const outputDir = path.join(process.cwd(), config.outputDir);
  
  // Create output directory
  await fs.ensureDir(outputDir);
  console.log(`📁 Output directory: ${outputDir}\n`);

  // Base URL - use static folder for local testing or remote URL
  let baseUrl;
  if (fs.existsSync(path.join(process.cwd(), 'build'))) {
    console.log('🏗️  Found build folder, serving locally...');
    const { spawn } = require('child_process');
    const server = spawn('npx', ['http-server', 'build', '-p', '3000', '-s'], { 
      stdio: 'pipe',
      detached: true
    });
    server.unref(); // Detach from parent process
    
    baseUrl = 'http://localhost:3000';
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
  } else {
    baseUrl = 'http://localhost:3000';
    console.log('⚠️  No build folder found. Make sure site is running at localhost:3000');
    console.log('   Run: npm run serve in the site directory\n');
  }

  // Launch browser with puppeteer-core (no bundled Chrome)
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    for (const pageName of pages) {
      await capturePage(browser, pageName, baseUrl, outputDir);
    }

    // Generate JSDoc index
    await generateJSDocIndex(pages, outputDir);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }

  console.log('\n✅ Screenshot capture complete!');
}

async function capturePage(browser, pageName, baseUrl, outputDir) {
  const pagePath = pageName === '' ? '' : `/${pageName}`;
  const url = `${baseUrl}${pagePath}`;
  
  // Wait between pages
  if (pages.indexOf(pageName) > 0) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`📸 Capturing: ${pageName} (${url})`);

  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewport({
    width: config.viewportWidth,
    height: config.viewportHeight,
  });

  try {
    // Navigate to page and wait for load
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    const filename = pageName === '' ? 'index' : pageName;
    
    // Light mode screenshot
    const lightPath = path.join(outputDir, `${filename}-light.png`);
    await page.screenshot({ 
      path: lightPath,
      fullPage: true 
    });
    console.log(`   ✅ Saved (light): ${path.basename(lightPath)}`);

    // Dark mode screenshot  
    if (config.captureDarkMode) {
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
      });
      
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for theme switch
      
      const darkPath = path.join(outputDir, `${filename}-dark.png`);
      await page.screenshot({ 
        path: darkPath,
        fullPage: true 
      });
      console.log(`   ✅ Saved (dark): ${path.basename(darkPath)}`);
    }

  } catch (error) {
    console.error(`   ⚠️  Failed to capture ${pageName}:`, error.message);
  } finally {
    await page.close();
  }
}

async function generateJSDocIndex(pages, outputDir) {
  const date = new Date().toISOString().split('T')[0];
  
  let table = '## Pages Captured\n\n| Page | Light Mode | Dark Mode |\n';
  table += '|------|-----------|----------|\n';
  
  pages.forEach(page => {
    const filename = page === '' ? 'index' : page;
    const displayName = page === '' ? 'home' : page;
    const lightLink = `[${filename}-light.png](./screenshot-reviews/${filename}-light.png)`;
    const darkLink = config.captureDarkMode 
      ? `[${filename}-dark.png](./screenshot-reviews/${filename}-dark.png)`
      : 'N/A';
    table += `| ${displayName} | ${lightLink} | ${darkLink} |\n`;
  });

  await fs.writeFile(path.join(outputDir, 'README.md'), table, 'utf-8');
  console.log('📝 Generated README with page index');
}

main();
