# devtools-api

**Zero-dependency developer utility API server.** 15 endpoints, no external dependencies, runs on any Node.js host.

## Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Health check |
| `/uuid?count=N` | GET | Generate UUID(s) |
| `/color/hex-to-rgb?hex=fff` | GET | Hex → RGB + HSL |
| `/color/rgb-to-hex?r=0&g=166&b=255` | GET | RGB → Hex + HSL |
| `/color/rgb-to-hsl?r=0&g=166&b=255` | GET | RGB → HSL |
| `/color/hsl-to-rgb?h=212&s=100&l=67` | GET | HSL → RGB + Hex |
| `/country?code=US` | GET | Country info + flag emoji |
| `/country` | GET | All 49 countries |
| `/http-status?code=404` | GET | HTTP status code info |
| `/json/format` | POST | Format/minify JSON |
| `/base64/encode?input=hello` | GET | Base64 encode/decode |
| `/base64/decode?input=aGVsbG8=` | GET | Base64 decode |
| `/random?type=name&count=3` | GET | Random data (name, email, city, uuid, color, etc.) |
| `/password/strength?password=xxx` | GET | Password strength analysis |
| `/ip` | GET | Client IP info |
| `/ua/parse?ua=...` | GET | User-Agent parser |

## Usage

```bash
# Run (default port 3000)
node server.js

# Custom port
node server.js 8080

# With API key authentication
API_KEY=secret123 node server.js
```

## API Key

Set `API_KEY` env var to require authentication. Pass via `?api_key=` or `X-API-Key` header.

## Rate Limiting

100 requests per minute per IP. Returns `429` when exceeded with `Retry-After` header.

## Deployment

### Docker
```bash
docker build -t devtools-api .
docker run -p 3000:3000 devtools-api
```

### PM2
```bash
pm2 start server.js --name devtools-api
```

### Systemd
```ini
[Unit]
Description=DevTools API Server
After=network.target

[Service]
Type=simple
User=node
WorkingDirectory=/opt/devtools-api
ExecStart=/usr/bin/node server.js
Restart=always
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

## Example Requests

```bash
# Generate UUIDs
curl http://localhost:3000/uuid?count=3

# Color conversion
curl "http://localhost:3000/color/hex-to-rgb?hex=58a6ff"

# Country info
curl "http://localhost:3000/country?code=US"

# HTTP status codes
curl "http://localhost:3000/http-status?code=429"

# Password strength
curl "http://localhost:3000/password/strength?password=MyP@ssw0rd!2026"

# Random data
curl "http://localhost:3000/random?type=name&count=5"

# Base64
curl "http://localhost:3000/base64/encode?input=hello"

# User-Agent parsing
curl "http://localhost:3000/ua/parse?ua=Mozilla/5.0+(iPhone;+CPU+iPhone+OS+17_0+like+Mac+OS+X)"
```

## License

MIT
