const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function captureScreenshot() {
    // Use relative path from repo root
    const outputDir = path.resolve(__dirname, 'site', 'static', 'screenshot-reviews');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('🚀 Launching headless browser...');
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas'
        ]
    });

    console.log('📄 Opening page...');
    const page = await browser.newPage();
    
    // Set viewport for consistent screenshots
    await page.setViewport({ width: 1280, height: 720 });
    
    // Capture light mode first
    console.log('🌞 Capturing light mode...');
    await page.goto('https://zachcutler.me/blog/', { waitUntil: 'networkidle0' });
    await page.screenshot({
        path: `${outputDir}/blog-light-mode.png`,
        fullPage: true,
        type: 'png'
    });

    // Toggle to dark mode and capture dark mode screenshot
    console.log('🌙 Capturing dark mode...');
    await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    });
    
    // Wait for theme transition
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Save dark mode screenshot (was missing!)
    await page.screenshot({
        path: `${outputDir}/blog-dark-mode.png`,
        fullPage: true,
        type: 'png'
    });

    await browser.close();

    console.log('✅ Screenshots saved!');
}

captureScreenshot().catch(console.error);