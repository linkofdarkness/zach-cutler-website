const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  
  console.log('Loading blog...');
  await page.goto('https://zachcutler.me/blog/', { waitUntil: 'networkidle0' });
  
  await page.screenshot({
    path: '/home/node/.openclaw/workspace/static/screenshot-reviews/puppeteer-blog.png',
    fullPage: true,
    type: 'png'
  });
  
  console.log('✅ Screenshot saved!');
  await browser.close();
})();
