#!/bin/bash
# Capture blog screenshot using puppeteer via npx

set -e

echo "🚀 Capturing blog screenshot..."

# Use npx to run puppeteer inline
npx --yes puppeteer@24 exec 'const puppeteer = require("puppeteer"); (async () => { const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] }); const page = await browser.newPage(); await page.setViewport({ width: 1280, height: 720 }); await page.goto("https://zachcutler.me/blog/", { waitUntil: "networkidle0" }); await page.screenshot({ path: "/home/node/.openclaw/workspace/static/screenshot-reviews/npx-blog-screenshot.png", fullPage: true }); console.log("✅ Screenshot saved!"); await browser.close(); })()' 2>&1

echo "Done!"
ls -lh /home/node/.openclaw/workspace/static/screenshot-reviews/npx-blog-screenshot.png 2>/dev/null || echo "Screenshot not found"
