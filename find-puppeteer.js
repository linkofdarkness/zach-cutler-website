const path = require('path');
const fs = require('fs');

console.log('🔍 Searching for Puppeteer...\n');

// Search paths
const searchPaths = [
  process.cwd(),
  '/home/node/.openclaw/workspace/repos/zach-cutler-website',
  '/home/node/.openclaw/workspace',
  '/home/node/.npm-global/lib/node_modules',
  '/usr/local/lib/node_modules'
];

for (const basePath of searchPaths) {
  console.log(`Checking ${basePath}:`);
  
  const puppeteerPath = path.join(basePath, 'node_modules/puppeteer');
  if (fs.existsSync(puppeteerPath)) {
    console.log('  ✅ Found Puppeteer!');
    
    // Try to load it
    try {
      const puppeteer = require(puppeteerPath);
      console.log('  ✅ Successfully loaded!');
      
      // Launch browser
      (async () => {
        const browser = await puppeteer.launch({
          headless: 'new',
          args: ['--no-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        
        console.log('🌐 Loading blog...');
        await page.goto('https://zachcutler.me/blog/', { waitUntil: 'networkidle0' });
        
        console.log('📸 Capturing screenshot...');
        await page.screenshot({
          path: '/home/node/.openclaw/workspace/static/screenshot-reviews/found-puppeteer-blog.png',
          fullPage: true,
          type: 'png'
        });
        
        console.log('✅ SUCCESS! Screenshot saved!');
        await browser.close();
      })();
      
    } catch (err) {
      console.log('  ❌ Load failed:', err.message);
    }
  } else {
    console.log('  ❌ Not found');
  }
}

console.log('\n🔍 Done searching!');
