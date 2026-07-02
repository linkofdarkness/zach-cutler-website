#!/usr/bin/env node

/**
 * Capture HTML previews without browser dependencies
 * Uses simple parsing to generate styled preview pages
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Config
const config = {
  outputDir: 'static/screenshot-reviews',
  defaultPages: ['', 'about', 'blog'],
};

// Parse args manually
let pagesArg = config.defaultPages.join(',');
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--pages' && process.argv[i + 1]) {
    pagesArg = process.argv[++i];
  }
}

async function main() {
  console.log('📸 HTML Preview Capture (No Browser Required)');
  console.log('===============================================\n');

  const pages = pagesArg.split(',').map(p => p.trim());
  const outputDir = path.join(process.cwd(), config.outputDir);
  
  try {
    fs.mkdirSync(outputDir, { recursive: true });
  } catch (e) {}
  
  console.log(`📁 Output: ${outputDir}\n`);

  const baseUrl = 'https://zachcutler.me';

  for (const pageName of pages) {
    const pagePath = pageName === '' ? '' : `/${pageName}`;
    const url = `${baseUrl}${pagePath}`;
    
    console.log(`📄 Fetching: ${url}`);
    
    try {
      const html = await fetchHtml(url);
      const previewData = parseAndGeneratePreview(html, pageName, url);
      
      const filename = pageName === '' ? 'index' : pageName;
      const outputPath = path.join(outputDir, `${filename}.html`);
      
      fs.writeFileSync(outputPath, previewData.htmlContent, 'utf-8');
      
      console.log(`   ✅ Saved: ${path.basename(outputPath)}`);
      console.log(`      Title: ${previewData.title}\n`);

    } catch (error) {
      console.error(`   ❌ Failed for ${url}:`, error.message, '\n');
    }
  }

  await generateIndex(pages, outputDir, baseUrl);
  
  console.log('✅ Capture complete!');
}

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseAndGeneratePreview(html, pageName, url) {
  const filename = pageName === '' ? 'index' : pageName;
  
  let title = '';
  const sections = [];
  
  try {
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch) title = titleMatch[1].trim();
    
    const h2Matches = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)];
    const pMatches = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gi)];
    
    if (h2Matches.length > 0) {
      sections.push({ type: 'section', content: h2Matches[0][1].trim() });
    }
    
    if (pMatches.length > 0) {
      const cleanText = pMatches[0][1].replace(/<[^>]+>/g, '').trim();
      if (cleanText && cleanText.length < 200) {
        sections.push({ type: 'intro', content: cleanText });
      }
    }

  } catch (e) {}

  const htmlContent = generatePreviewHtml(filename, title || pageName || 'Page', sections, url);
  
  return { filename, title: title || pageName || 'Page', sections, htmlContent };
}

function generatePreviewHtml(title, pageTitle, sections, url) {
  const sectionHtml = sections.map(s => {
    if (s.type === 'section') return `<h3>📌 ${escapeHtml(s.content)}</h3>`;
    if (s.type === 'intro') return `<p class="preview-intro">${escapeHtml(s.content)}</p>`;
    return '';
  }).join('\n');

  const timestamp = new Date().toLocaleString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle} - Preview</title>
  <style>
    body { font-family: system-ui, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; margin: 0; padding: 20px; }
    .preview-container { max-width: 900px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden; }
    .preview-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px 32px; font-size: 28px; font-weight: bold; }
    .preview-info { background: #f5f5f5; padding: 16px 32px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; }
    .preview-info span { font-size: 14px; color: #666; }
    .preview-info a { color: #667eea; text-decoration: none; font-weight: 500; }
    .preview-content { padding: 32px; }
    h3 { color: #333; margin-top: 24px; font-size: 18px; }
    p.preview-intro { line-height: 1.6; color: #555; max-width: 700px; }
    .preview-badge { display: inline-block; background: #e8f5e9; color: #2e7d32; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .preview-footer { background: #f5f5f5; padding: 16px 32px; text-align: center; border-top: 1px solid #ddd; }
    .capture-status { color: #4caf50; font-weight: bold; margin-left: 8px; }
  </style>
</head>
<body>
  <div class="preview-container">
    <div class="preview-header">🖼️ ${escapeHtml(pageTitle)} - Preview</div>
    <div class="preview-info">
      <span><strong>Captured:</strong> ${timestamp}</span>
      <a href="${url}" target="_blank">🔗 View Live Site →</a>
      <span class="capture-status">✅ HTML Capture Complete</span>
    </div>
    <div class="preview-content">${sectionHtml}${sections.length === 0 ? '<p style="color:#666;">Content preview extracted from page.</p>' : ''}</div>
    <div class="preview-footer"><span class="preview-badge">No Browser Required</span><span style="margin-left:12px;color:#999;font-size:14px;">Captured via HTML parsing</span></div>
  </div>
</body>
</html>`;
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function generateIndex(pages, outputDir, baseUrl) {
  const date = new Date().toISOString();
  
  let table = '| Page | URL | Captured |\n|------|-----|----------|\n';
  pages.forEach(page => {
    const displayName = page === '' ? 'home' : page;
    const pagePath = page === '' ? '' : `/${page}`;
    table += `| ${displayName} | [${baseUrl}${pagePath}](${baseUrl}${pagePath}) | ${date} |\n`;
  });

  fs.writeFileSync(path.join(outputDir, 'README.md'), `# Screenshot Previews\n\n**Generated:** ${date}\n\n## Pages Captured\n\n${table}`, 'utf-8');
  console.log('📝 Generated README index');
}

main();
