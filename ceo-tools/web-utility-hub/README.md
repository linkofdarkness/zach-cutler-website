# Web Utility Hub

**Beautiful single-page developer utility suite.** 10 tools in one HTML file — zero dependencies, dark mode, works with or without backend API.

## Tools

| # | Tool | Description |
|---|------|-------------|
| 1 | 🔢 UUID Generator | Generate 1-20 UUIDs with one click |
| 2 | 🎨 Color Converter | Convert between Hex, RGB, and HSL with live preview |
| 3 | 🔐 Base64 | Encode/decode text instantly |
| 4 | 📋 JSON Formatter | Format, minify, and validate JSON |
| 5 | 🌍 Country Info | Lookup any country by code + see flag emoji |
| 6 | 📡 HTTP Status Codes | Reference all 22 HTTP status codes |
| 7 | 🔒 Password Strength | Real-time password analysis with visual meter |
| 8 | 🎲 Random Data | Generate names, emails, UUIDs, colors, cities |
| 9 | 🌐 IP Info | Get your current public IP address |
| 10 | 🕵️ UA Parser | Parse any User-Agent string |

## Usage

Simply open `index.html` in any browser. All tools have local fallbacks when the API is unavailable.

```bash
# Open in browser
open index.html

# Or serve locally with any HTTP server
python3 -m http.server 8080
```

## With API Backend

For full functionality, run alongside the [devtools-api](../devtools-api/):

```bash
# Start the API (terminal 1)
cd ../devtools-api
PORT=3000 node server.js

# Open the hub (terminal 2)
open index.html
```

The hub auto-detects the API and shows connection status in the bottom bar.

## Architecture

```
index.html         ← Single HTML file with all tools
                    (CSS inlined, JS inlined, no build step)
```

## Why?

- No npm install, no build tools, no framework
- Works offline with fallback logic
- Dark mode by default (GitHub-inspired theme)
- Copy-to-clipboard on all outputs (when using with HTTP)
- Can be dropped into any static hosting

## License

MIT