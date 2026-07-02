const puppeteer = require('puppeteer');

(async () => {
  const chromePath = '/home/node/.cache/puppeteer/chrome/linux-148.0.7778.97/chrome-linux64/chrome';
  
  console.log('🚀 Launching Puppeteer with cached Chrome...');
  console.log('Chrome path:', chromePath);

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: chromePath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  console.log('🌐 Loading blog...');
  try {
    await page.goto('https://zachcutler.me/blog/', { 
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    console.log('📸 Capturing screenshot (full page)...');
    await page.screenshot({
      path: '/home/node/.openclaw/workspace/static/screenshot-reviews/final-blog-screenshot.png',
      fullPage: true,
      type: 'png'
    });

    console.log('✅ Screenshot saved successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  await browser.close();
})();
