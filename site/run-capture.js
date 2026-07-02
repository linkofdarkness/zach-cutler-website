const { spawn } = require('child_process');
const fs = require('fs');

const captureScript = `
const puppeteer = require('puppeteer');
const fs = require('fs');

async function main() {
  const pages = [
    { name: 'index', url: 'https://zachcutler.me/' },
    { name: 'about', url: 'https://zachcutler.me/about/' },
    { name: 'blog', url: 'https://zachcutler.me/blog/' }
  ];

  console.log('🚀 Launching browser...');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const page of pages) {
    console.log('\\n📸 Capturing: ' + page.url);
    
    const p = await browser.newPage();
    await p.setViewport({ width: 1200, height: 800 });
    await p.goto(page.url, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Light mode screenshot
    await p.screenshot({ 
      path: '/home/node/.openclaw/workspace/static/screenshot-reviews/' + page.name + '-light.png',
      fullPage: true 
    });
    console.log('   ✅ Saved (light): ' + page.name + '-light.png');

    // Dark mode screenshot  
    try {
      await p.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
      await new Promise(r => setTimeout(r, 500));
      
      await p.screenshot({ 
        path: '/home/node/.openclaw/workspace/static/screenshot-reviews/' + page.name + '-dark.png',
        fullPage: true 
      });
      console.log('   ✅ Saved (dark): ' + page.name + '-dark.png');
    } catch(e) {
      console.log('   ⚠️  Dark mode N/A for this site');
    }
    
    await p.close();
  }

  await browser.close();
  
  // Generate README
  const date = new Date().toISOString();
  let table = '| Page | Light Mode | Dark Mode |\n|------|-----------|----------|\n';
  pages.forEach(p => {
    table += '|' + p.name + ' | [' + p.name + '-light.png](./screenshot-reviews/' + p.name + '-light.png) | [' + p.name + '-dark.png](./screenshot-reviews/' + p.name + '-dark.png) |\n';
  });

  fs.writeFileSync('/home/node/.openclaw/workspace/static/screenshot-reviews/README.md', 
    '# PNG Screenshots\n\n**Generated:** ' + date + '\n\n## Pages Captured\n\n' + table);
  
  console.log('\n📝 Generated README index');
  console.log('\n✅ Screenshot capture complete!');
}

main().catch(console.error);
`;

fs.writeFileSync('/tmp/capture.js', captureScript);

console.log('🚀 Running puppeteer via npx...');
const child = spawn('npx', ['--yes', 'puppeteer', '/tmp/capture.js'], {
  stdio: 'inherit'
});

child.on('close', (code) => {
  if (code !== 0) {
    console.error('\n❌ Failed with code:', code);
    process.exit(1);
  }
});
