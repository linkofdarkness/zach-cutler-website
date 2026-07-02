// Use puppeteer directly from npx cache
const puppeteer = require('/home/node/.npm/_npx/1ade4bf2e2bf80fd/node_modules/puppeteer');

(async () => {
  console.log('🚀 Launching Puppeteer from npx cache...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  
  console.log('🌐 Loading blog...');
  await page.goto('https://zachcutler.me/blog/', { waitUntil: 'networkidle0' });
  
  const output = '/home/node/.openclaw/workspace/static/screenshot-reviews/npx-cache-blog.png';
  
  console.log('📸 Capturing to:', output);
  await page.screenshot({ path: output, fullPage: true, type: 'png' });
  
  console.log('✅ SUCCESS! Screenshot saved!');
  await browser.close();
})();
