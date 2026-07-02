#!/bin/bash
# Fetch screenshot using curl from an external API

OUTPUT_DIR="/home/node/.openclaw/workspace/static/screenshot-reviews"
mkdir -p "$OUTPUT_DIR"

echo "🌐 Fetching screenshot from ScreenshotMachine..."
curl -sL \
  --max-time 30 \
  -o "$OUTPUT_DIR/api-screenshot.gif" \
  "https://api.screenshotmachine.com?key=12345&url=https://zachcutler.me/blog/&format=png"

if [ -f "$OUTPUT_DIR/api-screenshot.gif" ]; then
    FILE_SIZE=$(stat -c%s "$OUTPUT_DIR/api-screenshot.gif")
    echo "✅ Fetched screenshot (${FILE_SIZE} bytes)"
    
    # Check if it's actually a valid image or just an error page
    head -c 10 "$OUTPUT_DIR/api-screenshot.gif" | od -A x -t x1z
else
    echo "❌ Failed to fetch screenshot"
fi
