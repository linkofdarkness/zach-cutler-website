#!/bin/bash

# Capture screenshots of documentation pages for review
# Usage: ./scripts/capture-docs-screenshots.sh [--pages home,about,blog] [--no-dark]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SITE_DIR="$SCRIPT_DIR/../site"

cd "$SITE_DIR"

# Parse arguments
PAGES="home,about,blog"
DARK_MODE="--dark"

while [[ $# -gt 0 ]]; do
  case $1 in
    --pages)
      PAGES="$2"
      shift 2
      ;;
    --no-dark)
      DARK_MODE=""
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo "📸 Capturing screenshots for pages: $PAGES"
echo "   Dark mode: $(if [ -z "$DARK_MODE" ]; then echo "Disabled"; else echo "Enabled"; fi)"

# Run the capture script with arguments
npm run capture-screenshots -- --pages "$PAGES" $DARK_MODE
