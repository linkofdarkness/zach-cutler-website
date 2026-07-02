#!/usr/bin/env node
/**
 * devtools-api — Zero-dependency developer utility API server
 * Exposes free APIs for developers: UUID, color conversion, base64,
 * JSON formatting, HTTP status codes, country data, random data, etc.
 *
 * Usage: node server.js [--port 3000]
 * All endpoints return JSON. Rate-limited to 100 req/min per IP.
 */

const http = require('http');
const crypto = require('crypto');
const path = require('path');

// ── Config ────────────────────────────────────────────────────────────
const PORT = parseInt(process.argv[2] || process.env.PORT || 3000, 10);
const HOST = process.env.HOST || '0.0.0.0';
const API_KEY = process.env.API_KEY || ''; // optional: set to require auth

// ── Rate Limiter ──────────────────────────────────────────────────────
const rateLimits = new Map();
const RATE_WINDOW = 60_000; // 1 min
const RATE_MAX = 100;

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimits.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW) {
    rateLimits.set(ip, { start: now, count: 1 });
    return { ok: true, remaining: RATE_MAX - 1 };
  }
  entry.count++;
  if (entry.count > RATE_MAX) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((entry.start + RATE_WINDOW - now) / 1000) };
  }
  return { ok: true, remaining: RATE_MAX - entry.count };
}

// ── Country Data (ISO 3166-1 alpha-2 → emoji flag + info) ─────────────
const COUNTRIES = {
  US: { name: 'United States', flag: '🇺🇸', currency: 'USD', capital: 'Washington, D.C.' },
  GB: { name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', capital: 'London' },
  CA: { name: 'Canada', flag: '🇨🇦', currency: 'CAD', capital: 'Ottawa' },
  DE: { name: 'Germany', flag: '🇩🇪', currency: 'EUR', capital: 'Berlin' },
  FR: { name: 'France', flag: '🇫🇷', currency: 'EUR', capital: 'Paris' },
  JP: { name: 'Japan', flag: '🇯🇵', currency: 'JPY', capital: 'Tokyo' },
  CN: { name: 'China', flag: '🇨🇳', currency: 'CNY', capital: 'Beijing' },
  IN: { name: 'India', flag: '🇮🇳', currency: 'INR', capital: 'New Delhi' },
  AU: { name: 'Australia', flag: '🇦🇺', currency: 'AUD', capital: 'Canberra' },
  BR: { name: 'Brazil', flag: '🇧🇷', currency: 'BRL', capital: 'Brasília' },
  RU: { name: 'Russia', flag: '🇷🇺', currency: 'RUB', capital: 'Moscow' },
  KR: { name: 'South Korea', flag: '🇰🇷', currency: 'KRW', capital: 'Seoul' },
  IT: { name: 'Italy', flag: '🇮🇹', currency: 'EUR', capital: 'Rome' },
  ES: { name: 'Spain', flag: '🇪🇸', currency: 'EUR', capital: 'Madrid' },
  MX: { name: 'Mexico', flag: '🇲🇽', currency: 'MXN', capital: 'Mexico City' },
  ID: { name: 'Indonesia', flag: '🇮🇩', currency: 'IDR', capital: 'Jakarta' },
  TR: { name: 'Turkey', flag: '🇹🇷', currency: 'TRY', capital: 'Ankara' },
  SA: { name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR', capital: 'Riyadh' },
  NL: { name: 'Netherlands', flag: '🇳🇱', currency: 'EUR', capital: 'Amsterdam' },
  SE: { name: 'Sweden', flag: '🇸🇪', currency: 'SEK', capital: 'Stockholm' },
  CH: { name: 'Switzerland', flag: '🇨🇭', currency: 'CHF', capital: 'Bern' },
  PL: { name: 'Poland', flag: '🇵🇱', currency: 'PLN', capital: 'Warsaw' },
  AR: { name: 'Argentina', flag: '🇦🇷', currency: 'ARS', capital: 'Buenos Aires' },
  EG: { name: 'Egypt', flag: '🇪🇬', currency: 'EGP', capital: 'Cairo' },
  ZA: { name: 'South Africa', flag: '🇿🇦', currency: 'ZAR', capital: 'Pretoria' },
  NG: { name: 'Nigeria', flag: '🇳🇬', currency: 'NGN', capital: 'Abuja' },
  TH: { name: 'Thailand', flag: '🇹🇭', currency: 'THB', capital: 'Bangkok' },
  VN: { name: 'Vietnam', flag: '🇻🇳', currency: 'VND', capital: 'Hanoi' },
  PH: { name: 'Philippines', flag: '🇵🇭', currency: 'PHP', capital: 'Manila' },
  MY: { name: 'Malaysia', flag: '🇲🇾', currency: 'MYR', capital: 'Kuala Lumpur' },
  SG: { name: 'Singapore', flag: '🇸🇬', currency: 'SGD', capital: 'Singapore' },
  NZ: { name: 'New Zealand', flag: '🇳🇿', currency: 'NZD', capital: 'Wellington' },
  NO: { name: 'Norway', flag: '🇳🇴', currency: 'NOK', capital: 'Oslo' },
  DK: { name: 'Denmark', flag: '🇩🇰', currency: 'DKK', capital: 'Copenhagen' },
  FI: { name: 'Finland', flag: '🇫🇮', currency: 'EUR', capital: 'Helsinki' },
  AT: { name: 'Austria', flag: '🇦🇹', currency: 'EUR', capital: 'Vienna' },
  BE: { name: 'Belgium', flag: '🇧🇪', currency: 'EUR', capital: 'Brussels' },
  PT: { name: 'Portugal', flag: '🇵🇹', currency: 'EUR', capital: 'Lisbon' },
  GR: { name: 'Greece', flag: '🇬🇷', currency: 'EUR', capital: 'Athens' },
  CZ: { name: 'Czech Republic', flag: '🇨🇿', currency: 'CZK', capital: 'Prague' },
  RO: { name: 'Romania', flag: '🇷🇴', currency: 'RON', capital: 'Bucharest' },
  HU: { name: 'Hungary', flag: '🇭🇺', currency: 'HUF', capital: 'Budapest' },
  UA: { name: 'Ukraine', flag: '🇺🇦', currency: 'UAH', capital: 'Kyiv' },
  IL: { name: 'Israel', flag: '🇮🇱', currency: 'ILS', capital: 'Jerusalem' },
  AE: { name: 'UAE', flag: '🇦🇪', currency: 'AED', capital: 'Abu Dhabi' },
  CL: { name: 'Chile', flag: '🇨🇱', currency: 'CLP', capital: 'Santiago' },
  CO: { name: 'Colombia', flag: '🇨🇴', currency: 'COP', capital: 'Bogotá' },
  PK: { name: 'Pakistan', flag: '🇵🇰', currency: 'PKR', capital: 'Islamabad' },
  BD: { name: 'Bangladesh', flag: '🇧🇩', currency: 'BDT', capital: 'Dhaka' },
  NG: { name: 'Nigeria', flag: '🇳🇬', currency: 'NGN', capital: 'Abuja' },
};

// ── HTTP Status Codes ─────────────────────────────────────────────────
const STATUS_CODES = {
  200: 'OK — Request succeeded',
  201: 'Created — Resource created',
  202: 'Accepted — Request accepted for processing',
  204: 'No Content — Success with no body',
  301: 'Moved Permanently — Redirect (permanent)',
  302: 'Found — Redirect (temporary)',
  304: 'Not Modified — Cached version is still valid',
  400: 'Bad Request — Malformed request syntax',
  401: 'Unauthorized — Authentication required',
  403: 'Forbidden — Server understood but refuses access',
  404: 'Not Found — Resource does not exist',
  405: 'Method Not Allowed — HTTP method not supported',
  408: 'Request Timeout — Server timed out waiting',
  409: 'Conflict — Request conflicts with current state',
  413: 'Payload Too Large — Request entity too large',
  414: 'URI Too Long — URI exceeded length limit',
  415: 'Unsupported Media Type — Content type not supported',
  429: 'Too Many Requests — Rate limit exceeded',
  500: 'Internal Server Error — Unexpected server error',
  502: 'Bad Gateway — Invalid response from upstream',
  503: 'Service Unavailable — Server temporarily down',
  504: 'Gateway Timeout — Upstream server timed out',
};

// ── Color Utilities ───────────────────────────────────────────────────
function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  if (hex.length !== 6) return null;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return { r, g, b };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

// ── Random Data Generators ────────────────────────────────────────────
const FIRST_NAMES = ['James','Mary','John','Patricia','Robert','Jennifer','Michael','Linda','David','Elizabeth','William','Barbara','Richard','Susan','Joseph','Jessica','Thomas','Sarah','Charles','Karen'];
const LAST_NAMES = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin'];
const CITIES = ['New York','Los Angeles','Chicago','Houston','Phoenix','Philadelphia','San Antonio','San Diego','Dallas','Austin','London','Toronto','Sydney','Berlin','Tokyo','Mumbai','São Paulo','Seoul','Amsterdam','Singapore'];

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function randomData(type, count = 1) {
  const generators = {
    name: () => `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`,
    email: () => `${randomItem(['john','jane','alex','sam','mike','emma','alex','chris'])}.${randomItem(['smith','jones','wilson','brown','davis','garcia','martinez','lopez'])}@example.com`,
    city: () => randomItem(CITIES),
    country: () => { const codes = Object.keys(COUNTRIES); return randomItem(codes); },
    uuid: () => crypto.randomUUID(),
    color: () => '#' + crypto.randomBytes(3).toString('hex'),
    number: () => Math.floor(Math.random() * 10000),
    boolean: () => Math.random() > 0.5,
    sentence: () => {
      const words = ['the','quick','brown','fox','jumps','over','lazy','dog','in','the','garden','park','forest','mountain','river','lake','ocean','beach','city','town'];
      const len = 5 + Math.floor(Math.random() * 10);
      return Array.from({ length: len }, () => randomItem(words)).join(' ');
    },
  };
  const gen = generators[type];
  if (!gen) return { error: `Unknown type: ${type}. Available: ${Object.keys(generators).join(', ')}` };
  if (count > 1) return Array.from({ length: count }, gen);
  return gen();
}

// ── Request Handler ───────────────────────────────────────────────────
function handleRequest(req, res) {
  const url = new URL(req.url, `http://${HOST}:${PORT}`);
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const rl = checkRateLimit(ip);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  // Rate limit
  if (!rl.ok) {
    res.writeHead(429, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Rate limit exceeded', retryAfter: rl.retryAfter }));
  }

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // Auth check
  const apiKey = url.searchParams.get('api_key') || req.headers['x-api-key'] || '';
  if (API_KEY && apiKey !== API_KEY) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Invalid API key' }));
  }

  const rateInfo = { xRateLimitRemaining: rl.remaining, xRateLimitReset: Math.ceil((Date.now() + RATE_WINDOW) / 1000) };

  // Routes
  const path = url.pathname;
  const params = url.searchParams;

  // ── Health ──
  if (path === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json', ...rateInfo });
    return res.end(JSON.stringify({ status: 'ok', uptime: process.uptime(), version: '1.0.0' }));
  }

  // ── UUID ──
  if (path === '/uuid') {
    const count = Math.min(parseInt(params.get('count') || '1', 10) || 1, 100);
    res.writeHead(200, { 'Content-Type': 'application/json', ...rateInfo });
    return res.end(JSON.stringify({ uuid: count === 1 ? crypto.randomUUID() : Array.from({ length: count }, () => crypto.randomUUID()) }));
  }

  // ── Color Conversion ──
  if (path === '/color/hex-to-rgb') {
    const hex = params.get('hex');
    if (!hex) { res.writeHead(400, { 'Content-Type': 'application/json', ...rateInfo }); return res.end(JSON.stringify({ error: 'Missing hex param' })); }
    const rgb = hexToRgb(hex);
    if (!rgb) { res.writeHead(400, { 'Content-Type': 'application/json', ...rateInfo }); return res.end(JSON.stringify({ error: 'Invalid hex color' })); }
    res.writeHead(200, { 'Content-Type': 'application/json', ...rateInfo });
    return res.end(JSON.stringify({ hex, ...rgb, hsl: rgbToHsl(rgb.r, rgb.g, rgb.b) }));
  }

  if (path === '/color/rgb-to-hex') {
    const r = parseInt(params.get('r'), 10), g = parseInt(params.get('g'), 10), b = parseInt(params.get('b'), 10);
    if ([r, g, b].some(isNaN) || [r, g, b].some(v => v < 0 || v > 255)) {
      res.writeHead(400, { 'Content-Type': 'application/json', ...rateInfo });
      return res.end(JSON.stringify({ error: 'Invalid RGB values (0-255)' }));
    }
    const hex = rgbToHex(r, g, b);
    res.writeHead(200, { 'Content-Type': 'application/json', ...rateInfo });
    return res.end(JSON.stringify({ r, g, b, hex, hsl: rgbToHsl(r, g, b) }));
  }

  if (path === '/color/rgb-to-hsl') {
    const r = parseInt(params.get('r'), 10), g = parseInt(params.get('g'), 10), b = parseInt(params.get('b'), 10);
    if ([r, g, b].some(isNaN) || [r, g, b].some(v => v < 0 || v > 255)) {
      res.writeHead(400, { 'Content-Type': 'application/json', ...rateInfo });
      return res.end(JSON.stringify({ error: 'Invalid RGB values (0-255)' }));
    }
    const hsl = rgbToHsl(r, g, b);
    res.writeHead(200, { 'Content-Type': 'application/json', ...rateInfo });
    return res.end(JSON.stringify({ r, g, b, ...hsl }));
  }

  if (path === '/color/hsl-to-rgb') {
    const h = parseInt(params.get('h'), 10), s = parseInt(params.get('s'), 10), l = parseInt(params.get('l'), 10);
    if ([h, s, l].some(isNaN) || h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) {
      res.writeHead(400, { 'Content-Type': 'application/json', ...rateInfo });
      return res.end(JSON.stringify({ error: 'Invalid HSL values' }));
    }
    const rgb = hslToRgb(h, s, l);
    res.writeHead(200, { 'Content-Type': 'application/json', ...rateInfo });
    return res.end(JSON.stringify({ h, s, l, ...rgb, hex: rgbToHex(rgb.r, rgb.g, rgb.b) }));
  }

  // ── Country Data ──
  if (path === '/country') {
    const code = params.get('code');
    if (!code) {
      res.writeHead(200, { 'Content-Type': 'application/json', ...rateInfo });
      return res.end(JSON.stringify({ countries: Object.keys(COUNTRIES).map(c => ({ code: c, ...COUNTRIES[c] })) }));
    }
    const upper = code.toUpperCase();
    const country = COUNTRIES[upper];
    if (!country) {
      res.writeHead(404, { 'Content-Type': 'application/json', ...rateInfo });
      return res.end(JSON.stringify({ error: `Country code "${code}" not found` }));
    }
    res.writeHead(200, { 'Content-Type': 'application/json', ...rateInfo });
    return res.end(JSON.stringify({ code: upper, ...country }));
  }

  // ── HTTP Status Codes ──
  if (path === '/http-status') {
    const code = parseInt(params.get('code'), 10);
    if (code) {
      const desc = STATUS_CODES[code];
      if (desc) {
        res.writeHead(200, { 'Content-Type': 'application/json', ...rateInfo });
        return res.end(JSON.stringify({ code, description: desc }));
      }
      res.writeHead(404, { 'Content-Type': 'application/json', ...rateInfo });
      return res.end(JSON.stringify({ error: `Status code ${code} not found` }));
    }
    res.writeHead(200, { 'Content-Type': 'application/json', ...rateInfo });
    return res.end(JSON.stringify({ codes: STATUS_CODES }));
  }

  // ── JSON Format ──
  if (path === '/json/format') {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json', ...rateInfo });
      return res.end(JSON.stringify({ error: 'Use POST' }));
    }
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        const pretty = JSON.stringify(parsed, null, 2);
        const minified = JSON.stringify(parsed);
        res.writeHead(200, { 'Content-Type': 'application/json', ...rateInfo });
        res.end(JSON.stringify({ formatted: pretty, minified, keys: Object.keys(parsed).length }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json', ...rateInfo });
        res.end(JSON.stringify({ error: 'Invalid JSON: ' + e.message }));
      }
    });
    return;
  }

  // ── Base64 ──
  if (path === '/base64/encode') {
    const input = params.get('input');
    if (!input) { res.writeHead(400, { 'Content-Type': 'application/json', ...rateInfo }); return res.end(JSON.stringify({ error: 'Missing input param' })); }
    res.writeHead(200, { 'Content-Type': 'application/json', ...rateInfo });
    return res.end(JSON.stringify({ input, encoded: Buffer.from(input).toString('base64'), decoded: Buffer.from(input, 'base64').toString('utf8') }));
  }

  if (path === '/base64/decode') {
    const input = params.get('input');
    if (!input) { res.writeHead(400, { 'Content-Type': 'application/json', ...rateInfo }); return res.end(JSON.stringify({ error: 'Missing input param' })); }
    try {
      res.writeHead(200, { 'Content-Type': 'application/json', ...rateInfo });
      return res.end(JSON.stringify({ input, decoded: Buffer.from(input, 'base64').toString('utf8'), encoded: Buffer.from(input, 'base64').toString('base64') }));
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json', ...rateInfo });
      return res.end(JSON.stringify({ error: 'Invalid base64: ' + e.message }));
    }
  }

  // ── Random Data ──
  if (path === '/random') {
    const type = params.get('type') || 'uuid';
    const count = Math.min(parseInt(params.get('count') || '1', 10) || 1, 100);
    res.writeHead(200, { 'Content-Type': 'application/json', ...rateInfo });
    return res.end(JSON.stringify(randomData(type, count)));
  }

  // ── Password Strength ──
  if (path === '/password/strength') {
    const pw = params.get('password') || '';
    if (!pw) { res.writeHead(400, { 'Content-Type': 'application/json', ...rateInfo }); return res.end(JSON.stringify({ error: 'Missing password param' })); }
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (pw.length >= 16) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong', 'Excellent', 'Excellent+'];
    const label = labels[Math.min(score, 7)];
    res.writeHead(200, { 'Content-Type': 'application/json', ...rateInfo });
    return res.end(JSON.stringify({ password: pw.length > 0 ? '•'.repeat(Math.min(pw.length, 20)) : '', length: pw.length, score: `${score}/7`, label, suggestions: [
      pw.length < 12 && 'Use 12+ characters',
      !/[A-Z]/.test(pw) && 'Add uppercase letters',
      !/[a-z]/.test(pw) && 'Add lowercase letters',
      !/[0-9]/.test(pw) && 'Add numbers',
      !/[^a-zA-Z0-9]/.test(pw) && 'Add special characters (!@#$%)',
    ].filter(Boolean) }));
  }

  // ── IP Info (from headers) ──
  if (path === '/ip') {
    const forwarded = req.headers['x-forwarded-for'];
    const ipAddr = forwarded ? forwarded.split(',')[0].trim() : (req.socket.remoteAddress || '127.0.0.1');
    res.writeHead(200, { 'Content-Type': 'application/json', ...rateInfo });
    return res.end(JSON.stringify({ ip: ipAddr, forwarded, ua: req.headers['user-agent'] || '' }));
  }

  // ── User-Agent Parser ──
  if (path === '/ua/parse') {
    const ua = params.get('ua') || req.headers['user-agent'] || '';
    if (!ua) { res.writeHead(400, { 'Content-Type': 'application/json', ...rateInfo }); return res.end(JSON.stringify({ error: 'Missing ua param or User-Agent header' })); }
    const parse = (uaStr) => {
      const browser = uaStr.match(/(Chrome|Firefox|Safari|Edge|Opera|MSIE|Trident)/)?.[1] || 'Unknown';
      const os = uaStr.match(/(Windows|Mac|Linux|Android|iOS|iPhone|iPad)/)?.[1] || 'Unknown';
      const mobile = /Mobile|Android|iP(hone|od)|IEMobile/i.test(uaStr);
      return { browser, os, mobile, ua: uaStr.substring(0, 200) };
    };
    res.writeHead(200, { 'Content-Type': 'application/json', ...rateInfo });
    return res.end(JSON.stringify(parse(ua)));
  }

  // ── 404 ──
  res.writeHead(404, { 'Content-Type': 'application/json', ...rateInfo });
  res.end(JSON.stringify({
    error: 'Not found',
    endpoints: ['/health', '/uuid', '/color/hex-to-rgb', '/color/rgb-to-hex', '/color/rgb-to-hsl', '/color/hsl-to-rgb', '/country', '/http-status', '/json/format', '/base64/encode', '/base64/decode', '/random', '/password/strength', '/ip', '/ua/parse'],
    docs: 'See README.md for full documentation',
  }));
}

// ── Start Server ──────────────────────────────────────────────────────
const server = http.createServer(handleRequest);
server.listen(PORT, HOST, () => {
  console.log(`\n  🚀 devtools-api running at http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log(`  📡 ${Object.keys(STATUS_CODES).length} HTTP status codes | ${Object.keys(COUNTRIES).length} countries | 15 utility endpoints`);
  console.log(`  🔑 API_KEY set: ${API_KEY ? 'yes' : 'no (open mode)'}`);
  console.log(`  📋 Endpoints:`);
  console.log(`     GET /uuid?count=1      — Generate UUID(s)`);
  console.log(`     GET /color/hex-to-rgb?hex=fff  — Color conversion`);
  console.log(`     GET /country?code=US       — Country info + flag emoji`);
  console.log(`     GET /http-status?code=404  — HTTP status code info`);
  console.log(`     POST /json/format          — Format/minify JSON`);
  console.log(`     GET /base64/encode?input=  — Base64 encode/decode`);
  console.log(`     GET /random?type=uuid      — Random data generator`);
  console.log(`     GET /password/strength?password=  — Password strength`);
  console.log(`     GET /ip                    — Client IP info`);
  console.log(`     GET /ua/parse              — User-Agent parser`);
  console.log(`\n`);
});
