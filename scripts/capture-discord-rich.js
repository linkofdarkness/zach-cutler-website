#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

const config = { outputDir: 'static/screenshot-reviews', defaultPages: ['', 'about', 'blog'] };

let pagesArg = config.defaultPages.join(',');
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--pages' && process.argv[i + 1]) pagesArg = process.argv[++i];
}

async function main() {
  console.log('📸 Discord Rich Message Capture\n');
  
  const pages = pagesArg.split(',').map(p => p.trim());
  const outputDir = path.join(process.cwd(), config.outputDir);
  const embeds = [];
  
  try { fs.mkdirSync(outputDir, { recursive: true }); } catch (e) {}
  
  console.log(`📁 Output: ${outputDir}\n`);

  for (const pageName of pages) {
    const pagePath = pageName === '' ? '' : `/${pageName}`;
    
    try {
      let html, finalUrl;
      
      // Try without redirect first
      ({html, url: finalUrl} = await fetchHtmlFollowRedirects(`https://zachcutler.me${pagePath}`));
      
      let title = '';
      const m = html.match(/<title[^>]*>(.*?)<\/title>/i);
      if (m) title = m[1].trim();
      
      const safeTitle = escapeDiscord(title || pageName || 'Page');
      const displayName = pageName === '' ? (title || 'Homepage') : safeTitle;
      
      const embed = {
        title: safeTitle,
        url: finalUrl,
        color: pageName === '' ? 6579837 : 10181036,
        description: `**${pageName || 'index'}** - Screenshot capture`,
        fields: [{ name: displayName, value: '📄 Captured', inline: true }],
        footer: { text: `Captured • ${new Date().toLocaleString()}` },
        timestamp: new Date().toISOString(),
        thumbnail: { url: 'https://zachcutler.me/img/favicon.ico' }
      };
      
      embeds.push(embed);
      
      const filename = pageName === '' ? 'index' : pageName;
      fs.writeFileSync(path.join(outputDir, `${filename}.html`), 
        generateDiscordHtml(filename, displayName, finalUrl), 'utf-8');
      
      console.log(`   ✅ Saved: ${path.basename(filename + '.html')}`);

    } catch (error) {
      console.error(`   ❌ Failed for page ${pageName}:`, error.message, '\n');
    }
  }

  fs.writeFileSync(path.join(outputDir, 'discord-embeds.json'), 
    JSON.stringify({ content: '**Screenshot Captures** 📸\n', embeds }, null, 2), 'utf-8');

  console.log('\n🎨 Discord Embeds saved to:', path.join(outputDir, 'discord-embeds.json'));
  
  const message = formatDiscordMessage(embeds);
  console.log('\n' + '='.repeat(60));
  console.log('DISCORD RICH MESSAGE:');
  console.log('='.repeat(60) + '\n');
  console.log(message);
}

function fetchHtmlFollowRedirects(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirect
        resolve(fetchHtmlFollowRedirects(res.headers.location));
        return;
      }
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ html: data, url: url }));
    }).on('error', reject);
  });
}

function escapeDiscord(text) {
  return text.replace(/_/g, '\\_').replace(/\*/g, '\\*');
}

function generateDiscordHtml(title, pageTitle, url) {
  const bg = pageTitle.toLowerCase().includes('homepage') ? '#5865F2' : '#7289DA';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${pageTitle} - Discord Preview</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #202226; color: white; padding: 40px; min-height: 100vh; }
    .preview-container { max-width: 500px; margin: 0 auto; background: #2f3136; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
    .preview-header { background: ${bg}; padding: 16px 20px; font-size: 18px; font-weight: bold; }
    .preview-section { padding: 20px; border-top: 1px solid #36393f; color: #dcddde; }
    a { color: #00b0f4; text-decoration: none; display: block; padding: 12px 20px; background: #36393f; }
    .preview-footer { background: #292a2d; padding: 12px 20px; font-size: 12px; color: #72767d; border-top: 1px solid #36393f; }
  </style>
</head>
<body>
  <div class="preview-container">
    <div class="preview-header">🖼️ ${pageTitle} - Discord Preview</div>
    <div class="preview-section">Screenshot captured via Discord Rich Message System</div>
    <a href="${url}" target="_blank">🔗 View Live Site →</a>
    <div class="preview-footer">Captured • ${new Date().toLocaleString()}</div>
  </div>
</body>
</html>`;
}

function formatDiscordMessage(embeds) {
  let message = '**📸 Documentation Screenshots**\n\n';
  
  embeds.forEach((embed, i) => {
    const timestamp = new Date(embed.timestamp).toLocaleString();
    
    if (i > 0) message += '\n---\n\n';
    
    message += `**${embed.title}**\n`;
    message += `${embed.description}\n\n`;
    
    embed.fields.forEach(field => {
      message += `• ${field.name}: ${field.value}\n`;
    });
    
    message += `\n🕐 Captured: ${timestamp}\n`;
    message += `🔗 [View Live Site](${embed.url})\n\n`;
  });

  return message;
}

main();
