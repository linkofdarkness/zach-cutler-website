#!/bin/bash
cd /home/node/.openclaw/workspace/repos/zach-cutler-website

# Use npx to ensure we have the right version
npx puppeteer --version

node -e "
const puppeteer = require('puppeteer');

async function capture() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  
  console.log('Loading https://zachcutler.me/blog/ ...');
  await page.goto('https://zachcutler.me/blog/', { waitUntil: 'networkidle0' });
  
  await page.screenshot({
    path: '/home/node/.openclaw/workspace/static/screenshot-reviews/blog-puppeteer.png',
    fullPage: true,
    type: 'png'
  });
  
  console.log('Screenshot saved!');
  await browser.close();
}

capture().catch(console.error);
"
