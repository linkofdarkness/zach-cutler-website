#!/bin/bash
# Try multiple screenshot APIs

OUTPUT_DIR="/home/node/.openclaw/workspace/static/screenshot-reviews"
mkdir -p "$OUTPUT_DIR"

echo "🌐 Trying ScreenshotAPI.net..."
curl -sL \
  --max-time 30 \
  -o "$OUTPUT_DIR/api-net-screenshot.png" \
  "https://api.screenshotapi.net/v1?key=sk_test_123456789&url=https://zachcutler.me/blog/&width=1280&height=720&format=png"

FILE_SIZE=$(stat -c%s "$OUTPUT_DIR/api-net-screenshot.png")
echo "✅ Fetched (${FILE_SIZE} bytes)"

# Check if it's a valid PNG
head -c 4 "$OUTPUT_DIR/api-net-screenshot.png" | od -A x -t x1z
echo ""
