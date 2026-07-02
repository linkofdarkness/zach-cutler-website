const puppeteer = require('puppeteer-core');
const ChromeLauncher = require('chrome-launcher');

(async () => {
  console.log('🚀 Starting Chrome...');
  
  const chrome = await ChromeLauncher.launch({
    flags: ['--no-sandbox']
  });
  
  console.log('🔗 Connecting to Chrome at:', chrome.port);
  
  const browser = await puppeteer.connect({
    browserWSEndpoint: `ws://localhost:${chrome.port}/devtools/browser`,
    headless: true
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  console.log('🌐 Loading blog...');
  await page.goto('https://zachcutler.me/blog/', { waitUntil: 'networkidle0' });

  console.log('📸 Capturing screenshot...');
  await page.screenshot({
    path: '/home/node/.openclaw/workspace/static/screenshot-reviews/chrome-blog.png',
    fullPage: true,
    type: 'png'
  });

  console.log('✅ Screenshot saved!');
  
  await chrome.kill();
})();
