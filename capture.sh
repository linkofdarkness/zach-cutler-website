#!/bin/bash
# Capture blog screenshot using puppeteer via npx
# Usage: ./capture.sh [output_dir] [url]
# Defaults: output_dir=./site/static/screenshot-reviews/, url=https://zachcutler.me/blog/

set -e

OUTPUT_DIR="${1:-site/static/screenshot-reviews}"
URL="${2:-https://zachcutler.me/blog/}"
mkdir -p "$OUTPUT_DIR"

echo "🚀 Capturing screenshot from: $URL"
echo "📁 Output: $OUTPUT_DIR"

# Use npx to run puppeteer inline
npx --yes puppeteer@24 exec "const puppeteer = require('puppeteer'); (async () => { const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] }); const page = await browser.newPage(); await page.setViewport({ width: 1280, height: 720 }); await page.goto('$URL', { waitUntil: 'networkidle0' }); await page.screenshot({ path: '$OUTPUT_DIR/blog-screenshot.png', fullPage: true }); console.log('✅ Screenshot saved!'); await browser.close(); })()" 2>&1

echo "Done!"
ls -lh "$OUTPUT_DIR/blog-screenshot.png" 2>/dev/null || echo "Screenshot not found"
