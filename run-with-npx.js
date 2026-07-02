#!/usr/bin/env node
// Run with: npx --prefix . -e "require('puppeteer')"

const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Launching Puppeteer...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  console.log('🌐 Loading blog...');
  await page.goto('https://zachcutler.me/blog/', { waitUntil: 'networkidle0' });

  const output = '/home/node/.openclaw/workspace/static/screenshot-reviews/puppeteer-blog.png';
  
  console.log('📸 Capturing screenshot to:', output);
  await page.screenshot({ path: output, fullPage: true });

  console.log('✅ SUCCESS! Screenshot saved!');
  await browser.close();
})();
