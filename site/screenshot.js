const puppeteer = require('puppeteer');

async function main() {
  const pages = [
    { name: 'index', url: 'https://zachcutler.me/' },
    { name: 'about', url: 'https://zachcutler.me/about/' },
    { name: 'blog', url: 'https://zachcutler.me/blog/' }
  ];

  console.log('🚀 Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });

  for (const page of pages) {
    console.log(`\n📸 Capturing: ${page.url}`);
    
    const p = await browser.newPage();
    await p.setViewport({ width: 1200, height: 800 });
    await p.goto(page.url, { waitUntil: 'networkidle0' });
    
    // Light mode
    await p.screenshot({ path: `/home/node/.openclaw/workspace/static/screenshot-reviews/${page.name}-light.png`, fullPage: true });
    console.log(`   ✅ Saved (light): ${page.name}-light.png`);

    // Dark mode
    try {
      await p.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
      await new Promise(r => setTimeout(r, 500));
      await p.screenshot({ path: `/home/node/.openclaw/workspace/static/screenshot-reviews/${page.name}-dark.png`, fullPage: true });
      console.log(`   ✅ Saved (dark): ${page.name}-dark.png`);
    } catch(e) {
      console.log('   ⚠️  Dark mode N/A');
    }
    
    await p.close();
  }

  await browser.close();
  console.log('\n✅ Screenshot capture complete!');
}

main().catch(console.error);
