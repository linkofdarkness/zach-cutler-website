const puppeteer = require('/home/node/.npm/_npx/1ade4bf2e2bf80fd/node_modules/puppeteer');

(async () => {
  const chromePath = '/usr/bin/google-chrome';
  
  try {
    console.log('🚀 Launching with system Chrome:', chromePath);
    
    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: chromePath,
      args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    console.log('🌐 Loading blog...');
    await page.goto('https://zachcutler.me/blog/', { waitUntil: 'networkidle0' });

    const output = '/home/node/.openclaw/workspace/static/screenshot-reviews/system-chrome-blog.png';
    
    console.log('📸 Capturing to:', output);
    await page.screenshot({ path: output, fullPage: true });

    console.log('✅ SUCCESS!');
    await browser.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
