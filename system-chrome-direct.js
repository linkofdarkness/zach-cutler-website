const puppeteer = require('puppeteer');

(async () => {
  const chromePath = '/home/node/.cache/puppeteer/chrome/linux-148.0.7778.97/chrome-linux64/chrome';
  
  console.log('🚀 Launching with cached Chrome...');
  console.log('Path:', chromePath);

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: chromePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  console.log('🌐 Loading https://zachcutler.me/blog/ ...');
  
  try {
    await page.goto('https://zachcutler.me/blog/', { 
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    console.log('📸 Capturing screenshot...');
    const screenshotPath = '/home/node/.openclaw/workspace/static/screenshot-reviews/system-chrome-blog.png';
    
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
      type: 'png'
    });

    console.log('✅ SUCCESS!');
    console.log('Saved to:', screenshotPath);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
  
  await browser.close();
})();
