// Use puppeteer-core with direct Chrome connection
const http = require('http');
const { Writable } = require('stream');

async function run() {
  const chromePath = '/home/node/.cache/puppeteer/chrome/linux-148.0.7778.97/chrome-linux64/chrome';
  
  console.log('🔍 Chrome path:', chromePath);
  
  // Try to load puppeteer-core from npx cache
  const paths = [
    '/root/.npm/_npx/123/lib/node_modules/puppeteer-core',
    '/home/node/.npm/_npx/123/lib/node_modules/puppeteer-core',
    process.cwd() + '/node_modules/puppeteer'
  ];
  
  let puppeteerCore;
  for (const p of paths) {
    try {
      if (require.resolve(p)) {
        console.log('✅ Found at:', p);
        puppeteerCore = require(p);
        break;
      }
    } catch(e) {}
  }
  
  if (!puppeteerCore) {
    console.log('❌ puppeteer-core not found in standard paths');
    return;
  }
  
  const browser = await puppeteerCore.launch({
    headless: 'new',
    executablePath: chromePath,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  console.log('🌐 Loading blog...');
  await page.goto('https://zachcutler.me/blog/', { waitUntil: 'networkidle0' });

  const output = '/home/node/.openclaw/workspace/static/screenshot-reviews/chrome-direct-blog.png';
  
  console.log('📸 Capturing to:', output);
  await page.screenshot({ path: output, fullPage: true });

  console.log('✅ Saved!');
  await browser.close();
}

run().catch(console.error);
