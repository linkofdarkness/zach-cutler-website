const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  console.log('🚀 Launching Puppeteer...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });

  console.log('📄 Creating page...');
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  console.log('🌐 Navigating to blog...');
  await page.goto('https://zachcutler.me/blog/', { 
    waitUntil: 'networkidle0',
    timeout: 60000
  });

  console.log('📸 Capturing screenshot (full page)...');
  const outputPath = '/home/node/.openclaw/workspace/static/screenshot-reviews/zachcutler-blog.png';
  
  await page.screenshot({
    path: outputPath,
    fullPage: true,
    type: 'png'
  });

  console.log('✅ Screenshot saved to:', outputPath);
  
  // Also capture dark mode
  console.log('🌙 Switching to dark mode...');
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  });

  await new Promise(resolve => setTimeout(resolve, 1500));

  const darkPath = '/home/node/.openclaw/workspace/static/screenshot-reviews/zachcutler-blog-dark.png';
  await page.screenshot({
    path: darkPath,
    fullPage: true,
    type: 'png'
  });

  console.log('✅ Dark mode screenshot saved to:', darkPath);

  await browser.close();
  console.log('🎉 All done!');
})();
