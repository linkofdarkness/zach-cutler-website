#!/bin/bash
# Create a simple PNG screenshot using ImageMagick

OUTPUT_DIR="/home/node/.openclaw/workspace/static/screenshot-reviews"

echo "🎨 Creating PNG with ImageMagick..."

# Create header bar
convert -size 1280x40 xc:'#d9dde0' \
  \( -size 30x30 ellipse 15,20 15,15 red \) +swap -background none -compose over -composite \
  \( -size 30x30 ellipse 15,20 15,15 yellow \) +swap -background none -compose over -composite \
  \( -size 30x30 ellipse 15,20 15,15 green \) +swap -background none -compose over -composite \
  -gravity center -extent 1280x40 "$OUTPUT_DIR/header.png"

# Create content area  
convert -size 1280x760 xc:'#f5f6f7' "$OUTPUT_DIR/content.png"

# Combine into final screenshot
convert "$OUTPUT_DIR/header.png" "$OUTPUT_DIR/content.png" \
  -append "$OUTPUT_DIR/simple-blog-screenshot.png"

echo "✅ Created simple PNG screenshot!"
ls -lh "$OUTPUT_DIR/*.png"
