#!/bin/bash
# Generate PNG screenshots of your blog page
# Run this on your local machine where browsers are available

set -e

echo "🚀 Generating PNG screenshots..."
cd "$(dirname "$0")"

# Create output directory
mkdir -p static/screenshot-reviews

# Install puppeteer if needed (skip if already installed)
if [ ! -d "node_modules/puppeteer" ]; then
    echo "📦 Installing Puppeteer..."
    npm install puppeteer --save-dev
fi

# Run the capture script
echo "📸 Capturing screenshots..."
node << 'EOF'
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  // Light mode
  console.log('🌞 Capturing light mode...');
  await page.goto('https://zachcutler.me/blog/', { waitUntil: 'networkidle0' });
  await page.screenshot({
    path: 'static/screenshot-reviews/zachcutler-blog.png',
    fullPage: true,
    type: 'png'
  });

  // Dark mode
  console.log('🌙 Capturing dark mode...');
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  });
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({
    path: 'static/screenshot-reviews/zachcutler-blog-dark.png',
    fullPage: true,
    type: 'png'
  });

  console.log('✅ Done! Check static/screenshot-reviews/');
  await browser.close();
})();
EOF

echo "✨ PNG screenshots generated!"
ls -lh static/screenshot-reviews/*.png 2>/dev/null || echo "No PNGs found"
