#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Config  
const config = {
  outputDir: 'static/screenshot-reviews',
  viewportWidth: 1200,
  viewportHeight: 800,
  captureDarkMode: true,
  defaultPages: ['', 'about', 'blog'],
};

// Parse args manually
let pagesArg = config.defaultPages.join(',');
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--pages' && process.argv[i + 1]) pagesArg = process.argv[++i];
}
if (process.argv.includes('--no-dark')) config.captureDarkMode = false;

async function main() {
  console.log('📸 PNG Screenshot Capture (Puppeteer)');
  console.log('======================================\n');

  const pages = pagesArg.split(',').map(p => p.trim());
  const outputDir = path.join(process.cwd(), config.outputDir);
  
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`📁 Output: ${outputDir}\n`);

  // Use puppeteer via npx - will download if needed
  const { exec } = require('child_process');
  const util = require('util');
  const execFile = util.promisify(exec);

  try {
    console.log('🚀 Installing/verifying Puppeteer...');
    await execFile('npx', ['puppeteer', 'install'], { cwd: path.join(process.cwd(), 'site') });
    
    // Now load puppeteer-core from the installed location
    const sitePath = path.join(process.cwd(), 'site');
    const puppeteer = require(`${sitePath}/node_modules/puppeteer`);

    console.log('🌐 Launching headless browser...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      for (const pageName of pages) {
        const pagePath = pageName === '' ? '' : `/${pageName}`;
        const url = `https://zachcutler.me${pagePath}`;
        
        console.log(`\n📸 Capturing: ${url}`);

        const page = await browser.newPage();
        await page.setViewport({ width: config.viewportWidth, height: config.viewportHeight });

        try {
          await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

          const filename = pageName === '' ? 'index' : pageName;

          // Light mode screenshot
          const lightPath = path.join(outputDir, `${filename}-light.png`);
          await page.screenshot({ path: lightPath, fullPage: true });
          console.log(`   ✅ Saved (light): ${path.basename(lightPath)}`);

          // Dark mode screenshot  
          if (config.captureDarkMode) {
            try {
              await page.evaluate(() => {
                document.documentElement.setAttribute('data-theme', 'dark');
              });
              await new Promise(r => setTimeout(r, 500));
              
              const darkPath = path.join(outputDir, `${filename}-dark.png`);
              await page.screenshot({ path: darkPath, fullPage: true });
              console.log(`   ✅ Saved (dark): ${path.basename(darkPath)}`);
            } catch (e) {
              console.log(`   ⚠️  Dark mode not available for this site`);
            }
          }

        } catch (error) {
          console.error(`   ❌ Failed: ${error.message}`);
        } finally {
          await page.close();
        }
      }

      // Generate README
      const date = new Date().toISOString();
      let table = '| Page | Light Mode | Dark Mode |\n|------|-----------|----------|\n';
      pages.forEach(page => {
        const filename = page === '' ? 'index' : page;
        const displayName = page === '' ? 'home' : page;
        const lightLink = `[${filename}-light.png](./screenshot-reviews/${filename}-light.png)`;
        const darkLink = config.captureDarkMode 
          ? `[${filename}-dark.png](./screenshot-reviews/${filename}-dark.png)`
          : 'N/A';
        table += `| ${displayName} | ${lightLink} | ${darkLink} |\n`;
      });

      fs.writeFileSync(path.join(outputDir, 'README.md'), 
        `# PNG Screenshots\n\n**Generated:** ${date}\n\n## Pages Captured\n\n${table}`, 'utf-8');
      
      console.log('📝 Generated README index');

    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    } finally {
      await browser.close();
    }

  } catch (e) {
    console.error('❌ Puppeteer installation failed:', e.message);
    process.exit(1);
  }

  console.log('\n✅ Screenshot capture complete!');
}

main();
