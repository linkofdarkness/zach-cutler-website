const { spawn } = require('child_process');
const http = require('http');
const chromePath = '/home/node/.cache/puppeteer/chrome/linux-148.0.7778.97/chrome-linux64/chrome';

console.log('🚀 Starting Chrome manually...');

// Start Chrome with remote-debugging-port
const chromeProcess = spawn(chromePath, [
  '--remote-debugging-port=9222',
  '--no-sandbox'
]);

chromeProcess.stdout.on('data', (data) => {
  console.log(`Chrome stdout: ${data}`);
});

chromeProcess.stderr.on('data', (data) => {
  console.error(`Chrome stderr: ${data}`);
});

// Wait a moment for Chrome to start, then connect via puppeteer-core
setTimeout(async () => {
  const puppeteer = require('/home/node/.npm/_npx/1ade4bf2e2bf80fd/node_modules/puppeteer');
  
  try {
    console.log('🔗 Connecting to Chrome...');
    const browser = await puppeteer.connect({ 
      browserWSEndpoint: 'http://localhost:9222'
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    console.log('🌐 Loading blog...');
    await page.goto('https://zachcutler.me/blog/', { waitUntil: 'networkidle0' });

    const output = '/home/node/.openclaw/workspace/static/screenshot-reviews/spawned-chrome-blog.png';
    
    console.log('📸 Capturing to:', output);
    await page.screenshot({ path: output, fullPage: true });

    console.log('✅ SUCCESS!');
    await browser.close();
    chromeProcess.kill();
  } catch (error) {
    console.error('❌ Error:', error.message);
    chromeProcess.kill();
  }
}, 3000);
