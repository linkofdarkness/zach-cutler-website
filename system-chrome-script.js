const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Launching Puppeteer with existing Chrome...');

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/usr/bin/google-chrome',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  console.log('🌐 Loading blog...');
  await page.goto('https://zachcutler.me/blog/', { waitUntil: 'networkidle0' });

  console.log('📸 Capturing screenshot...');
  await page.screenshot({
    path: '/home/node/.openclaw/workspace/static/screenshot-reviews/final-blog-screenshot.png',
    fullPage: true,
    type: 'png'
  });

  console.log('✅ Screenshot saved!');
  
  await browser.close();
})();
