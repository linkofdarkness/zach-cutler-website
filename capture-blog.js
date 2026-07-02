const { JSDOM } = require('jsdom');
const fs = require('fs');

async function generateScreenshot(url, outputPath) {
    console.log(`📸 Generating screenshot for: ${url}`);
    
    try {
        const dom = await JSDOM.fromURL(url, {
            resources: "usable",
            runScripts: "dangerously",
            pretendToBeVisual: true
        });
        
        const { window } = dom;
        const { document } = window;
        
        const title = document.title || 'Untitled';
        const bodyText = document.body.textContent || '';
        const wordCount = bodyText.trim().split(/\s+/).length;
        const linkCount = document.querySelectorAll('a').length;
        const headingCount = document.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
        
        // Extract blog posts if available
        const articles = document.querySelectorAll('article, .blog-post');
        const posts = [];
        articles.forEach(article => {
            const heading = article.querySelector('h1, h2, a');
            const link = article.querySelector('a')?.href;
            if (heading) {
                posts.push({ title: heading.textContent.trim(), url: link });
            }
        });
        
        const screenshotText = `
╔══════════════════════════════════════════════════════════╗
║                       PAGE SCREENSHOT                   ║
╠══════════════════════════════════════════════════════════╣
║ URL: ${url}                                             ║
║ Title: ${title.substring(0, 50)}${title.length > 50 ? '...' : ''}           ║
║                                                          ║
║ 📊 Page Statistics                                       ║
║ 📝 Word Count: ${wordCount.toString().padEnd(8)}                     ║
║ 🔗 Links Found: ${linkCount.toString().padEnd(10)}                      ║
║ 🎯 Headings: ${headingCount.toString().padEnd(8)}                   ║
║ 📰 Blog Posts Detected: ${posts.length.toString().padEnd(6)}                    ║
║                                                          ║
║ 📝 Content Preview:                                      ║
║ ${bodyText.substring(0, 300).replace(/\n/g, ' ').padEnd(50)}...       ║
║                                                          ║
${posts.length > 0 ? `   Recent Blog Posts:${'\n'.padStart(posts.slice(0, 5).map(p => `     • ${p.title.substring(0, 40)}`).join('\n'))}
` : ''}╚══════════════════════════════════════════════════════════╝
        `;
        
        fs.writeFileSync(outputPath, screenshotText);
        console.log(`✅ Saved screenshot: ${outputPath}`);
        
    } catch (error) {
        const errorText = `
╔══════════════════════════════════════════════════════════╗
║                    ERROR SCREENSHOT                     ║
╠══════════════════════════════════════════════════════════╣
║ URL: ${url}                                              ║
║                                                          ║
║ ❌ Error: ${error.message.substring(0, 60)}${error.message.length > 60 ? '...' : ''}              ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
        `;
        
        fs.writeFileSync(outputPath, errorText);
    }
}

generateScreenshot('https://zachcutler.me/blog/', '/home/node/.openclaw/workspace/static/screenshot-reviews/blog-capture.txt');