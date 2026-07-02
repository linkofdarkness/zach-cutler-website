const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

async function generateScreenshot(url, outputPath) {
    console.log(`📸 Generating screenshot for: ${url}`);
    
    try {
        // Fetch and parse the HTML
        const dom = await JSDOM.fromURL(url, {
            resources: "usable",
            runScripts: "dangerously",
            pretendToBeVisual: true
        });
        
        const { window } = dom;
        const { document } = window;
        
        // Create a simple visual representation
        const title = document.title || 'Untitled';
        const bodyText = document.body.textContent || '';
        const wordCount = bodyText.trim().split(/\s+/).length;
        const linkCount = document.querySelectorAll('a').length;
        const headingCount = document.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
        
        // Create a simple ASCII art representation
        const screenshotText = `
╔══════════════════════════════════════════════════════════╗
║                       PAGE SCREENSHOT                   ║
╠══════════════════════════════════════════════════════════╣
║ URL: ${url.substring(0, 50)}${url.length > 50 ? '...' : ''} ║
║ Title: ${title.substring(0, 40)}${title.length > 40 ? '...' : ''} ║
║                                                          ║
║ 📝 Word Count: ${wordCount.toString().padEnd(8)}                     ║
║ 🔗 Links: ${linkCount.toString().padEnd(10)}                      ║
║ 🎯 Headings: ${headingCount.toString().padEnd(8)}                   ║
║                                                          ║
║ Content Preview:                                         ║
║ ${bodyText.substring(0, 200).replace(/\n/g, ' ').padEnd(50)}... ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
        `;
        
        // Write to file
        fs.writeFileSync(outputPath, screenshotText);
        console.log(`✅ Saved text screenshot: ${outputPath}`);
        
        return {
            title,
            wordCount,
            linkCount,
            headingCount,
            preview: bodyText.substring(0, 200).replace(/\n/g, ' ')
        };
        
    } catch (error) {
        console.error(`❌ Error generating screenshot: ${error.message}`);
        
        // Create error screenshot
        const errorText = `
╔══════════════════════════════════════════════════════════╗
║                    ERROR SCREENSHOT                     ║
╠══════════════════════════════════════════════════════════╣
║ URL: ${url}                                              ║
║                                                          ║
║ ❌ Error: ${error.message.substring(0, 50)}${error.message.length > 50 ? '...' : ''} ║
║                                                          ║
║ Unable to generate visual screenshot.                     ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
        `;
        
        fs.writeFileSync(outputPath, errorText);
        console.log(`⚠️  Saved error screenshot: ${outputPath}`);
        
        return { error: error.message };
    }
}

async function main() {
    const pages = [
        { name: 'index', url: 'https://zachcutler.me/' },
        { name: 'about', url: 'https://zachcutler.me/about/' },
        { name: 'blog', url: 'https://zachcutler.me/blog/' }
    ];
    
    console.log('🚀 Starting jsdom screenshot generation...\n');
    
    const results = [];
    
    for (const page of pages) {
        const outputPath = `/home/node/.openclaw/workspace/static/screenshot-reviews/${page.name}.txt`;
        const result = await generateScreenshot(page.url, outputPath);
        results.push({ ...page, ...result });
    }
    
    // Generate summary
    console.log('\n📊 Screenshot Generation Summary:');
    console.log('═'.repeat(50));
    results.forEach((result, index) => {
        if (result.error) {
            console.log(`${index + 1}. ${result.name}: ❌ ${result.error}`);
        } else {
            console.log(`${index + 1}. ${result.name}: ${result.title}`);
            console.log(`   📝 ${result.wordCount} words, 🔗 ${result.linkCount} links, 🎯 ${result.headingCount} headings`);
        }
    });
    
    console.log('\n✅ All screenshots completed!');
}

main().catch(console.error);